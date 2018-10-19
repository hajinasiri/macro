var express = require('express');
var router = express.Router();

var mapService = require('../services/map-service');
var dbVersion = require('../services/dbVersion'); //get get a row

/* GET maps listing. */
/*
 router.get('/', function(req, res, next) {
 res.send('respond with a resource');
 });
 */

router.get('/:collection/:localVersion', function(req, res, next) {
    var collection = req.params.collection;
    var localVersion = Number(req.params.localVersion);
    //1st check to see if client has an outdated version
    //if so, get the database and return it and version number
    //if not, indicate there is no data being returned.

    dbVersion.findOne(collection, (err, serverVersion) => {
        if (err) {
            console.error(err);
            res.redirect('/error');
        }
        else {
            if (serverVersion > localVersion) /* if client version of database for master_whatever is out of date */ {
                mapService.getAll(collection, req, res, function(err, doc) {
                    if (err || !doc.length) {
                        console.error(err);
                        res.redirect('/error');
                    }
                    else {
                        res.send({
                            serverVersion: serverVersion,
                            doc: doc,
                            data:true
                        });
                    }
                });
            } else {
                 res.send({
                            serverVersion: serverVersion,
                            doc: null,
                            data:false
                        });
            }
        }
    });

});

module.exports = router;
