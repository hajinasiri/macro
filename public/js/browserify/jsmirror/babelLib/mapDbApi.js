'use strict';

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
Handlebars.registerHelper('checked', function (currentValue) {
  var result = currentValue == '1' ? ' checked="checked"' : '';
  return new Handlebars.SafeString(result);
});
Handlebars.registerHelper('ipChecked', function (currentValue, dbKey) {
  //var result = currentValue == this.infoPane ? ' checked="checked"' : '';
  var result = currentValue == this[dbKey] /* this.infoPane */ ? ' checked="checked"' : '';
  return new Handlebars.SafeString(result);
});

var RowCopy; //copy of row that we get from mongo db so later we can insert missing fields when we save this.

function populateMapForm(unoId) {
  RowCopy = null; //this is the first function called, so set this global to null;
  var row = getRowById(unoId);
  if (row) {
    //now add the name of the two database collections (overrideDb and masterDb)
    //row.push({'overrideDb':idiagramSvg.designerPrefs.overrideDB},{'masterDb':idiagramSvg.designerPrefs.masterDB});
    row.overrideDb = idiagramSvg.designerPrefs.overrideDB;
    row.masterDb = idiagramSvg.designerPrefs.masterDB;
    //row.masterChecked = "checked";
    var result = idiagramSvg.mapEditorTemplate(row); //template that was compiled when we first loaded in this form.
    //Now re-populate map edit form.
    getRowAndUpdateMapDbForm(true, unoId); //get the right row for default db (master) and populate form with it.

  }
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
function getFormData2Object(form) {
  var un_array = form.serializeArray();
  var _array = {};
  $.map(un_array, function (n, i) {
    if (n.name.indexOf('[') > -1) {
      var array = n.name.match(/\[(.*?)\]/);
      var key = n.name.replace(array[1], "").replace('[', "").replace(']', "");
      if (!_array[key]) {
        _array[key] = {};
      }
      _array[key][array[1]] = n['value'];
    } else {
      _array[n['name']] = n['value'];
    }
  });

  //this will populate the checkboxes to zero if they were unchecked.
  //TODO: need to make this so the field names do not need to be hard-coded
  _array.hasOwnProperty("tooltip") ? {} : _array.tooltip = "0";
  _array.hasOwnProperty("infoPane") ? {} : _array.infoPane = "hover";
  _array.hasOwnProperty("hoverAction") ? {} : _array.hoverAction = "both";
  _array.hasOwnProperty("clickAction") ? {} : _array.clickAction = "clickAction";
  _array.id = $("#id").attr("value");
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
/**
 * This is called at first when the form has not been populated. If not populated we need to let it know to use  default collection, and also what id.
 * if the map db form is not populated yet, this id needs to be sent into the function
 **/
function getRowAndUpdateMapDbForm(trueIfUseDefaultCollection, unoId) {

  console.log("master or override radio button clicked: " + $("input[name='whichDb']:checked").val());
  var collection;
  if (trueIfUseDefaultCollection !== undefined && trueIfUseDefaultCollection === true) {
    collection = idiagramSvg.designerPrefs.masterDB;
  } else {
    collection = $("input[name='whichDb']:checked").val();
  }
  //load the right database, just the row we need
  //then populate the form. (See populateMapForm() for example how to do this.
  // Promise.coroutine(function*() {
  var dataFromMapEditForm = getFormData2Object($('#mapDbForm')); //do this to get the uno id.
  unoId !== undefined ? dataFromMapEditForm.id = unoId : {}; //if the map db form is not populated yet, this id needs to be sent into the function
  // var res = yield dbIo.connectToSocket(); //TODO: Handle this alwaysin dbIo.js. This makes sure the socket is connected.
  //if (res && res.hasOwnProperty("connected") && res.connected === true) {

  // data.doc = JSON.stringify(doc);
  var data = {
    collection: collection,
    id: dataFromMapEditForm.id
  };
  $.get("/maps/getrow", data, function (result) {
    // $("span").html(result);
    //console.log("result of get: " + result);
    if (result && result.hasOwnProperty("status") && result.status == "error") {
      alert("Unsuccessfull in fetching a row from db: " + result.msg);
    } else {
      var row = result.row;
      //make copy of row so later we can insert missing fields when we save this.
      RowCopy = $.extend({}, row);

      //now add the name of the two database collections (overrideDb and masterDb)
      //row.push({'overrideDb':idiagramSvg.designerPrefs.overrideDB},{'masterDb':idiagramSvg.designerPrefs.masterDB});
      row.overrideDb = idiagramSvg.designerPrefs.overrideDB;
      row.masterDb = idiagramSvg.designerPrefs.masterDB;

      //Now we need to see what is checked and keep it that way, right?
      //var idOfChecked = $("input[name='whichDb']:checked").attr("id");
      //row.overrideChecked = row.masterChecked = "";
      //override collection is now depreciated.
      //idOfChecked == "masterDb" ? row.masterChecked = "checked" : row.overrideChecked = "checked"; //This will be sent into the template so correct radio button is checked
      row.masterChecked = "checked"; //override collection is now depreciated.
      var template = idiagramSvg.mapEditorTemplate(row); //template that was compiled when we first loaded in this form.

      $("#mapDbEditor *").off(); //Need to remove event handlers
      //Now re-populate map edit form.
      var dyn = $("#mapDbEditor")[0];
      if (dyn) {
        // $(".whichDb").off("change"); (handled above)
        $(dyn).html(template);
        //$(".information-pane").hide();
        //show map db editor
        $(".information-pane").append(dyn);
        $("#mapDbEditor").show();
        //$("#container").css("display","none");
      }
      setMapFormSubmitButtonEvent();
    }
  });

  //  //populate the form

  //  //}
  //  //maybe update that row in the database.


  // })().catch(function(errs) {
  //  //handle errors on any events
  //  console.log("err getting data: " + errs);
  //  alert(errs);
  // });
}

/**
 * this is called after the map form is loaded. Called from callbackLoadMapEditor()
 * This sets an event handler that waits for the submit button
 **/
function setMapFormSubmitButtonEvent() {

  // $('form').submit(function(e) {
  /* $('#send').on('click', function(event) {
    mapDbApi.socket.emit('mapdata', $('#id').val());
    // $('#m').val('');
    return false;
    // });
    });*/
  $("#mapDbForm").submit(function (event) {
    event.preventDefault(); //leave this here or this will not return from post call!!!
    // var dataFromMapEditForm = getFormData2Object($('#mapDbForm'));
    var data = {};
    //Now get the id of mongo's row id (not _id, but id, such as 'A')
    var dataFromMapEditForm = getFormData2Object($('#mapDbForm')); //do  this to get the uno id.
    //var row = getRowById(dataFromMapEditForm.id); //get the row so I can get the id
    //var id = row.id;
    data.id = dataFromMapEditForm.id; //this puts in id so we can lookup this record and update this record in mongoose

    data.rowNumber = Number(dataFromMapEditForm.rowNumber);
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

    $.post("/maps/updateRow", data, function (result) {
      if (result.status === "success") {
        alert("Update was successfull. To see the effect of your changes, refresh the screen.");
        console.log("Map db updated: ");
      } else {
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
  $(".whichDb").change(function (event) {
    //this is so that if the radio button was changed from, say, override to master, then this will handle it.
    getRowAndUpdateMapDbForm();
    //setMapFormSubmitButtonEvent();
    // event.preventDefault();
  });

  //Clicked the close button, so show the info pane and hide the map id edotor form
  $("#closeButton").click(function () {
    $(".information-pane").show();
    $("#mapDbEditor").hide();
  });
}

var mapDbApi = {
  populateMapForm: populateMapForm,
  setMapFormSubmitButtonEvent: setMapFormSubmitButtonEvent

};
module.exports = mapDbApi;