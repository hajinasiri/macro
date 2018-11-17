/**
 * mapDbApi.js api for the map database. Created Aug. 2016, Larry A. Maddocks
 **/
/* global $, 
   jQuery,    Window,  Handlebars, io,idiagramSvg , dbIo  */

//var dbIo = require('./dbIo.js'); did not load fast enough for firefox
//var socket = dbIo.socket;

//help from handlebars people to create link. Do I need this?
// Handlebars.registerHelper('link', function(text, url) {
//  text = Handlebars.Utils.escapeExpression(text);
//  url = Handlebars.Utils.escapeExpression(url);

//  var result = '<a href="' + url + '">' + text + '</a>';

//  return new Handlebars.SafeString(result);
// });

//This is a helper that will populate checkboxes.
//TODO: Put this in another module that wil handle all forms including this database api.
/**
 * Usage example:

<input type="checkbox" name="cbxExample" id="cbxExample" {{checked cbxExample}}/>
Would tick a checkbox if the supplied JSON was:

{"cbxExample" : "1"}
Resulting in:

<input type="checkbox" name="cbxExample" id="cbxExample" checked="checked" />
**/
Handlebars.registerHelper('checked', function(currentValue) {
     var result = currentValue == '1' ? ' checked="checked"' : '';
     return new Handlebars.SafeString(result);
});
Handlebars.registerHelper('ipChecked', function(currentValue, dbKey) {
     //var result = currentValue == this.infoPane ? ' checked="checked"' : '';
     var result = currentValue == this[dbKey] /* this.infoPane */ ? ' checked="checked"' : '';
     return new Handlebars.SafeString(result);
});

var RowCopy; //copy of row that we get from mongo db so later we can insert missing fields when we save this.

//TODO: Delete this ass soon as you get populateMapForm2() working
function junk_populateMapForm(unoId) {

}


/**
 * Send if a unoid and this will return the row that matches that id. We assume we have unique unoid's
 **/
function getRowById(unoId) {
     var database = idiagramSvg.database;
     var row = database.get(unoId);
     // for (var i = 0; i < database.length; i++) {
     //  if (database[i].id !== undefined && database[i].id === unoId) {
     //   row = database[i];
     //   break;
     //  }
     // }
     return row;
}

/**
 * update a row in the global database array
 **/
/*function updateLocalFieldInDatabase(rowFromForm) {
 var rowToUpdate = getRowById(rowFromForm.id);
 //var database = idiagramSvg.database;
 for (var p in rowFromForm) {
    if( rowToUpdate.hasOwnProperty(p) ) {
       rowToUpdate[p] = rowFromForm[p];
    } 
  }
}*/



//get data from form and serialize it into an array that can be inserted into mongo
function getFormData2Object(j) {
     //var un_array = form.serializeArray();
     var _array = {};
     // $.map(un_array, function(n, i) {
     //  if (n.name.indexOf('[') > -1) {
     //   var array = n.name.match(/\[(.*?)\]/);
     //   var key = n.name.replace(array[1], "").replace('[', "").replace(']', "");
     //   if (!_array[key]) {
     //    _array[key] = {};
     //   }
     //   _array[key][array[1]] = n['value'];
     //  }
     //  else {
     //   _array[n['name']] = n['value'];
     //  }
     // });

     j = JSON.parse(j);
     for (let key in j) {
          let name = j[key].dbField;
          if (j[key].type === "radio-group" || j[key].type === "checkbox-group") {
               let values = j[key].values;
               for (let radioValues in values) {
                    //if (values[radioValues].value === idiagramSvg.getDatabase(data.id, name)) {
                    if (values[radioValues].selected == true)
                         _array[name] = values[radioValues].value !== undefined ? values[radioValues].value : '';
                    // }

               }
          }
          else {
               _array[name] = j[key].value !== undefined ? j[key].value : ''; // = idiagramSvg.getDatabase(data.id, name); //get the value that should go in this form field
          }
     }

     return _array;
}

//copy missing fields from original RowCopy to dataFromMapEditForm
function attachMissingFields(from, to) {
     for (var property in from) {
          if (!to.hasOwnProperty(property)) {
               to[property] = from[property];
          }
     }
}


