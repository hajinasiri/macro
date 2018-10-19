var express = require('express');
var router = express.Router();
var restrict = require('../auth/restrict');
var permissions = require('../auth/permissions');
var mapService = require('../services/map-service'); //to update row in map database

var dbVersion = require('../services/dbVersion'); //to update row in map dbVersion database
//xlsxj = require("xlsx-to-json");
//var mapService = require('../services/map-service');

/* GET maps listing. */

// router.get('/', function(req, res, next) {
// res.send('respond with a resource');
// });

// router.get('/', function(req, res, next) {
//   //res.send('respond with a resource');
// });
router.get('/getrow', function(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }
  // var permissions = req.user._doc.doc.permissions;
  // if (!(permissions.split(',').indexOf('admin') > -1)) {
  //   return res.redirect('/'); // not found
  // }
  // ************ this is where we grab a row and send it back.
  var data = req.query;
  var collection = data.collection;
  var secureStatus = permissions.mapEditPermissions(collection, req, res, next);
  if (secureStatus.status !== 'success') {
    return res.json(secureStatus);
  }
  console.log("getRow: " + collection); //what database to put this in. I would guess usually the master_folder

  mapService.findOne(collection, data.id, function(err, rowData) {
    if (err || rowData === null) {

      if (err) {
        console.error(err)
      }
      else {
        err = "No data returned from findOne. Collection or row is missing. collection: " + collection + "  id: " + data.id;
        var vm = {
          status: "error",
          msg: err
        }

        // socket.emit('event_msg_error', err);
        //res.send('msg_response', 200);
        res.status(200).json(vm);
        console.error(err);
      }
    }
    else {
      // socket.emit('msg_response', rowData.doc);
      res.status(200).json({
        status: "success",
        row: rowData.doc
      });
      console.log('success in getRow. collection: ' + collection + "id: " + data.id);
    }
  });

});

router.post('/updaterow', restrict, function(req, res, next) {
  // if (!req.isAuthenticated()) {
  //   return res.redirect('/');
  // }
  // var data = JSON.parse(req.body);
  var data = req.body;
  var collection = data.collection; //what database to put this in. I would guess usually the override_folder
  var secureStatus = permissions.mapEditPermissions(collection, req, res, next);
  if (secureStatus.status !== 'success') {
    return res.json(secureStatus);
  }
  //The data coming in will in this form:
  //   {
  //       _collection: collection,
  //       _id: id,
  //       data: { id:id,
  //               moreMapFields:moreMapFields
  //       }

  //   }

  mapService.updateRow(collection, data.id, data.doc, (err, status) => {
    if (err) {
     
      res.json({
        status: "error",
        msg: err.message
      });
    }
    else {
      /* update dbVersion of this collection */
      dbVersion.updateRow(collection, (err, doc) => {
        if (err) {
          //probably an empty collection. Add a row.
          dbVersion.addRow({
            dbName: collection,
            dbVersion: 1
          }, () => {
            var vm = {
              status: 'success',
              msg: 'success in updateRow for map. id: ' + data.id,
              dbVersion: 1
            };
            
            res.status(status).json(vm);
          });
          
        }
        else {
          /* update dbVersion of this collection */


          //doc contains the version number that we are sending back
          var vm = {
            dbVersion:doc,
            status: 'success',
            msg: 'success in updateRow for dbVersion. collection: ' + collection
          };
          
          res.status(status).json(vm);
        }
      });


    }
  });

});

module.exports = router;
