var express = require('express');
var router = express.Router();
var restrict = require('../auth/restrict');
var permissions = require('../auth/permissions');
var mapService = require('../services/map-service'); //to update row in map database
var mongoXlsx = require("mongo-xlsx");
var EXTEND = require('whet.extend');
const fs = require('fs');
//xlsxj = require("xlsx-to-json");
//var mapService = require('../services/map-service');

/* GET maps listing. */

// router.get('/', function(req, res, next) {
// res.send('respond with a resource');
// });

// router.get('/', function(req, res, next) {
//   //res.send('respond with a resource');
// });

function inList(list, key) {
  return list.split(',').indexOf(key) > -1;
}

router.get('/', restrict, function(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }
  //now look to see if user permissions contain admin
  var permissions = req.user._doc.doc.permissions;
  if (!(inList(permissions, 'admin') || inList(permissions, 'editor') || inList(permissions, 'designer'))) {
    return res.redirect('/'); // not found
  }
  let vm = {
    title: 'Database To Xlsx',
    layout: 'simpleLayout'
  };
  res.render('admin/mongoToXlsx', vm);

});

/**
 * This will grab all the data in the database for this collection.  We send in the file name but it is not really used.
 * I do this in case the browser needs to get back a file with the extension that it is expecting.
 * The html file sends in a a request that looks like this:
 * window.location.href = 'mongoToXlsx/download/'+ collection + '/file.xlsx';
 **/
router.get('/download/:collection', function(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }
   var collection = req.params.collection;
  var secureStatus = permissions.mapEditPermissions(collection, req, res, next);
  if (secureStatus.status !== 'success') {
    //return res.json(secureStatus);
     let vm = {
      status: secureStatus.status,
      layout: 'simpleLayout',
      msg: secureStatus.msg
    };
    res.render('admin/mongoToXlsx', vm);
    return;
  }  
  // var permissions = req.user._doc.doc.permissions;
  // if (!(permissions.split(',').indexOf('admin') > -1)) {
  //   return res.redirect('/'); // not found
  // }

  //first get the complete collection
 
  // Check to make sure contains masters or overrides
  if (!(/master|override/.test(collection))) {
    let err = "Invalid Collection";
    console.error();
     let vm = {
      status: "Error",
      layout: 'simpleLayout',
      msg: err
    };
    res.render('admin/mongoToXlsx', vm);
    return;

  }
  mapService.getAll(collection, req, res, function(err, doc) {
    if (err || !doc.length) {
      console.error(err);
      let vm = {
        messageTitle: 'Error',
        serverMessage: err,
        layout: 'simpleLayout'
      };
      res.render('admin/mongoToXlsx', vm);
      //res.redirect('/error');
    }
    else {
      var docGoodStuff = new Array(doc.length);
      for (var i = 0; i < doc.length; i++) {
        //let myDoc = doc[i]._doc.doc;
        docGoodStuff[i] = EXTEND({}, doc[i]._doc.doc); //myDoc;
      }
      //then format the json response if you need to
      /* Generate automatic model for processing (A static model should be used) */
      var model = mongoXlsx.buildDynamicModel(docGoodStuff);

      /* Generate Excel */
      mongoXlsx.mongoData2Xlsx(docGoodStuff, model, function(err, data) {
        if (err) {
          console.error(err);
          let vm = {
            messageTitle: 'Error',
            serverMessage: err,
            layout: 'simpleLayout'
          };
          res.render('admin/mongoToXlsx', vm);
        }
        else {
          console.log('File saved at:', data.fullPath);
          var filePath = data.fullPath;
          //var filePath = "/my/file/path/..."; // Or format the path using the `id` rest param
          //var fileName = "report.xlsx"; // The default name the browser will use

          res.download(filePath /*, fileName */ );
          setTimeout(() => {
            fs.unlink(filePath, (err) => {
              if (err) throw err;
              console.log('spreadsheet file successfully deleted ' + filePath);
            });
          }, 2000);

        }

      });


    }
  });


});



module.exports = router;
