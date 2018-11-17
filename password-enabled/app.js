var express = require('express');
var path = require('path');
//uncomment this out when you get the icon
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var config = require('./config');
var routes = require('./routes/index');
//var home = require('./routes/home');
var importSpread = require('./routes/importSpread');
var importSVG = require('./routes/importSVG');
var importSuccess = require('./routes/importSuccess');
var basicsvg = require('./routes/basicsvg');
var mapdata = require('./routes/mapdata');
var filedata = require('./routes/filedata');
var basicAuth = require('basic-auth-connect');
mongoose.connect(config.mongoUri);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
//user and passwd
app.use(basicAuth('guest', 'chess'));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
//app.use('/maps', maps);
//app.use('/home', home);
app.use('/importSuccess', importSuccess);
app.use('/importSpread', importSpread);
app.use('/importSVG', importSVG);
app.use('/mapdata', mapdata);
app.use('/filedata', filedata);
app.use('/basicsvg', basicsvg); //displays the old version -- the basic version of the map display
//TODO: Add this -> app.use('/admin', admin);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
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
