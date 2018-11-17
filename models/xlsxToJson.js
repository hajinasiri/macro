//  ==========
//  = Convert Excel's xlsx file to Json.  By Larry Maddocks July 1 2015 =
//  ==========
var express = require('express');
var router = express.Router();
var mapService = require('../services/map-service');
xlsxj = require("xlsx-to-json");

exports.xlsjToJson = function(pathToxlsxFile, next) {
    xlsxj({
        input : __dirname + pathToxlsxFile,
        output : null //__dirname + '/output.json'
    }, function(err, result) {
        if (err) {
            console.error(err);
        } else {
            for (var i = 0; i < result.length; i++) {
                var row = result[i];
                mapService.addmap(row, function(err) {
                    if (err) {
                        console.error(err);
                        res.redirect('/import');
                    }
                });

            }
            console.log(result);
        }
    });

};