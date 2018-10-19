/* does the old svg display without the fancy sub layers */
/*  TODO:  Junk this. It does not work */
var express = require('express');
var router = express.Router();
var mapService = require('../services/map-service');


router.get('/', function(req, res, next) {
    
    var vm = {
        title : 'basic map display',
        svgFileName: 'mysvg.svg'
    };
   
    res.render('basicsvg', vm);
});

module.exports = router;
