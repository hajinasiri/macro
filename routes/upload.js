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
var xlsxj = require("xlsx-to-json");
var mapService = require('../services/map-service');
//var mongoXlsx = require("mongo-xlsx");
var dbVersion = require('../services/dbVersion'); //to update row in map dbVersion database
//var hbs = require('hbs');
//hbs.handlebars === require('handlebars');
const fs = require('fs');
var path = require('path');




/* GET home page. */
router.get('/', restrict, function(req, res, next) {
    /**
     * Was getting this error when using a folder in the url as a parameter:   "Refused to apply style from" "because its
     * MIME type ('text/html') is not a supported stylesheet MIME type"
     * Found someone talking about this on stackoverflow, but it was in Spanish, plus the fix is too complicated
     * for using a folder as a parameter in the url. So I will have user insert folder in a form field.
     **/
    //router.get('/:collection', function(req, res, next) {
    // var collection = req.params.collection;
    //  if (!(/master/.test(collection))) {
    //         let err = "Invalid Collection: "+ collection;
    //         console.error();
    //         let vm = {
    //             messageTitle: 'Error',
    //             layout: 'simpleLayout',
    //             serverMessage: err
    //         };
    //         console.error("Incorrect collection.");
    //         res.redirect('/error');

    //     }
    return res.render('admin/importSpread', {
        title: 'Import Data or SVG',
        layout: 'simpleLayout',
        baseUrl: JSON.stringify(req.baseUrl)
        //,collection:'master_test3'
    });
});


module.exports = router;