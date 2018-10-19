var express = require('express');
var router = express.Router();
//xlsxj = require("xlsx-to-json");
//var mapService = require('../services/map-service');

/* GET maps listing. */
/*
 router.get('/', function(req, res, next) {
 res.send('respond with a resource');
 });
 */

router.get('/', function(req, res, next) {
    var vm = {
        title : 'Success Importing Spreadsheet to Database'
    };
   
    res.render('importSuccess', vm);
});

/*
 router.post('/create', function(req, res, next) {
 mapService.addmap(req.body, function(err) {
 if (err) {
 var vm = {
 title: 'Create an account',
 input: req.body,
 error: 'Something went wrong'
 };
 delete vm.input.password;
 return res.render('maps/create', vm);
 }
 res.redirect('/home');
 });
 });
 */

module.exports = router;
