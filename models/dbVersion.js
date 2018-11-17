//var mapService = require('../services/map-service');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//This stores the database names and version numbers so we know if client needs to download the latest version
var dbVersionSchema = new Schema({
    dbName: {
        type: String,
        index: true
    },
    dbVersion: {
        type: Number,
        index: false

    }
});
//var Map = mongoose.model(mapService.Collection, mapSchema);


module.exports = {

    DbVersionSchema: dbVersionSchema
};
