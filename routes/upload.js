/**
 * This will load in a spreadsheet and replace the collection with the data in the
 * spreadsheet.
 * It knows what the colection is because it uses the path before the "spreadSheet"
 * command to lookup the config file in that path, and pull out the collection name, which
 * should always contain the characters, "master"
 * Written by Larry Madocks
 **/
var express = require('express');
var router = express.Router();
var restrict = require('../auth/restrict');
var multer = require("multer");
var AdmZip = require('adm-zip');//to open the zip file
var xlsxj = require("xlsx-to-json");
var mapService = require('../services/map-service');
//var mongoXlsx = require("mongo-xlsx");
var dbVersion = require('../services/dbVersion'); //to update row in map dbVersion database
//var hbs = require('hbs');
//hbs.handlebars === require('handlebars');
const fs = require('fs');
var path = require('path');


var unauthStatic = express.static(path.join(__dirname, '../public'));
var authStatic = path.join(__dirname, '../authorized');



/* GET home page. */
router.get('/', restrict, function(req, res, next) {

    return res.render('upload', {
        title: 'Import Data or SVG',
        layout: 'simpleLayout',
        baseUrl: JSON.stringify(req.baseUrl)
        //,collection:'master_test3'
    });
});


router.post('/', restrict, function(req, res, next) {

    var file = req.files.scriv;
    var filename = file.name;
    file.mv(filename,function(err){//Writing the zip file to the server side
        if(err){
            console.log(err);
        }
    })
    var fullpath = __dirname;//Gets the absoult path of this JS file
    var extract = require('extract-zip')
    extract('./'+filename, {dir: fullpath}, function (err) {//Extracts the zip file to a scriv file in the current folder
        if(err){console.log(err)}
        fs.unlinkSync(filename);//deletes the zip file
    })



    // var templateVar = {data:"hello"};
    // return res.render('admin/info',templateVar);
});


module.exports = router;