function getRowAndUpdateMapDbForm(unoId) {
     RowCopy = null; //this is the first function called, so set this global to null;

     //console.log("master or override radio button clicked: " + $("input[name='whichDb']:checked").val());
     var collection;
     //if (trueIfUseDefaultCollection !== undefined && trueIfUseDefaultCollection === true) {
     collection = idiagramSvg.designerPrefs.masterDB;

     //}
     // else {
     //  collection = $("input[name='whichDb']:checked").val();
     // }
     //load the right database, just the row we need
     //then populate the form. (See populateMapForm() for example how to do this.
     // Promise.coroutine(function*() {
     //var dataFromMapEditForm = {}; //getFormData2Object($('#mapDbForm')); //do this to get the uno id.
     // unoId !== undefined ? dataFromMapEditForm.id = unoId : {}; //if the map db form is not populated yet, this id needs to be sent into the function
     // var res = yield dbIo.connectToSocket(); //TODO: Handle this alwaysin dbIo.js. This makes sure the socket is connected.
     //if (res && res.hasOwnProperty("connected") && res.connected === true) {

     // data.doc = JSON.stringify(doc);
     let data = {
          collection: collection,
          id: unoId
     };

     //Get latest row from mongo db for this collection and id.
     $.get("/maps/getrow", data, (result) => {
          // $("span").html(result);
          //console.log("result of get: " + result);
          if (result && result.hasOwnProperty("status") && result.status == "error") {
               alert("Unsuccessfull in fetching a row from db: " + result.msg);
          }
          else {
               var row = result.row;
               //make copy of row so later we can insert missing fields when we save this.
               RowCopy = $.extend({}, row);

               //now add the name of the two database collections (overrideDb and masterDb)
               //row.push({'overrideDb':idiagramSvg.designerPrefs.overrideDB},{'masterDb':idiagramSvg.designerPrefs.masterDB});
               //row.overrideDb = idiagramSvg.designerPrefs.overrideDB;
               row.masterDb = RowCopy.masterDb = idiagramSvg.designerPrefs.masterDB;

               //Now we need to see what is checked and keep it that way, right?
               //var idOfChecked = $("input[name='whichDb']:checked").attr("id");
               //row.overrideChecked = row.masterChecked = "";
               //override collection is now depreciated.
               //idOfChecked == "masterDb" ? row.masterChecked = "checked" : row.overrideChecked = "checked"; //This will be sent into the template so correct radio button is checked
               // row.masterChecked = "checked"; //override collection is now depreciated.

               //TODO:  See if we have access to this map form so we can populate the fields with data from row
               //var template = idiagramSvg.mapEditorTemplate(row); //template that was compiled when we first loaded in this form.
               var j = JSON.parse(formData);
               for (let key in j) {
                    let name = j[key].dbField;
                    if (j[key].type === "radio-group" || j[key].type === "checkbox-group") {
                         let values = j[key].values;
                         for (let radioValues in values) {
                              if (values[radioValues].value === RowCopy[name] ) { //idiagramSvg.getDatabase(data.id, name)) {
                                   values[radioValues].selected = true;
                              }
                              else {
                                   values[radioValues].selected = false;
                              }
                         }
                    }
                    else {
                         j[key].value = RowCopy[name]; //idiagramSvg.getDatabase(data.id, name); //get the value that should go in this form field
                    }
               }
               formData = JSON.stringify(j);
               //$("#mapDbEditor *").off(); //Need to remove event handlers
               populateMapForm(formData, data.id);
               //now insert that value thing here.



               //setMapFormSubmitButtonEvent();
          }

     });

}

// This will populate map form for the user.   Adapted from populateSurveyForm() from inputForm.js
// Created December 2017 by Larry Maddocks
// jQuery(function($) {

