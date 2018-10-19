/**
 * This code was originally copy and pasted from the file, "importSpread.js",
 * which was written by Larry Maddocks
 * This will allow the designer to upload a file to a folder, if she has the correct credientials.
 * The command, "import" must be proceeded by the path of the folder that the file should be inserted
 * into. I.e., http://gsap.com/my/folder/import
 **/
var express = require('express');
var router = express.Router();
var restrict = require('../auth/restrict');
var multer = require("multer");
//var xlsxj = require("xlsx-to-json");
//var mapService = require('../services/map-service');
//var mongoXlsx = require("mongo-xlsx");
//var dbVersion = require('../services/dbVersion'); //to update row in map dbVersion database
//var hbs = require('hbs');
//hbs.handlebars === require('handlebars');
const fs = require('fs');
const path = require('path');


var unauthStatic = express.static(path.join(__dirname, '../public'));
var authStatic = path.join(__dirname, '../authorized');


/* GET home page. */
router.get('/', restrict, function(req, res, next) {
    /**
     * Was getting this error when using a folder in the url as a parameter:   "Refused to apply style from" "because its 
     * MIME type ('text/html') is not a supported stylesheet MIME type"
     * Found someone talking about this on stackoverflow, but it was in Spanish, plus the fix is too complicated 
     * for using a folder as a parameter in the url. So I will have user insert folder in a form field.
     **/

    return res.render('admin/importFile', {
        title: 'Import File',
        layout: 'simpleLayout',
        baseUrl: JSON.stringify(req.baseUrl)
        //,collection:'master_test3'
    });
});


/**
 * Looks in list to see if key is in there. If so returns true
 **/
function inList(list, key) {
    return list.split(',').indexOf(key) > -1
}

// Set The Storage Engine
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        if (req.dynamicDestination) {
            cb(null, req.dynamicDestination);
        }
        else cb("Error determining destination of file");

    },
    filename: function(req, file, cb) {
        cb(null, file.originalname /* + '-' + Date.now() + path.extname(file.originalname) */ );
    }
});

// Init Upload
const upload = multer({
    limits: { fileSize: 10000000 },
    fileFilter: function(req, file, cb) {
        checkFileTypeAndPermissions(req, file, cb);
    },
    storage: storage
}).single('myFile'); //This tag, "myFile" MUST match the form input name attribute in the importFile.hbs file

//Get destination folder of where spreadsheet file is sent to
function destination(req, file) {
    var pathToConfigFile = req.params.path;
    //Now get the config.json data to get the collection name
    pathToConfigFile !== undefined ? pathToConfigFile = pathToConfigFile.replace(/slshslash/g, "\/") : pathToConfigFile = null; //instead of a "/" I replaced it with "slshslash" so it doesn't count as another parameter. This line changes it back to the slash ("/")
    if (pathToConfigFile) {
        var dynamicDestination = authStatic + "/" + pathToConfigFile;
        req.pathToConfigFile = pathToConfigFile; //insert this value in req so I can use it later on in checkFileTypeAndPermissions()
        req.dynamicDestination = dynamicDestination; //insert this in req so I can access it later on
        return pathToConfigFile; // successfully found destination. Code was this: cb(null, dynamicDestination);
    }
    else return null; //cb("Error determining destination of file");
}

// Check File Type and permissions
function checkFileTypeAndPermissions(req, file, cb) {
    // Allowed ext
    const filetypes = /svg|txt|js|css|html|md|json|xlsx|ai|jpeg|jpg|png|gif|scriv/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (!extname) {
        return cb('Error: Incorrect file extension!');
    }
    // Check mime
    const mimetype = filetypes.test(file.mimetype);
    if (!mimetype) {
        return cb('Error: Incorrect file mimetype!');
    }
    var pathToConfigFile = destination(req, file); //set destination

    var permissions = req.user._doc.doc.permissions;
    if (!(inList(permissions, 'admin') || inList(permissions, 'editor') || inList(permissions, 'designer'))) {
        //  return res.redirect('/'); // not found
        return cb('Invalid permission.');

    }
    //now if user is a designer make sure he has permission to write to this folder.
    else if (inList(permissions, 'designer')) {
        var authorizedFolders = req.user._doc.doc.hasOwnProperty("folders") ? req.user._doc.doc.folders : "";

        if (pathToConfigFile) {
            var mainUrlFolder = req.pathToConfigFile; // pathToConfigFile is just the path before the command where user wants to send file to.
            var firstFolder = mainUrlFolder.split("/").slice(0, 1).toString(); //get first folder (or directory) in the url string
            if (!(authorizedFolders.split(',').indexOf(firstFolder) > -1)) {
                //only compare the first folder, which would be > -1 if it were a match.
                return cb('Folder Not Available. Please check with your administrator for access to folder: ' + firstFolder);

            }
            else {
                return cb(null, true); //yea! The user is authorized to write file to this folder!!
            }
        }
        else {
            cb("Error determining destination of file");
        }

    }

    return cb(null, true); //this is an admin or editor and can write file to any folder.
}


//var upload = multer({ dest: './import' });
//router.use(express.static(path.join(__dirname, '../authorized')));
//var upload = multer({ storage : storage}).single('xlsx');
//after posting a spreadsheet file to upload, which will be saved in this folder
//and then inserted into the database.  DO NOT CHANGE THIS FROM import!!
router.post('/:path', restrict, function(req, res, next) {

    upload(req, res, function(err) {
            if (err) {
                res.json({
                    status: "error",
                    msg: err
                });
            }
            else
                res.json({
                    status: "Success"
                });



        } //upload(req, res, function(err) {
    );
});
module.exports = router;
