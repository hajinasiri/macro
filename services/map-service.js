var mongoose = require('mongoose');
//exports.Collection = "dummy";
//var Map = require('../models/map').Map;
var MapSchema = require('../models/map').MapSchema;
//var Collection = null;

/**
 * This adds ONE row at a time. Whatever calls this is adding just one row at a time
 * Therefore, do not update the collection version everythimg this is called. Update it from
 * Whatever is calling it.
 **/
exports.addmap = function(map, collection, next) {
    if (!(/master|override/.test(collection))) {
        let err = "Collection name must contain master or override";
        return next(err);
    }
    var Map = mongoose.model(collection, MapSchema);
    //MapSchema.set('collection', collection);
    //if (mapService.Collection !== collection) {
    //    console.log("Map getting set to null. Old Collection: "+ mapService.Collection+ ". New Collection: "+ collection);
    /* I don't know how to do this any other way for now. If collection was already
    set and we have a different collection to send data to then this will re-load Map */
    //   Map = null;
    // }
    //exports.Collection = collection;
    // Map === null ? Map  : {};
    var newmap = new Map({
        id: map.id,
        rowNumber: map.rowNumber,
        doc: JSON.stringify(map.doc)

    });

    newmap.save((err) => {
        if (err) {
            return next(err);
        }



    });
};

exports.getmap = function(collection, req, res, next) {
    if (!(/master|override/.test(collection))) {
        let err = "Collection name must contain master or override";
        return next(err);
    }
    var Map = mongoose.model(collection, MapSchema);
    //MapSchema.set('collection', collection);
    // if (mapService.Collection !== collection) {
    /* I don't know how to do this any other way for now. If collection was already
    set and we have a different collection to send data to then this will re-load Map */
    //    Map = null;
    // }
    // exports.Collection = collection;
    // Map === null ? Map = require('../models/map').Map : {};
    //TODO: In future, code the mapId to just get the data for a certain SVG file
    Map.find({}).sort({
        rowNumber: 1
    }).exec(function(err, docs) {
        if (err) {
            return next(err);
        }
        for (var i = 0; i < docs.length; i++) {
            if (typeof(docs[i].doc) == "string") {
                docs[i].doc = JSON.parse(docs[i].doc);
            }
        }
        res.send(docs);

    });
};

exports.removeAll = function(collection, next) {
    if (!(/master|override/.test(collection))) {
        let err = "Collection name must contain master or override";
        return next(err);
    }
    var Map = mongoose.model(collection, MapSchema);

    Map.remove({}, function(err) {
        // if (err) {
        return next(err);
        // }
    });
};


exports.updateRow = function(collection, id, data, next) {
    if (!(/master|override/.test(collection))) {
        let err = "Collection name must contain master or override";
        return next(err);
    }
    var map = mongoose.model(collection + 's', MapSchema);
    //var decodedData = JSON.parse(data); //need to keep stringified to maintain order of fields
    map.update({
        id: id
    }, {
        $set: {
            doc: data /*decodedData */
        }
    }, function(err, raw) {
        if (err) {
            console.error("failed to update row. err: " + err);
            return next(err, "failed to update row");
        }
        else
        if (raw.nModified < 1) {
            return next(new Error("No rows were updated"), "failed to update row");
        }
        console.log('The raw response from Mongo was ', raw);
        next(null, 200);
    });
};

//This is used by socket.io
exports.findOne = function(collection, id, next) {
    // if (!(/master|override/.test(collection))) {
    //     let err = "Collection name must contain master or override";
    //     return next(err, null);
    // }
    var Map = mongoose.model(collection, MapSchema);

    Map.findOne({
        id: id
    }, function(err, doc) {
        if (!doc) {
            return next(err, null);
        }
        else {
            if (doc && typeof(doc.doc) == "string") { //we are testing for string becasue legacy code saved as a json, not a stringified json
                doc.doc = JSON.parse(doc.doc);
            }
            next(err, doc);
        }
        /* var returnVal = {err:null, doc:null};
         if (err) {
             returnVal.err = err;
             return next(err,doc);
         }
         returnVal.doc = doc;
         return returnVal;*/
    });
};

/* Like getMap() but this does not send data directly back to browser */
exports.getAll = function(collection, req, res, next) {
    if (!(/master|override/.test(collection))) {
        let err = "Collection name must contain master or override";
        return next(err, null);
    }
    var Map = mongoose.model(collection, MapSchema);
    //MapSchema.set('collection', collection);
    // if (mapService.Collection !== collection) {
    /* I don't know how to do this any other way for now. If collection was already
    set and we have a different collection to send data to then this will re-load Map */
    //    Map = null;
    // }
    // exports.Collection = collection;
    // Map === null ? Map = require('../models/map').Map : {};
    //TODO: In future, code the mapId to just get the data for a certain SVG file
    Map.find({}).sort({
        rowNumber: 1
    }).exec(function(err, doc) {
        if (!err) {
            for (var i = 0; i < doc.length; i++) {
                if (typeof(doc[i].doc) == "string") {
                    doc[i].doc = JSON.parse(doc[i].doc);
                }
            }
        }
        next(err, doc);

    });
};
