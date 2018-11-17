var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var User = require('../models/user').User;
var UserSchema = require('../models/user').UserSchema; //I don't understand why user.js has this line: var User = mongoose.model('User', userSchema);

exports.addUser = function(doc, user, next) {
  bcrypt.hash(user.password, 10, function(err, hash) {
    if (err) {
      return next(err);
    }
    user.password = hash;
    var newUser = new User({
      firstName: user.firstName,
      lastName: user.lastName,
      // roomNumber: user.roomNumber,
      email: user.email.toLowerCase(),
      password: user.password,
      doc: doc
    });

    newUser.save(function(err) {
      if (err) {
        return next(err);
      }
      next(null);
    });
  });
};

exports.findUser = function(email, next) {
  User.findOne({
    email: email.toLowerCase()
  }, function(err, user) {
    next(err, user);
  });
};

exports.findAllUers = function(req, res, next) {

  var Users = mongoose.model("users", UserSchema); //actually this is the same as the global User value, but whatever.
  // comments from cut and paste from Map.find() code:
  // MapSchema.set('collection', collection);
  // if (mapService.Collection !== collection) {
  /* I don't know how to do this any other way for now. If collection was already
  set and we have a different collection to send data to then this will re-load Map */
  //    Map = null;
  // }
  // exports.Collection = collection;
  // Map === null ? Map = require('../models/map').Map : {};
  //TODO: In future, code the mapId to just get the data for a certain SVG file
  Users.find((err, docs) => {
    if (err) {
      return next(err);
    }
    return next(err, docs);
    //return res;
    //res.send(docs);

  });
};

exports.updateRow = function(email, data, next) {
  var user = mongoose.model("users", UserSchema);
  var decodedData = JSON.parse(data);
  user.update({
    email: email
  }, {
    $set: decodedData
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
    return next(null, 200);
    // res.json({success : "Updated Successfully", status : 200});
  });
};


exports.deleteRow = function(email, next) {
  var user = mongoose.model("users", UserSchema);

  user.findOneAndRemove({
    email: email
  }, function(err, raw) {
    if (err) {
      console.error("failed to delete row. err: " + err);
      return next(err, "failed to delete row");
    }
    else
    if (raw.nModified < 1) {
      return next(new Error("No rows were deleted"), "failed to delete row");
    }
    console.log('The raw response from Mongo was ', raw);
    return next(null, 200);

  });
};
