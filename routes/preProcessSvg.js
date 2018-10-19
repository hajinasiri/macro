var express = require('express');
var router = express.Router();
var restrict = require('../auth/restrict');
var permissions = require('../auth/permissions');
//var mapService = require('../services/map-service'); //to update row in map database
var EXTEND = require('whet.extend');
//const fs = require('fs');
//var multer = require("multer");
var path = require('path');
var fs = require('fs'); //new. to save off svg file
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
    title: 'Pre-process Svg',
    layout: 'simpleLayout'
  };
  res.render('admin/preProcessSvg', vm);

});

/**
 * This will grab all the data in the database for this collection.  We send in the file name but it is not really used.
 * I do this in case the browser needs to get back a file with the extension that it is expecting.
 * The html file sends in a a request that looks like this:
 * window.location.href = 'preProcessSvg/download/'+ jsonPath;
 **/
router.get('/download/:jsonPath', function(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }
  var jsonPath = req.params.jsonPath;
  let vm = {
    title: 'Pre-process Svg',
    layout: 'simpleLayout',
    jsonPath: jsonPath
  };
  res.render('admin/preProcessSvg', vm);
  /********** Now that we have the path to the json file, we need to:
   * 1) Send this to preProcessingSvg.hbs, which will
   * 2) load in the svg, preprocess it if it isn't already, then
   * 3) Upload this to server
   **/

});

// var storage = multer.diskStorage({
//   destination: function(req, file, callback) {
//     var svgPath = req.body.folderLocationOfFiles;
//     callback(null, svgPath)
//   },
//   filename: function(req, file, callback) {
//     console.log(file)
//     callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
//   }
// })

//after posting a spreadsheet file to upload, which will be saved in this folder
//and then inserted into the database.  DO NOT CHANGE THIS FROM import!!
router.post('/upload/',
  // [multer({
  //     dest: './import'
  //   }),
  //  restrict,
  function(req, res, next) {
    // var upload = multer({
    //   storage: storage
    // }).single('userFile');
    // upload(req, res, function(err) {
    //     res.end('File is uploaded');
    //   });
    //console.log(req.body);
    // form fields
    //console.log(req.files);
    // form files
    // if (!req.isAuthenticated()) {
    //     return res.redirect('/');
    // }
    //now look to see if user permissions contain admin
    var permissions = req.user._doc.doc.permissions;
    if (!(inList(permissions, 'admin') || inList(permissions, 'editor') || inList(permissions, 'designer'))) {
      //  return res.redirect('/'); // not found
      return res.json({
        status: "error",
        msg: 'Invalid permission.'
      });
    }
    //var svgPath = req.params.svgpath;
    var xml = JSON.parse(req.body.doc);
    xml = xml.xml; //I actually put the xml in a object called doc. So doc.xml
    // var upload = multer({
    //   storage: storage
    // }).single('userFile');
    // upload(req, res, function(err) {
    //   return res.json({
    //     status: "success",
    //     msg: 'Got xml.'
    //   });
    // });
    var testPath = __dirname; //path.join(__dirname, req.body.svgFile);
    var upOneLevel = path.dirname(__dirname); /*.join("../"+__dirname, 'foo');*/
    var x = path.join(upOneLevel, "authorized", req.body.svgFile);
    fs.writeFile(path.join(upOneLevel, "authorized", req.body.svgFile), xml, finished);

    function finished(err) {
      return res.json({
        status: "success",
        msg: 'Got svg.'
      });
    }

    return;
    //User can have multiple permissions, I suppose. If he has admin permissions and or editor permissions here 
    //then he can upload a spreadsheet. But if he only has designer, then he needs to have the collection
    //in the list of collections he can upload to.
    if (!inList(permissions, 'admin') && !inList(permissions, 'editor') && inList(permissions, 'designer')) {
      return res.json({
        status: "error",
        msg: 'Missing permission for this action.'
      });
    }
    var filePath = req.files.image.path;


    if (req.files && req.files.image && req.files.image.path && svgPath) {
      //console.log("file path here: " + filePath);
      // mongoXlsx.xlsx2MongoData(filePath, null, function(err, mongoData) {
      //     if (err) {
      //         console.error(err);
      //         res.redirect('/error');
      //     }
      //     else {
      //         console.log('Mongo data:', mongoData);
      //     }
      // });
      return res.json({
        status: "success",
        msg: 'Pre-processed svg file saved.'
      });

      xlsxj({
        input: filePath, //__dirname + '/sample.xlsx',
        sheet: "Structure",
        output: null // set this to null if you are not using it!!! __dirname + '/output.json'
      }, function(err, result) {
        if (err) {
          console.error(err);
          res.redirect('/error');
        }
        else {
          mapService.removeAll(collection, (err) => {
            if (err) {
              console.error(err);
              res.redirect('/error');
            }
            for (var i = 0; i < result.length; i++) {
              var row = result[i];
              if (!row.hasOwnProperty('rowNumber')) {
                row.rowNumber = i.toString();
              }
              if (row.hasOwnProperty('id') && row.id.length == 0) {
                row.id = i.toString();
              }
              else if (!row.hasOwnProperty('id')) {
                row.id = i.toString();
              }
              removeJunk(row); //for some reason we are getting undefined fields from the excel file. This deletes them
              if (row.hasOwnProperty('id') && row.id.length > 0) {
                var id = row.id;
                var rowNumber = Number(row.rowNumber);
                let doc = {
                  id: id,
                  rowNumber: rowNumber,
                  doc: row
                };
                mapService.addmap(doc, collection, function(err) {
                  if (err) {
                    console.error(err);
                    res.redirect('/error');
                  }
                });
              }

            }
            dbVersion.updateRow(collection, (err, doc) => {
              if (err) {
                //Need to update the version number of this db
                console.log("Error updating dbVersion. Will create a new row for this collection slash db. Err: " + err);
                dbVersion.addRow({
                  dbName: collection,
                  dbVersion: 1
                }, () => {
                  // var vm = {
                  //     status: 'success',
                  //     msg: 'success in updateRow for map. id: ' + data.id,
                  //     dbVersion: 1
                  // };

                  // res.status(status).json(vm);
                  //next(null);

                  res.status(204).end();
                  //res.status(200).end();
                  //res.render('import', vm);
                });

              }
              else {
                /* update dbVersion of this collection */


                //doc contains the version number that we are sending back
                // var vm = {
                //     dbVersion: doc,
                //     status: 'success',
                //     msg: 'success in updateRow for dbVersion. collection: ' + collection
                // };

                //res.status(status).json(vm);
                //next(null);
                res.status(204).end();
                //res.status(200).end();
                //res.render('import', vm);
              }
            });
          });

          //console.log(result);
        }
      });



    }
    return res.json({
      status: "error",
      msg: 'Missing permission for this action.'
    });
  }

  //]
);

module.exports = router;
