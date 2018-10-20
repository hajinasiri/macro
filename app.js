var express = require('express');
var helmet = require('helmet'); //Help secure Express apps with various HTTP headers
var path = require('path');
//uncomment this out when you get the icon
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser'); //Parse incoming request bodies in a middleware before your handlers, available under the req.body property
var mongoose = require('mongoose');
var mapService = require('./services/map-service'); //to update row in map database

// ************ For login ************
var passport = require('passport');
var expressSession = require('express-session');
var flash = require('connect-flash');
var connectMongo = require('connect-mongo');
var MongoStore = connectMongo(expressSession);

var config = require('./config');
var routes = require('./routes/index');
// Try this on 2/6/17
//var authorized = require('./authorized/index');
//var authMaps = require('./authorized/authMaps');

//end of new stuff for authorized 
var login = require('./routes/login');
var users = require('./routes/users');
//var arcadis = require('./routes/arcadis');
var home = require('./routes/home');
var maps = require('./routes/maps');

var passportConfig = require('./auth/passport-config');
var restrict = require('./auth/restrict');
passportConfig();

var socketio = require('socket.io');
var passportSocketIo = require('passport.socketio');

// ************* End login stuff



//var home = require('./routes/home');
var importSpread = require('./routes/importSpread');
var upload = require('./routes/upload');
var importFile = require('./routes/import');

var importSVG = require('./routes/importSVG');
var importSuccess = require('./routes/importSuccess');
//var basicsvg = require('./routes/basicsvg'); //this is not used at all right now.
var mapdata = require('./routes/mapdata');
var filedata = require('./routes/filedata');

var mapDbEditor = require('./routes/mapDbEditor');
var mongoToXlsx = require('./routes/mongoToXlsx');
var preProcessSvg = require('./routes/preProcessSvg');

var admin = require('./routes/admin');
var formApi = require('./routes/formApi');
var formbuilder = require('./routes/formbuilder');


//New authorized and unauthorized public stuff
var unauthStatic = express.static(path.join(__dirname, 'public'));
var authStatic = express.static(path.join(__dirname, 'authorized'));

mongoose.connect(config.mongoUri, { config: { autoIndex: false } });
//var db = mongoose.createConnection(config.mongoUri);
//var db2 = db.useDb('sm');

var app = express();
app.locals.http = require('http');
app.locals.server = app.locals.http.Server(app);
var io = socketio(app.locals.server);
app.locals.io = io;
app.io = io;

app.use(helmet()); //Help secure Express apps with various HTTP headers

app.use('/', unauthStatic);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

//app.use(logger('dev'));


// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));

app.use(logger('dev'));
//app.use(bodyParser.json());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({
    limit: "50mb",
    extended: false
}));
//app.use(bodyParser.text({limit: 99000}));
app.use(bodyParser.text({ limit: "50mb" })); //new. Trying to handle xml data

