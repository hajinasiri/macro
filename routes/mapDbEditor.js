/**
 * This will update a row in the map database. I created this when I could not get it to work from the map site (see maps.js & mapDbEditor.hbs),
 * but then I did get it to work.  This still works. It only works on one row at a time. It would be nice to pull in the
 * whole database, and use this form to edit a row.
 * Created by Larry Maddocks 2017
 **/ 
var express = require('express');
var router = express.Router();
var restrict = require('../auth/restrict');
var mapService = require('../services/map-service'); //to update row in map database
var hbs = require('hbs');
hbs.handlebars === require('handlebars');

hbs.registerHelper('checked', function(currentValue) {
  var result = currentValue == '1' ? ' checked="checked"' : '';
  return new hbs.handlebars.SafeString(result);
});
hbs.registerHelper('ipChecked', function(currentValue, dbKey) {
  //var result = currentValue == this.infoPane ? ' checked="checked"' : '';
  var result = currentValue == this[dbKey] /* this.infoPane */ ? ' checked="checked"' : '';
  return new hbs.handlebars.SafeString(result);
});


router.get('/:id/:collection', restrict, function(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }
  //now look to see if user permissions contain admin
  // var permissions = req.user._doc.doc.permissions;
  // if (!(permissions.split(',').indexOf('admin') > -1)) {
  //   return res.redirect('/'); // not found
  // }
  var collection = req.params.collection;
  var label =  req.params.hasOwnProperty("label") ?  req.params.label : ""; //if a label is sent in, populate the template with it.
  var id = req.params.id;
  var unoLabel = req.query.label;
  mapService.findOne(collection, id, function(err, rowData) {
    if (err || rowData === null) {
      if (!err) {
        err = "No data returned from findOne. Collection or row is missing. collection: " + collection + "  id: " + id;
      }
      console.error(err);
      //res.redirect('/error');
      let vm = {
        id: id,
        layout: 'simpleLayout',
        messageTitle: 'Error',
        serverMessage: err,
        data: null,
        collection: null
      };
      //res.render('admin/index', vm);
      if (collection === "mapForm") {
        res.status(200).render('mapInputForm/index', vm);
      }
      else {
        res.status(200).render('inputForm/index', vm);
      }

    }
    else  {
      //Success!!!
      // let vm = {
      //     title: 'form DB Editor',
      //     instances: instancesArray,
      //     layout: 'simpleLayout',
      //     messageTitle: 'Sucess',
      //     serverMessage: 'Success getting all users.'
      //   };
      var result = rowData.doc.replace(/\r?\n|\r/g, "");
      result = result.replace(/'/g, "\\'"); //takes out apostraphies
      result = result.replace(/\\\\'/g, "\\'"); //takes out apostraphies
      let vm = {
        id: id,
        label: unoLabel,
        layout: 'simpleLayout',
        messageTitle: '',
        collection: collection,
        //data:JSON.stringify(rowData.doc)
        data: result //rowData.doc
      };
      //rowData.doc.layout = 'simpleLayout';
      //rowData.doc.messageTitle = 'success';
      //rowData.doc.title = id;
      //rowData.doc.serverMessage = 'Success getting form row.';
      //rowData.doc.collection = collection; //populate the collection so we know where to update a row.
      //res.render('formDbEditor/index', rowData.doc);

      if (collection === "mapForm") {
        res.status(200).render('mapInputForm/index', vm);
      }
      else {
        res.status(200).render('inputForm/index', vm);
      }
      //res.status(200).json(rowData.doc);
      // setMapFormSubmitButtonEvent();
      // res.status(200).send(rowData.doc);
      console.log('success in getRow. collection: ' + collection + "  id: " + id);
    }
  });

});

router.post('/updaterow', function(req, res) {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }
  // var data = JSON.parse(req.body);
  var data = req.body;
  var collection = data.collection; //what database to put this in. I would guess usually the override_folder
 /**
  * The data coming in will in this form:
    {
        _collection: collection,
        _id: id,
        data: { id:id,
                moreMapFields:moreMapFields
        }

    }
    **/

  mapService.updateRow(collection, data.id, data.doc, (err, status) => {
    if (err) {
      //console.error(err);

      // var vm = {
      //   messageTitle: 'Error: update map',
      //   serverMessage: 'ERROR: Updating map row failed. Error: ' + err + "id: " + data.id
      // };
      // //res.render('admin/index', vm);
      // res.render('users/message', vm);
      res.render('error', {
        message: err.message,
        error: err
      });
      // res.status(status).send(vm);


    }
    else {

      var vm = {
        messageTitle: 'Success',
        serverMessage: 'success in updateRow for map: ' + status + "id: " + data.id
      };
      //console.log('success in updateRow for map: ' + status + "id: " + data.id);
      //res.render('admin/index', vm);

      //return res.status(204);
      //res.status(status);

      // res.end();
      // next(null);
      // next("all good");
      console.log( 'success in updateRow for map. id: ' + data.id);
      res.status(status).send(vm);
      //res.end();
     
    }
  });

});


//get data from form and serialize it into an array that can be inserted into mongo
// function getFormData2Object(form) {
//   var un_array = form.serializeArray();
//   var _array = {};
//   $.map(un_array, function(n, i) {
//     if (n.name.indexOf('[') > -1) {
//       var array = n.name.match(/\[(.*?)\]/);
//       var key = n.name.replace(array[1], "").replace('[', "").replace(']', "");
//       if (!_array[key]) {
//         _array[key] = {};
//       }
//       _array[key][array[1]] = n['value'];
//     }
//     else {
//       _array[n['name']] = n['value'];
//     }
//   });

//   //this will populate the checkboxes to zero if they were unchecked.
//   //TODO: need to make this so the field names do not need to be hard-coded
//   _array.hasOwnProperty("tooltip") ? {} : _array.tooltip = "1";
//   _array.hasOwnProperty("infoPane") ? {} : _array.infoPane = "hover";
//   _array.hasOwnProperty("hoverAction") ? {} : _array.onhover = "both";
//   _array.hasOwnProperty("clickAction") ? {} : _array.onclick = "openClose";
//   return _array;
// }



module.exports = router;
