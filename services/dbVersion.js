var mongoose = require('mongoose');
//exports.Collection = "dummy";
//var Map = require('../models/map').Map;
var DbVersionSchema = require('../models/dbVersion').DbVersionSchema;
//var Collection = null;


exports.addRow = function(dbVersion, next) {
    // if (!(/master|override/.test(collection))) {
    //     let err = "Collection name must contain master or override";
    //     return next(err);
    // }
    var DbVersion = mongoose.model('lastUpdatedDb', DbVersionSchema);
    //MapSchema.set('collection', collection);
    //if (mapService.Collection !== collection) {
    //    console.log("Map getting set to null. Old Collection: "+ mapService.Collection+ ". New Collection: "+ collection);
    /* I don't know how to do this any other way for now. If collection was already
    set and we have a different collection to send data to then this will re-load Map */
    //   Map = null;
    // }
    //exports.Collection = collection;
    // Map === null ? Map  : {};
    var newDbVersion = new DbVersion({
        dbName: dbVersion.dbName,
        dbVersion: dbVersion.dbVersion
    });

    newDbVersion.save(function(err) {
        if (err) {
            return next(err);
        }
        next(null);
    });
};

//This file was copied from the map-service.js code.  I do not think I will need this function, which returns all
//data in the version collection.
// exports.getAllRows = function(req, res, next) {
//     // if (!(/master|override/.test(collection))) {
//     //     let err = "Collection name must contain master or override";
//     //     return next(err);
//     // }
//      var DbVersion = mongoose.model('lastUpdatedDb', DbVersionSchema);
//     //MapSchema.set('collection', collection);
//     // if (mapService.Collection !== collection) {
//     /* I don't know how to do this any other way for now. If collection was already
//     set and we have a different collection to send data to then this will re-load Map */
//     //    Map = null;
//     // }
//     // exports.Collection = collection;
//     // Map === null ? Map = require('../models/map').Map : {};
//     //TODO: In future, code the mapId to just get the data for a certain SVG file
//     DbVersion.find({}).exec(function(err, docs) {
//         if (err) {
//             return next(err);
//         }
//         // for (var i = 0; i < docs.length; i++) {
//         //     if (typeof(docs[i].doc) == "string") {
//         //         docs[i].doc = JSON.parse(docs[i].doc);
//         //     }
//         // }
//         res.send(docs);

//     });
// };

exports.removeAll = function(next) {
    // if (!(/master|override/.test(collection))) {
    //     let err = "Collection name must contain master or override";
    //     return next(err);
    // }
    var DbVersion = mongoose.model('lastUpdatedDb', DbVersionSchema);

    DbVersion.remove({}, function(err) {
        // if (err) {
        return next(err);
        // }
    });
};


exports.updateRow = (dbName, next) => {
    // if (!(/master|override/.test(collection))) {
    //     let err = "Collection name must contain master or override";
    //     return next(err);
    // }


    var DbVersion = mongoose.model('lastUpdatedDbs', DbVersionSchema);
    //var decodedData = JSON.parse(data); //need to keep stringified to maintain order of fields

    var query = {
        dbName: dbName
    };
    var update = {
        $inc: {
            dbVersion: 1
        }
    };
    var options = {
        new: true
    };
    DbVersion.findOneAndUpdate(query, update, options, (err, doc) => {
        if (!err && !doc) {
            return next("failed to update row", null);
        }
        else
        if (err) {
            console.error("failed to update row. err: " + err);
            return next(err, "failed to update row");
        }
        else
        if (doc && doc.nModified < 1) {
            return next(new Error("No rows were updated"), "failed to update row");
        }
        console.log('The raw response from Mongo was ', doc);
        next(null, doc.dbVersion); //TODO: change this to return the updated version number
        // next(null, 200); //TODO: change this to return the updated version number
    });

    // DbVersion.update({
    //     dbName: dbName
    // }, {
    //     $inc: {
    //         dbVersion: 1
    //     }
    // }, function(err, raw) {
    //     if (err) {
    //         console.error("failed to update row. err: " + err);
    //         return next(err, "failed to update row");
    //     }
    //     else
    //     if (raw.nModified < 1) {
    //         return next(new Error("No rows were updated"), "failed to update row");
    //     }
    //     console.log('The raw response from Mongo was ', raw);
    //     next(null, 200); //TODO: change this to return the updated version number
    // });
};





//This is used by socket.io
exports.findOne = function(collection, next) {
    // if (!(/master|override/.test(collection))) {
    //     let err = "Collection name must contain master or override";
    //     return next(err, null);
    // }
    var DbVersion = mongoose.model('lastUpdatedDb', DbVersionSchema);

    DbVersion.findOne({
        dbName: collection
    }, (err, dbVersion) => {
        if (err || (!err && !dbVersion)) {
            //probably an empty collection. Add a row. Use 1 as the default version, so client that sends in a 0 knows it needs updated version
            exports.addRow({
                dbName: collection,
                dbVersion: 1
            }, (err) => {
                next(err, 1);
            });

        }


        // if (typeof(doc.doc) == "string") { //we are testing for string becasue legacy code saved as a json, not a stringified json
        //     doc.doc = JSON.parse(doc.doc);
        // }
        else
            next(err, dbVersion._doc.dbVersion);
        
    });
};

/* Like getMap() but this does not send data directly back to browser */
// exports.getAll = function(collection, req, res, next) {
//     if (!(/master|override/.test(collection))) {
//         let err = "Collection name must contain master or override";
//         return next(err, null);
//     }
//     var Map = mongoose.model(collection, MapSchema);
//     //MapSchema.set('collection', collection);
//     // if (mapService.Collection !== collection) {
//     /* I don't know how to do this any other way for now. If collection was already
//     set and we have a different collection to send data to then this will re-load Map */
//     //    Map = null;
//     // }
//     // exports.Collection = collection;
//     // Map === null ? Map = require('../models/map').Map : {};
//     //TODO: In future, code the mapId to just get the data for a certain SVG file
//      Map.find({}).sort({
//         rowNumber: 1
//     }).exec(function(err, doc) {
//         if (!err) {
//             for (var i = 0; i < doc.length; i++) {
//                 if (typeof(doc[i].doc) == "string") {
//                     doc[i].doc = JSON.parse(doc[i].doc);
//                 }
//             }
//         }
//         next(err, doc);

//     });
// };
