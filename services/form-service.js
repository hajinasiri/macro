var mongoose = require('mongoose');
//exports.Collection = "dummy";
//var Form = require('../models/form').Form;
var FormSchema = require('../models/forms').FormSchema;
//var Collection = null;

/**
 * This adds ONE row at a time. Whatever calls this is adding just one row at a time
 * Therefore, do not update the collection version everythimg this is called. Update it from
 * Whatever is calling it.
 **/
exports.addform = function(form, collection, userEmail, next) {
    // if (!(/master|override/.test(collection))) {
    //     let err = "Collection name must contain master or override";
    //     return next(err);
    // }
    var Form = mongoose.model(collection, FormSchema);
    //FormSchema.set('collection', collection);
    //if (formService.Collection !== collection) {
    //    console.log("Form getting set to null. Old Collection: "+ formService.Collection+ ". New Collection: "+ collection);
    /* I don't know how to do this any other way for now. If collection was already
    set and we have a different collection to send data to then this will re-load Form */
    //   Form = null;
    // }
    //exports.Collection = collection;
    // Form === null ? Form  : {};
    var newform = new Form({
        id: form.id,
        isBlank: form.isBlank,
        userEmail,
        doc: JSON.stringify(form.doc)

    });

    newform.save((err) => {

        if (err) {
            return next(err);
        }
        else {
            return next(null, 200);
        }



    });
};

exports.getform = function(collection, req, res, next) {
    // if (!(/master|override/.test(collection))) {
    //     let err = "Collection name must contain master or override";
    //     return next(err);
    // }
    var Form = mongoose.model(collection, FormSchema);
    //FormSchema.set('collection', collection);
    // if (formService.Collection !== collection) {
    /* I don't know how to do this any other way for now. If collection was already
    set and we have a different collection to send data to then this will re-load Form */
    //    Form = null;
    // }
    // exports.Collection = collection;
    // Form === null ? Form = require('../models/form').Form : {};
    //TODO: In future, code the formId to just get the data for a certain SVG file
    Form.find({}).sort({
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
    var Form = mongoose.model(collection, FormSchema);

    Form.remove({}, function(err) {
        // if (err) {
        return next(err);
        // }
    });
};


exports.updateRow = function(data, collection, userEmail, next) {
    // if (!(/master|override/.test(collection))) {
    //     let err = "Collection name must contain master or override";
    //     return next(err);
    // }
    var form = mongoose.model(collection + 's', FormSchema);
    var options = {
        upsert:true
    };
    //var decodedData = JSON.parse(data); //need to keep stringified to maintain order of fields
    form.findOneAndUpdate({
        id: data.id,
        isBlank: data.isBlank,
        userEmail,
    }, {
        $set: {
            doc: JSON.stringify(data.doc)
        }
    }, 
    options,
    function(err, raw) {
        if (err) {
            console.error("failed to update row. err: " + err);
            return next(err, "failed to update row");
        }
        else
        // if (raw.nModified < 1) {
        //     return next(new Error("No rows were updated"), "failed to update row");
        // }
        console.log('The raw response from Mongo was ', raw);
        next(null, 200);
    });
};

//This is maybe used by simpleGet in routes/formApi.js also socket.io
exports.findOne = function(collection, id, userEmail, next) {
    // if (!(/master|override/.test(collection))) {
    //     let err = "Collection name must contain master or override";
    //     return next(err, null);
    // }
    var Form = mongoose.model(collection, FormSchema);
    var email = userEmail == undefined ? "" : userEmail; //if email is blank, then we get the template for this form.

    Form.findOne({
        id: id,
        userEmail: email
    }, function(err, doc) {
        if (!doc || err) {
            //We did not find a form with this user name, so grab a blank form.
            Form.findOne({
                id: id,
                isBlank: true //grab blank form
            }, function(err, doc) {

                if (doc && doc.doc && typeof(doc.doc) == "string") { //we are testing for string becasue legacy code saved as a json, not a stringified json
                    doc.doc = JSON.parse(doc.doc);
                }
                next(err, doc);
                /* var returnVal = {err:null, doc:null};
                 if (err) {
                     returnVal.err = err;
                     return next(err,doc);
                 }
                 returnVal.doc = doc;
                 return returnVal;*/
            });
        }
        else {
            if (doc && doc.doc && typeof(doc.doc) == "string") { //we are testing for string becasue legacy code saved as a json, not a stringified json
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

/* Like getForm() but this does not send data directly back to browser */
exports.getAll = function(collection, req, res, next) {
    if (!(/master|override/.test(collection))) {
        let err = "Collection name must contain master or override";
        return next(err, null);
    }
    var Form = mongoose.model(collection, FormSchema);
    //FormSchema.set('collection', collection);
    // if (formService.Collection !== collection) {
    /* I don't know how to do this any other way for now. If collection was already
    set and we have a different collection to send data to then this will re-load Form */
    //    Form = null;
    // }
    // exports.Collection = collection;
    // Form === null ? Form = require('../models/form').Form : {};
    //TODO: In future, code the formId to just get the data for a certain SVG file
    Form.find({}).sort({
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
