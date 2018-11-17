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
    var text = req.body.scriv;
    console.log();
    // var zip = new AdmZip(req.body.scriv);
    // var zipEntries = zip.getEntries();
    // // zip = JSON.parse(zip);
    // var templateVar = {data:"hello"};
    // return res.render('admin/info',templateVar);
});


module.exports = router;


