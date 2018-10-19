var express = require('express');
var router = express.Router();
var xlsxj = require("xlsx-to-json");
var mapService = require('../services/map-service');

/* GET maps listing. */
/*
 router.get('/', function(req, res, next) {
 res.send('respond with a resource');
 });
 */

router.get('/', function(req, res, next) {
    var vm = {
        title : 'Import Excel Spreadsheet to Database'
    };
   
    res.render('import', vm);
});



module.exports = router;
