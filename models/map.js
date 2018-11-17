//var mapService = require('../services/map-service');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var mapSchema = new Schema({
    id: {
        type: String,
        index: true
    },
    rowNumber: {
        type: Number,
        index: true

    },
    doc: Object,

    created: {
        type: Date,
        default: Date.now
    }
});
//var Map = mongoose.model(mapService.Collection, mapSchema);


module.exports = {

    MapSchema: mapSchema
};