//app.use(bodyParser.raw({limit: 90000}));
//app.use(bodyParser.urlencoded({limit: 90000, extended:false}));
//app.use(bodyParser.json({limit: 90000}));
app.use(cookieParser());
var sessionStore = new MongoStore({
    mongooseConnection: mongoose.connection
});
app.use(expressSession({
    secret: 'tart stop grape##',
    saveUninitialized: false,
    resave: false,
    store: sessionStore
}));
io.use(passportSocketIo.authorize({
    key: 'connect.sid',
    // secret: process.env.SECRET_KEY_BASE,
    secret: 'tart stop grape##',
    store: sessionStore,
    passport: passport,
    cookieParser: cookieParser
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

//New authorized and unauthorized public stuff
//app.use('/authMaps',authMaps); //new authorized  stuff to access map database from authorized folder.
app.use('/login', login);
app.use('/users', users);
//app.use('/arcadis', arcadis);
app.use('/maps', maps);
app.use('/home', home);
app.use('/importSuccess', importSuccess);
app.use(/.*\/importSpread/, importSpread); //don't let user just send in only importSpread command. Must have a path before importSpread
app.use(/.*\/upload/,upload);
//app.use(/\/importSpread\/.+/, importSpread); //don't let user just send in only importSpread command. Must have a path before importSpread
//app.use('/importSpread', importSpread); //don't let user just send in only importSpread command. Must have a path before importSpread

app.use(/.*\/import/, importFile); //don't let user just send in just import. Must have a path before import
app.use('/importSVG', importSVG);
app.use('/mapdata', mapdata);
app.use('/filedata', filedata);
app.use('/admin', admin);
app.use('/mapDbEditor', mapDbEditor);
app.use('/mongoToXlsx', mongoToXlsx);
app.use('/preProcessSvg', preProcessSvg);

app.use('/formApi', formApi);
app.use('/formbuilder', formbuilder); //this will open the form builder app that will allow designer to create a form, then save the json to the server
//app.use('/basicsvg', basicsvg); //displays the old version -- the basic version of the map display
app.use('/', function(req, res, next) {
    if (!req.isAuthenticated()) {
        console.log("url: " + req.url);
        //return next();
        res.redirect("/login");
        //return res.redirect('/');
        return;
    }

    if (req.url === '/') {
        return res.redirect("/home");
    }
    else {
        //if the user is an admin, do not care if they do not have folder permissions. Let them access every folder
        if (!req.user._doc.hasOwnProperty("doc")) {
            res.render('error', {
                message: 'User has no permissions defined',
                error: {}
            });
        }
        if (!req.user._doc.doc.hasOwnProperty("permissions")) {
            res.render('error', {
                message: 'User has no permissions defined',
                error: {}
            });
        }
        var permissions = req.user._doc.doc.permissions;
        var authorizedFolders = req.user._doc.doc.hasOwnProperty("folders") ? req.user._doc.doc.folders : "";
        var mainUrlFolder = req.originalUrl;
        
        /**
         * Note: there are two commands that try to simulate a virtual file in a path. 
         * Those paths are really parameters that proceed the commend.
         * The two commands currently are importSpread and import/ Here is an example:
         * https://get-started-genealogy.c9users.io/macro/alpha/importSpread
         * We need to test that the designer has permission to access these folders.
         *
         **/ 
        if (mainUrlFolder === "/importSpread") {
            var vm = {
                title: 'Error Message',
                message: 'Error: importSpread must be preceeded by folders.'
            };
            return res.render('users/message', vm);
        }
        else if (mainUrlFolder === "/import") {
            var vm = {
                title: 'Error Message',
                message: 'Error: import must be preceeded by folders.'
            };
            return res.render('users/message', vm);
        }

        var firstFolder = mainUrlFolder.split("/").slice(1, 2).toString(); //get first folder (or directory) in the url string
        
        //we need to do more granular checking in the actual route module if there needs to be more restrictive folder permissions, such as the import command
        if ((permissions.split(',').indexOf('admin') > -1) || (permissions.split(',').indexOf('editor') > -1) || (permissions.split(',').indexOf('designer') > -1)) {
            //this is an admin, so don't worry if there are missing folders
            authStatic(req, res, () => {
                res.status(204).end(); //was 204
            });
            //() => {
            //    console.log('Back from authStatic');
            //}); // found 
            //res.end();
        }
        else if (authorizedFolders.split(',').indexOf(firstFolder) > -1) {
            //only compare the first folder, which would be > -1 if it were a match.
            authStatic(req, res, () => {
                res.status(204).end(); //was 204
            }); // found 
        }
        else {
            // let vm = {
            //     messageTitle: 'Folder Not Available',
            //     serverMessage: 'Please check with your administrator for access to ' + firstFolder
            // };
            // res.render('./views/home/index', vm);

            // res.status(err.status || 500);
            res.render('error', {
                message: 'Folder Not Available. Please check with your administrator for access to folder: ' + firstFolder,
                error: {}
            });

            //res.redirect("/home"); //TODO: This does not work.
        }
        return;
    }
});

// ************************

//var eventSocket = app.locals.io.of('/submitmapdb');
// on connection event
// io.on('connection', function(socket) {
//     //socket.emit('connect', null); //don't need this because one gets sent automatically. (send an event back to client that they connected successfully)
//     // example 'event1', with an object. Could be triggered by socket.io from the front end
//     socket.on("getRow", function(msg) {
//         console.log("getRow: " + msg.collection);
//         var collection = msg.collection; //what database to put this in. I would guess usually the master_folder

//         mapService.findOne(collection, msg.id, (err, data) => {
//             if (err || data === null) {

//                 if (err) {
//                     console.error(err)
//                 }
//                 else {
//                     err = "No data returned from findOne. Collection or row is missing. collection: " + collection + "  id: " + msg.id;
//                     socket.emit('event_msg_error', err);
//                     console.error(err);
//                 }
//             }
//             else {
//                 socket.emit('msg_response', data.doc);
//                 console.log('success in getRow. collection: ' + collection + "id: " + msg.id);
//             }
//         });

//     });
//     socket.on('updateRow', function(data) {
//         // user data from the socket.io passport middleware
//         //if (socket.request.user && socket.request.user.logged_in) {
//         //console.log(socket.request.user);
//         var collection = data.collection; //what database to put this in. I would guess usually the override_folder
//         //The data coming in will in this form:
//         //   {
//         //       _collection: collection,
//         //       _id: id,
//         //       data: { id:id,
//         //               moreMapFields:moreMapFields
//         //       }

//         //   }
//         mapService.updateRow(collection, data.id, data, (err, status) => {
//             if (err) {
//                 socket.emit('event_msg_error', err);
//                 console.error('error in updateRow: ' + err + " collection: " + collection + "id: " + data.id);
//                 //res.redirect('/error');
//             }
//             else {
//                 socket.emit('msg_response', status);
//                 console.log('success in updateRow: ' + status + " collection: " + collection + "id: " + data.id);
//             }
//         });
//         //}
//     });
// });

app.use('/', routes);



//app.use('/emailVerification', emailVerification);

//app.use(express.static(path.join(__dirname, 'public')));


// catch 404 and forward to error handler
app.use(function(req, res, next) {

    var err = new Error('Not Found');
    err.status = 404;
    res.status(404).send("Sorry can't find that page!");
    //next(err);


});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
