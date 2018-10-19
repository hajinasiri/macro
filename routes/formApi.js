/**
 * This is an api to the survey forms and other user forms.  The designer uses something like 
 * https://gsap.systemsagency.org/formbuilder/ to design a form. When she clicks the save button, or whatever
 * the save buuton is called, it sends a json representation to the database which then can be used to
 * generate the form again when the user wants to submit a survey or other form.
 * See more about formbuilder at https://formbuilder.online/
 * This goes under routes.
 * Created by Larry Maddocks September 2017
 **/
var express = require('express');
var router = express.Router();
var restrict = require('../auth/restrict');
var formService = require('../services/form-service'); //to update row in form database
var hbs = require('hbs');
hbs.handlebars === require('handlebars');
//var Collection = "inputform"; //*********** Note this must change to getting from config.json **************


function inList(list, key) {
  return list.split(',').indexOf(key) > -1;
}
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
  //router.get('/:id', restrict, function(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }
  //now look to see if user permissions contain admin
  //var permissions = req.user._doc.doc.permissions;
  //if (!(permissions.split(',').indexOf('admin') > -1)) {
  //  return res.redirect('/'); // not found
  //}
  var collection = req.params.collection;
  var id = req.params.id;
  var unoLabel = req.query.label;
  formService.findOne(collection, id, req.user._doc.email, (err, rowData) => {
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
    else {
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

/**
 * This is like the default router.get('/:id/:collection,,) access point but this does not populate a handlebars template.
 * Rather, it simply returns a json object
 **/
router.get('/simpleGet', restrict, function(req, res, next) {
  //router.get('/:id', restrict, function(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }
  //now look to see if user permissions contain admin
  var permissions = req.user._doc.doc.permissions;
  if (!((permissions.split(',').indexOf('admin') > -1) || (permissions.split(',').indexOf('designer') > -1))) {
    return res.redirect('/'); // not found
  }
  var collection = req.query.collection + 's';
  var id = req.query.id;
  var email = ""; //req.user._doc.email; We are trying to get the template, so this is not associated with a certain user.
  formService.findOne(collection, id, email, function(err, rowData) {
    if (err || rowData === null) {
      if (!err) { err = "No data returned from findOne. Collection or row is missing. collection: " + collection + "  id: " + id; }
      console.error(err);
      //res.redirect('/error');
      let vm = {
        id: id,
        status: "error",
        serverMessage: err,
        data: null,
        collection: null
      };
      //res.render('admin/index', vm);
      //res.status(200).render('inputForm/index', vm);
      res.status(200).json(vm);
    }
    else {
      // let vm = {
      //     title: 'form DB Editor',
      //     instances: instancesArray,
      //     layout: 'simpleLayout',
      //     messageTitle: 'Sucess',
      //     serverMessage: 'Success getting all users.'
      //   };
      var result = rowData.doc.replace(/\r?\n|\r/g, "");
      let vm = {
        id: id,
        messageTitle: 'Success',
        status: "success",
        collection: collection,
        serverMessage: "",
        //data:JSON.stringify(rowData.doc)
        data: result //rowData.doc
      };
      res.status(200).json(vm);
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
  //var collection = data.collection; //what database to put this in. I would guess usually the override_folder
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
  var email = req.user._doc.email;
  formService.updateRow(data, data.collection, email, (err, status) => {
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
        status: 'success',
        msg: 'success in updateRow for map: ' + status + "id: " + data.id
      };
      //console.log('success in updateRow for map: ' + status + "id: " + data.id);
      //res.render('admin/index', vm);

      //return res.status(204);
      //res.status(status);

      // res.end();
      // next(null);
      // next("all good");
      console.log('success in updateRow for map. id: ' + data.id);
      res.status(status).json(vm);
      //res.end();

    }
  });

});

//insert a new form json into the database
router.post('/upload/',
  // [multer({
  //     dest: './import'
  //   }),
  //  restrict,
  function(req, res, next) {

    //now look to see if user permissions contain admin
    var data = req.body;
    var permissions = req.user._doc.doc.permissions;
    var email;

    if (!(inList(permissions, 'admin') || inList(permissions, 'editor') || inList(permissions, 'designer'))) {
      //  return res.redirect('/'); // not found
      return res.json({
        status: "error",
        msg: 'Invalid permission.'
      });
    }
    if (data.isBlank == "false") {
      email = req.user._doc.email;
    }
    else {
      email = "";
    }
    //we had to do update and not add because we want to update if this is already added
    formService.updateRow(data, data.collection, email, function(err, status) {
      if (err) {
        console.error(err);
        var vm = {
          status: 'error',
          msg: err,
          serverMessage: 'Error saving form for id: ' + data.id
        };

        res.status(status).json(vm);
      }
      else {
        var vm = {
          status: 'success',
          msg: 'success in insert new form for id: ' + data.id,
          serverMessage: 'Successfully Saved form for id: ' + data.id
        };

        res.status(status).json(vm);
      }
    });
  });





//get data from form and serialize it into an array that can be inserted into mongo
// function getFormData2Object(form) {
//   var un_array = form.serializeArray();
//   var _array = {};
//   $.form(un_array, function(n, i) {
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