function populateMapForm(formData, unoId) {

     //     var formData='[   {       "type": "header",       "subtype": "h1",        "label": "Tell us about B1" },\
     // {       "type": "textarea",     \
     // "label": "If B1 were an animal, what kind of animal would it be?:",\
     // "className": "form-control",        "name": "textarea-1502752871298",       \
     // "subtype": "textarea"   },  {       "type": "textarea",     "label": \
     // "Problematize the ontological, phenomenological, and epistemological entailments of B1?:",\
     // "className": "form-control",        "name": "textarea-1502752923409",       "subtype": "textarea"   },  {       "type": "radio-group",      "label": "How important is B1?:",       "inline": true,     "name": "radio-group-1502752963464",        "values": [         {               "label": "Yawn",                "value": "one",             "selected": true            },          {               "label": "Dont know",               "value": "two"          },          {               "label": "Still confused",              "value": "three"            },          {               "label": "Depends who is asking",               "value": "four"         },          {               "label": "OMG!",                "value": "five"         }       ]   } ] '; //  let data = {
     //   collection: collection,
     //   id: dataFromMapEditForm.id
     //  };
     // $.get("/formApi/myFormName/inputform", /* data, */
     //   $('.fb-render').formRender({
     //       dataType: 'json',
     //       formData:  data
     //   });
     var fbEditor = document.getElementById('build-wrapForMapForm');
      var dbFieldObject = {
                                dbField: {
                                    label: 'dbField',
                                    maxlength: '60',
                                    description: 'name of this column in the map database'
                                } 
                            };
                            
     var options = {
          dataType: 'json',
          formData: formData,
          disableFields: ['autocomplete',
               'button',
               'checkbox',
               'checkbox-group',
               'date',
               'file',
               'header',
               'hidden',
               'paragraph',
               'number',
               'radio-group',
               'select',
               'text',
               'textarea'
          ],
          disabledActionButtons: ['clear', 'data'],
           typeUserAttrs: {
                            autocomplete: dbFieldObject,
                            button: dbFieldObject,
                            "checkbox-group": dbFieldObject,
                            date: dbFieldObject,
                            file: dbFieldObject,
                            hidden: dbFieldObject,
                            number: dbFieldObject,
                            "radio-group": dbFieldObject,
                            select: dbFieldObject,
                            text: dbFieldObject,
                            textarea: dbFieldObject
                        }

     };
     var formBuilder = $(fbEditor).formBuilder(options);

     //formBuilder.actions.setData(formData);   

     //   $.get("/formApi/" + formName + "/" + collection, /* data, */
     //       function(result) {
     //           // $("span").html(result);
     //           //console.log("result of get: " + result);
     //           if (result && result.hasOwnProperty("status") && result.status == "error") {
     //               alert("Unsuccessfull in fetching a row from db: " + result.msg);
     //           }
     //           else {
     //               $('.fb-render').formRender({
     //                   dataType: 'json',
     //                   formData: result
     //               });


     //           }
     //       }
     //   ); //var fbTemplate = document.getElementById('fb-template');
     var Fb; //some kind of object of the formBuilder api
     function getFormData(fb) {
          Fb = fb;

          $('#closeButton').click(() => {
               $(".information-pane").show();
               $("#mapDbEditor").hide();
          });

          //Now re-populate map edit form.
          var dyn = $("#mapDbEditor")[0];
          if (dyn) {
               var label = idiagramSvg.getDatabase(unoId, "label");

               // $(".whichDb").off("change"); (handled above)
               // $(dyn).html(template);
               //$(".information-pane").hide();
               //show map db editor
               $(".information-pane").append(dyn);
               $("#mapDbEditor").show();
               //$("#container").css("display","none");

          }

          $('.save-template').click((event) => {
               event.preventDefault(); //leave this here or this will not return from post call!!!
               // var dataFromMapEditForm = getFormData2Object($('#mapDbForm'));

               var j = Fb.formData;
               var data = {};
               //Now get the id of mongo's row id (not _id, but id, such as 'A')
               var dataFromMapEditForm = getFormData2Object(j); //do  this to get the uno id.
               dataFromMapEditForm.id = unoId;
               //var row = getRowById(dataFromMapEditForm.id); //get the row so I can get the id
               //var id = row.id;
               data.id = unoId; //dataFromMapEditForm.id; //this puts in id so we can lookup this record and update this record in mongoose

               data.rowNumber = RowCopy.rowNumber;
               //var collection = $("input[name='whichDb']:checked").val();
               var collection = idiagramSvg.designerPrefs.masterDB;
               data.collection = collection;

               //now copy missing fields from original RowCopy to dataFromMapEditForm
               attachMissingFields(RowCopy, dataFromMapEditForm);
               if (!dataFromMapEditForm.hasOwnProperty("rowNumber")) {
                    alert("database missing rowNumber field");
                    return;
               }
               data.doc = JSON.stringify(dataFromMapEditForm);
               //data.doc = dataFromMapEditForm;
               //data = JSON.stringify(data);
               //var x  = JSON.parse(data);
               //data.data.id = id;
               // console.log("mapDbForm Handler for .submit() called." + data);
               // Promise.coroutine(function*() {
               // var res = yield dbIo.connectToSocket(); //TODO: Handle this always in dbIo.js. This makes sure the socket is connected.
               // var result = yield dbIo.socket.emitAsync('updateRow', data);

               $.post("/maps/updateRow", data, (result) => {
                    if (result.status === "success") {
                         alert("Update was successfull. To see the effect of your changes, refresh the screen.");
                         console.log("Map db updated: ");
                    }
                    else {
                         alert("Update was unsuccessfull: " + result.msg);
                    }
                    event.preventDefault();
                    //if this form was triggered by "edit" in the url and not "mapform," then make this form go away.
                    if (idiagramSvg.getGlobal("dbEditing") === false) {
                         $(".information-pane").show();
                         $("#mapDbEditor").hide();
                    }
               });

               // })().catch(function(errs) {
               //  //handle errors on any events
               //  console.log("err updating data: " + errs);
               // });


          });



     }
     formBuilder.promise.then(function(fb) { getFormData(fb) });

}



var mapDbApi = {
     junk_populateMapForm: junk_populateMapForm,
     getRowAndUpdateMapDbForm: getRowAndUpdateMapDbForm
};
module.exports = mapDbApi;
