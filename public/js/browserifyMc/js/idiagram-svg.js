/**
 * idiagram-svg.js Logic for manipulating svg file for idiagram Created 2016, Larry A. Maddocks
 */
// version of this project
// greensock. Start using greensock more to pan and zoom to correct places.
/* global $, 
    jQuery,TweenLite, svgPanZoom,  Tooltip,
    Window,  myLayoutObj, present, showdown,  MouseEvent, myClientSocket, Handlebars, mapDbApi,
    baseIdClass, svgFile, folder,storyFile,infoFile, zoomSensitivity ,defaultURL, Hammer,
    XMLSerializer, blob, URL, location, idiagramUtil,localforage */

var version = "v. 3.10"; //unoInfo
//var SvgUtils = require('./svg-pan-zoom/svg-utilities.js');
//require("./jquery.layout.js");
//var mapDbApi = require("./mapDbApi.js");
var idiagramUi = myLayoutObj; // {myLayout:myLayout};//IdiagramUi; //require('./idiagram-ui')();

// the panZoom object. Created here and referenced in idiagram-ui.js
var zoomTiger;
var zoomRatio = 1.0; // Added by Marshall Clemens - tracks zoom ratio for the current window size
//var initialRealZoom = 1.295; //tracks the initial realZoom vallue

var idGroupObject = {}; // idGroupObject is an object with key/value pairs that map id's to the group object


var lastEmbedSrc; // svg file found from global in html file or json file with same first name as html file.
// if AnchorTagClicked is true, then we have a click even and we know to toggle
// the tooltip off/on
// var AnchorTagClicked = false;

// keep track of info pane that I loaded so don't load in twice in a row --
// which messes up event maybe
var CurrentIdOfInfoPane = "";

//We may not really need CurrentIdOfstoryPane unless the db wants to populate the story (narration) pane.
//var CurrentIdOfstoryPane = "";
/**
 * contains the url in the address bar. Get's set originally in svgloaded(). Used when a +++ is sent in so we
 * can add the paramets sent with +++ to end of parameter list of previous url.
 */
var PreviousUrlAddress;
/**
 * svgness: the current object that is being pointed to. Mouse unhover was returning this equal to root svg in
 * Safari found that I was trying to move objects back when tooltip came off and item, when mouseover tooltip
 * was never triggered
 */
var svgness;
// keep track of objects that have been clicked on.
// var clickedOnObjects = [];
var database;
// TODO: Document this:
var converter = new showdown.Converter();

// Panning == true while panning (really mountained +++sedown) and false when
// mouseup.
var Panning = false;
// Title of web site, to be used in history
var PageTitle = $('title').text();
var masterDatabase;
var overrideDatabase;
var masterForage = null; //local master db
var overrideForage = null;
var lastUpdatedDb = null;

//var delay = 100; // 100;
var TextHoverTimer;
var TextHoverDelay = 200;

// thise two variables are for presentation navigation
var Slides;
var SlideSelected = -1;
//keeps track of the last story file loaded.
var LastStoryFile = null;
/*
l-click On an UNO: lock-on function for that UNO
i-click On an UNO: toggle highlight for that UNO - hlt=thisUNO
g-click On an UNO: zoom in on that UNO - gotoz=thisUNO
a-click Play the animation for that UNO - play=thisUNO
*/
var gClicked = null, //equals g if it was pressed right before a click
  elClicked = null;

var designerPrefs; //contains designer preferences for this svg map. This comes from a json file that has same name as the html file.
var tweenDuration = .4; //used in svg-pan-zoom for the tween duration
var traceTime = 1.0; // used in controlmenu.js
//  Global durations and opacity variable used by all highlighting functions
//  Defaults set here, and they can be changed with the sethlt command - found in idiagram-util.js.
//  bw - for black/white - set the opacity layer to white (1) or black (0).
var hltDuration = 1.0;
var hltOpacity = 0.80;
var bw = 1;
var mapEditorTemplate = null; //most recent handlebars map editor template loaded. If not null, then click causes editor to open
var doTweeningInSvgPanZoom = false; //Set this false when first initializing so svg-pan-zoom & other initialization is not so slow.

//IE: This will handle IE MouseEvent code so you can trigger a click on a link. 
//TODO: In the future we might just make all code use the createEvent() and initMouseEvent code
if (typeof MouseEvent !== 'function') {
  (function() {
    var _MouseEvent = window.MouseEvent;
    window.MouseEvent = function(type, dict) {
      dict = dict | {};
      var event = document.createEvent('MouseEvents');
      event.initMouseEvent(
        type,
        (typeof dict.bubbles == 'undefined') ? true : !!dict.bubbles,
        (typeof dict.cancelable == 'undefined') ? false : !!dict.cancelable,
        dict.view || window,
        dict.detail | 0,
        dict.screenX | 0,
        dict.screenY | 0,
        dict.clientX | 0,
        dict.clientY | 0, !!dict.ctrlKey, !!dict.altKey, !!dict.shiftKey, !!dict.metaKey,
        dict.button | 0,
        dict.relatedTarget || null
      );
      return event;
    }
  })();
}

/**
 * svg: for the jquery svg library tools
 */
function svgloaded() {
  console.log("in svgloaded()");
  svgness = $("#container svg")[0];
  idiagramSvg.svgness = svgness; //expose this to the world
  $(svgness).attr({
    width: "100%",
    height: "100%",
    id: "svgness"
  });

  // var w = svgness.getBBox().width;
  // var h = svgness.getBBox().height;
  // $("#container").width(w);
  // $("#container").height(h);

  $(svgness).mousedown(function() {
    // addClass(svgness, "panning");
    Panning = true;
  });
  $(svgness).mouseup(function() {
    // removeClass(svgness, "panning");
    Panning = false;
  });

  reloadZoomTiger(); //reload zoomTiger from svg-pan-zoom.js
  idiagramSvg.tweenDuration = designerPrefs.hasOwnProperty("tweenDuration") ? designerPrefs.tweenDuration : .4; //used in svg-pan-zoom for the tween duration
  tweenDuration = idiagramSvg.tweenDuration; //used in svg-pan-zoom for the tween duration
  idiagramSvg.traceTime = designerPrefs.hasOwnProperty("traceTime") ? designerPrefs.traceTime : 1.0; // used in controlmenu.js to set the trace duration
  traceTime = idiagramSvg.traceTime;
  idiagramSvg.hltDuration = designerPrefs.hasOwnProperty("hltDuration") ? designerPrefs.hltDuration : 1.0;
  hltDuration = idiagramSvg.hltDuration;
  idiagramSvg.hltOpacity = designerPrefs.hasOwnProperty("hltOpacity") ? designerPrefs.hltOpacity : 0.8;
  hltOpacity = idiagramSvg.hltOpacity;
  idiagramSvg.bw = designerPrefs.hasOwnProperty("bw") ? designerPrefs.bw : 1;
  bw = idiagramSvg.bw;

  //initialRealZoom = zoomTiger.getSizes().realZoom;
  // There is a g element that gets created by svgPanZoom that has a
  // "transform"
  // attribute that messes me up. So this removes that. found I had to wait a
  // bit before it showed up,
  // hence the "setTimeout()"

  setTimeout(function() {
    //I don't know why I need this, but for now, there may be some vars who need to stay in their own namespace
    //Promise.delay(1).then(function() {
    // console.log("500 ms passed");


    // function() {
    PreviousUrlAddress = $.address.value();
    // Go through and set vvv objects class to zeroOpacity and vvv
    /*
     * $(svgness).find("g[id^='vvv']").each(function(index) {
     * addClass(this, "zeroOpacity"); });
     * 
     */
    /**
     * Class’ifying UNOs – (brilliant suggestion re giving groups CSS classes, as I’m assuming this will
     * give us the ability to make classes visible, invisible, %opaque, etc. - no matter where those
     * groups are within the SVG) Any group can be assigned to one or more CSS classes. Those classes can
     * be accessed - eg made visible/invisible - no matter where they sit in the SVG, or if their parent
     * groups are on or off. Assigning classes with Illustrator can be done by adding a class name to the
     * group name with the syntax: “objectName class:className1 class:className2”
     * 
     * For example, the UNO named in Illustrator as: Individuals class:stakeholder class:people which will
     * generate the following SVG: <g id="Individuals_class:stakeholder_class:people">
     * 
     * The code will parse that into an UNO with an id named “Individuals” (for URL command and DB
     * purposes), with the CSS classes of “stakeholder” and “people”. Un-Named groups can also be assigned
     * classes eg a group with: <g id="_class:stakeholder_class:people"> Any bit of SVG artwork - anywhere
     * in the SVG - could potential be assigned a class and controlled via CSS class functions. Classes
     * can be controlled using the special rrr-group to trigger a JSON formatted command (I’m assuming
     * that’s how we can do things like turn on/off all class=”connections”)
     */

    // this was a test thing: idiagramUtil.findNotCssNotViewport();
    if (!$(svgness).hasClass("preprocessed")) {
      console.timeStamp("Start init find stuff");
      console.time();
      $(svgness).find("g[id]:not([id^='css']):not([id^='viewport'])").each(function() {
        var thisId = $(this).attr("id");
        // first, see if there are classes at all in
        // the id. If not, don' worry 'bout it.
        var pattern;
        var result;
        //var id = "";
        pattern = /_class:/;
        result = pattern.exec(thisId);
        if (result) {
          // get the id if there is one. the
          // regExp pattern is saying, get the id
          // at beginning of line
          // (represented by "^(.+)" , which means
          // 1 or more characters at beginning of
          // the line), but not preceeded by the
          // characters, "_class:"
          // This is cryptic, I know. see
          // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp

          pattern = /(?!_class:)^(.+?)(?:_class:)/;
          result = pattern.exec(thisId);
          if (result) {
            // set the id for this group without
            // the class stuff in it
            $(this).attr("id", result[1]);
          }
          else {
            // there is no id, only classes
            // $(this).attr("id", "");
            $(this).removeAttr("id");
          }
          // now get a list of the classes
          pattern = /(_class:)([a-zA-Z0-9\.\-]*)/g;
          var listOfClasses = thisId.match(pattern);
          //var classString = "";
          for (var i = 0; i < listOfClasses.length; i++) {
            // filter out the word, "_class:"
            // and just get the class name
            // if (i === 0) {
            // classString = listOfClasses[i].substr(7);
            addClass(this, listOfClasses[i].substr(7));
            // } else {
            //     classString += " " + listOfClasses[i].substr(7);
            // }
          }
          //addClass(this, classString);
          // copy the real id to thisId
          if (result) {
            thisId = result[1];
          }
          else {
            // there is no id and nothing to
            // scrub
            return;
          }
        }
        // scrub bad id's with _ character

        var scrubbedId = stripId(thisId);
        if (!/^sss|^xxx|^vvv|^ooo/.test(scrubbedId)) {
          if (thisId !== scrubbedId) {
            // save the id without stuff like _2_
            $(this).attr("id", scrubbedId);
          }
          //get classes
          // var d = idiagramUtil.getDb(scrubbedId, "classes");
          // var r = d.next();
          // var res = r.value;
          // var newKey = "db_" + idiagramSvg.designerPrefs.masterDB + "_" + scrubbedId;
          // idiagramSvg.masterForage.getItem(newKey).then((row) => {
          //   if (row !== undefined && row) {
          //     console.log('we just read ' + row);
          //     //var truncatedId = idiagramSvg.stripId(scrubbedId);
          //     if (row.id !== undefined && row.id === scrubbedId && row["classes"] !== undefined) {
          //       //callBack(err, row[field]);

          //       var classesFromDBForThisId = row["classes"];
          //       if (classesFromDBForThisId != undefined && classesFromDBForThisId.length) {
          //         $("#" + scrubbedId).addClass(classesFromDBForThisId);
          //       }
          //     }

          //   }


          // }).catch(function(err) {
          //   // This code runs if there were any errors
          //   console.log(err);
          // });

          // var o = new idiagramUtil.getDatabaseCoRoutine();
          // $(o).on("getItemDone", function(event) {
          //   o.result = event.data !== undefined ? event.data : "";
          //   var classesFromDBForThisId = o.result;
          //   if (classesFromDBForThisId != undefined && classesFromDBForThisId.length) {
          //     $("#" + scrubbedId).addClass(classesFromDBForThisId);
          //   }
          // });
          // o.getDatabase(scrubbedId, "classes");
          var classesFromDBForThisId = getDatabase(scrubbedId, "classes");
          if (classesFromDBForThisId != undefined && classesFromDBForThisId.length) {
            $("#" + scrubbedId).addClass(classesFromDBForThisId);
          }
        }
      });
      //return;
      /**
       * Go through all sss groups find all it's descendant groups with an id because we don't do anything
       * with them Also add the ss class name to the sss groups
       */
      $(svgness).find("g[id^='sss']").each(function(index) {
        addClass(this, "sss");
        $(this).attr("style", "pointer-events: none");
        // This id is messing up the css rules
        $(this).removeAttr("id");
        // get rid of all groups with an id under groups where the
        // id starts with sss
        $(this).find("g[id]").each(function() {
          $(this).removeAttr("id");
        });
      });
      // find all id's that do not have a special prefix and set a
      // class to ddd.
      // Give them defaul class of off
      // look for immediate vvv,ooo,ccc, etc prefixes and append the
      // parent id to them
      // CSS should make "off" class invisible and have no mouse
      // events.
      $(svgness)
        .find(
          "g[id]:not([id^='sss']):not([id^='ooo']):not([id^='xxx']):not([id^='vvv']):not([id^='ccc']):not([id^='css']):not([id^='viewport']):not([id^='svg-pan-']):not(symbol g)")
        .each(function(index) {
          var unoId = $(this).attr("id");
          // unoId = stripId(unoId); //we did this
          // above
          var topClass = this;

          // If this has a child xxx or ooo or vvv group, See if we are missing other required groups, such as xxx or ooo or vvv
          var isDdd = $(this).children("g[id^='ooo'], g[id^='vvv'],g[id^='xxx']").length;
          if (isDdd) {
            var divToWrap;
            //Yes we have a ddd. Now generate any missing groups.
            if (!$(this).children("g[id^='ooo']").length) {
              //generate an ooo
              divToWrap = document.createElement("g");
              $(divToWrap).attr({
                id: "ooo"
              });
              $(this).append(divToWrap);
            }
            if (!$(this).children("g[id^='vvv']").length) {
              //generate an vvv
              divToWrap = document.createElement("g");
              $(divToWrap).attr({
                id: "vvv"
              });
              $(this).append(divToWrap);
            }
            if (!$(this).children("g[id^='xxx']").length) {
              //generate an xxx
              divToWrap = document.createElement("g");
              $(divToWrap).attr({
                id: "xxx"
              });
              $(this).append(divToWrap);
            }
          }


          $(this).children("g[id^='ooo'], g[id^='vvv'],g[id^='xxx']").each(function(index) {
            // Only add ddd and off if this is a UNO class with interactive children
            addClass(topClass, "ddd");
            addClass(topClass, "uno");

            $(topClass).attr("mytype", "ddd");
            // even the ddd (or uno)
            // types get the uno-id
            // attribute popoulated
            $(topClass).attr("uno-id", unoId);
            var thisId = $(this).attr("id");
            thisId = stripId(thisId);
            //TODO: Make sure you strip the -1 -2 stuff from the prefixed id's. before you do the mytype and class = "ccc" or whatever. 
            //TODO: continued. We don't want ccc-2. We
            //just want ccc thisId = stripId(thisId); maybe it will be useful if we add a
            // class named the same as the prefix addClass(this, thisId);  addClass(this,
            // "off"); creates an
            // attribute called
            // mytype and sets it to
            // ooo or vvv
            // or whatever it is.
            addClass(this, thisId);

            $(this).attr("mytype", thisId);
            // puts the UNO id into
            // the attribute uno-id
            $(this).attr("uno-id", unoId);
            thisId += unoId;
            $(this).attr("id", thisId);
            //TODO: Are we saying here that we can have a ccc under an ooo?
            // // The following commented out ccc stuff on 11/8/2016. I leave it here in case we need the code for other children groups      
            //       $(this).children("g[id^='ccc']").each(function(index) {
            //         /*            var
            //                       thisId = $(this).attr("id");
            //                     thisId = stripId(thisId);
            //                     creates an attribute called mytype and sets it to ooo or vvv or whatever it is. */
            //         $(this).attr("mytype", "ccc");
            //         // puts the  UNO id into the attribute uno - id
            //         $(this).attr("uno-id", unoId);
            //         // thisId =
            //         // stripId(thisId);
            //         //it is sometimes useful for testing at least to add a class named the same name as the prefix
            //         addClass(this, "ccc");
            //         // addClass(this, "off");
            //         // append the uno id to the ccc id.
            //         $(this).attr("id", "ccc" + unoId);
            //       });
          });
          // Now while We have this group id, see if
          // it was assigned a type If it doesn't, it
          // is just a wrapper and we need to know
          // that.
          var isWrapper = $(this).attr("mytype");
          if (isWrapper === undefined || !isWrapper.length) {
            //
            var thisId = $(this).attr("id");
            $(this).attr("uno-id", thisId);
            var isThisInDb = getDatabase(thisId, "id");
            if (!isThisInDb.length) {
              // wrapper type whose id is not is
              // not in database.
              $(this).attr("mytype", "wrapNotDb");
              addClass(this, "wrapNotDb");
              addClass(this, "uno");
            }
            else {
              // this is in database. May have
              // tooltip to show off.
              $(this).attr("mytype", "wrapInDb");
              addClass(this, "wrapInDb");
              addClass(this, "uno");
            }
          }
        });

      //Now go through and set a class for artwork
      $(".svg-pan-zoom_viewport")
        .find(
          "*:not(g)")
        .each(function() {
          $(this).addClass("lm-art");

        });
      console.timeEnd();
      console.timeStamp("End init find stuff");
      $(svgness).addClass("preprocessed");

    }
    //***********  The stuff above should be put through a preporcessor, then save off the svg file.
    // Now go through and set mouse events
    $(svgness)
      .find(
        "g[id]:not([id^='placeholder__']):not([id^='sss']):not([id^='css']):not([id^='viewport']):not([id^='svg-pan-']):not(symbol g)")
      .each(function(index) {
        // we need to assign "this" to one of these objects:
        // ddd (which has a child with a prefix),
        // vvv,
        // ooo,
        // ccc,
        // wrapInDb wrapper with id in db, which DOES NOT
        // have a child with a prefix
        // wrapNotDb wrapper without id in db, which DOES
        // NOT have a child with a prefix
        var gIdObject = null;
        switch ($(this).attr("mytype")) {
          case "ddd":
            gIdObject = new baseIdClass.DddClass(this);
            break;
          case "vvv":
            gIdObject = new baseIdClass.VvvClass(this);
            break;
          case "ooo":
            gIdObject = new baseIdClass.OooClass(this);
            break;
          case "xxx":
            gIdObject = new baseIdClass.XxxClass(this);
            break;
            /*
            case "ccc":
              gIdObject = new CccClass(this);
              break;*/
          case "wrapInDb":
            gIdObject = new baseIdClass.WrapInDbClass(this);
            break;
          case "wrapNotDb":
            if ($(this).attr("uno-id").length > 0) {
              // we were getting bugs after id's filled
              // with junk were getting stipped to
              // 0-length values
              gIdObject = new baseIdClass.WrapNotDbClass(this);
            }
            else {
              // if id.length = 0 then remove the uno
              // stuff from this. Make a normal id'less
              // <g>
              $(this).removeAttr("mytype");
              $(this).removeAttr("id");
              $(this).removeAttr("uno-id");
              removeClass(this, "wrapNotDb");
              removeClass(this, "off");
            }
            break;
          default:
            // default code block
            break;
        }
        // Add this to the object that contains a list of
        // these.
        if (gIdObject) {
          idGroupObject[gIdObject.thisId] = gIdObject;
        }

      });
    // see initialize() to see what we are doing here. Now all these
    // have been created, need to init some of its variables, such
    // as cccGIdObject
    callAllGroups("initialize");

    /*I will move the "setThisToClose" code to initialize() because I don't want the onClose
    code to be called at the start when we don't need it to.*/
    //  callAllGroups("setThisToClose", false);
    $.address.internalChange(function(e) {
      // myClientSocket.emitCommandsForUrl($.address.value());
    });
    $.address.change(function(e) {
      //-------------------------------------------------------------
      // Added 8/10/16 to populate the info pane with the one matching the id.
      //-----
      //
      // var q = getURLParameterList($.address.queryString());
      var locationString = $.address.queryString();
      // locationString = locationString.replace(/.*\#(.*)/, "$1");
      // var parameterString = locationString.replace(/.*\?(.*)/, "$1");

      var parameterTokens = locationString.split("&");
      // onclick="sndReq('j=1,q=2,t=127.0.0.1,c=5');
      var parameterList = [];
      for (var j = 0; j < parameterTokens.length; j++) {
        var parameterName = parameterTokens[j].replace(/(.*)=.*/, "$1");
        // j
        var parameterValue = parameterTokens[j].replace(/.*=(.*)/, "$1");
        // 1
        parameterList[parameterName] = parameterValue;
      }
      var q = parameterList;
      var filteredKeyVals = getAllKeysAndValuesStartingWith(q, "gotoz");
      var thisId = null;
      // var k = Object.keys(q).length;
      // grab last id on the list to highlight it.
      var objectId = filteredKeyVals["gotoz"];
      if (objectId && objectId.length) {
        thisId = objectId;
      }
      else {
        filteredKeyVals = getAllKeysAndValuesStartingWith(q, "open");
        objectId = filteredKeyVals["open"];
        if (objectId && objectId.length) {
          thisId = objectId;
        }
        else {
          objectId = filteredKeyVals["openall"];
          if (objectId && objectId.length) {
            thisId = objectId;
          }
          else {
            filteredKeyVals = getAllKeysAndValuesStartingWith(q, "on");
            // var k = Object.keys(q).length;
            // grab last id on the list to highlight it.
            objectId = filteredKeyVals["on"];
            if (objectId && objectId.length) {
              thisId = objectId;
            }
          }
        }

      }

      //----
      if (thisId !== undefined && thisId !== null && thisId !== 0 && idGroupObject[thisId] !== undefined) {
        populateInfoPane(idGroupObject[thisId]);
      }




      // end of window pane population ---------------------------------------------
    });
    $.address.externalChange(function(e) {
      setTimeout(function() {
        // myClientSocket.emitCommandsForUrl($.address.value());
        // See if there are any address
        // parameters. If not, populate some
        // with the current state.
        var parameterList = getURLParameterList($.address.queryString());
        // $.address.parameterNames();
        if (parameterList && parameterList.length) {
          if (isKeyInParameterList(parameterList, ["+++"])) {
            // run this stuff if we have a
            // +++ command. It makes no
            // changes except what commands
            // come after +++
            parameterList = purgeMatchedStatesFromParamList(parameterList);
            if (parameterList !== null) {}
            $.address.history(false);
            $.address.autoUpdate(false);
            // need to get
            // this.parameterList less the
            // "+++" stuff
            if (parameterList !== null) {}
            var purgedParameterList = removeCommandFromParameterListArray(parameterList, "+++");
            // TODO: Need to purge duplicate commands from parameter list
            var myUrlAddress = parameterListArrayToUrlAddress(purgedParameterList);

            //I just found a case where designer is sending in +++&panzoom, 
            //which duplicates the existing panx and pany, plus zoom. So I need to delete previous panx, pany, zoom commands
            //from the PreviousUrlAddress so we can keep and use the new panx, panx values
            //TODO: These panx, pany are actually not getting removed from url.   Need to fix that.
            if (isKeyInParameterList(purgedParameterList, ["panzoom"])) {
              PreviousUrlAddress = removeCommandFromAddressDotValueString(PreviousUrlAddress, "panx");
              PreviousUrlAddress = removeCommandFromAddressDotValueString(PreviousUrlAddress, "pany");
              PreviousUrlAddress = removeCommandFromAddressDotValueString(PreviousUrlAddress, "zoom");
            }



            var newUrl = PreviousUrlAddress + "&" + myUrlAddress;
            // there needs to be a question
            // mark ("?") as second
            // character. If it is not
            // there, insert it
            newUrl = verifyQuestionMarkInURL(newUrl);
            $.address.value(newUrl);
            if (!isKeyInParameterList(parameterList, ["panx", "panzoom"])) {
              updateAddress();
            }
            else {
              $.address.history(true);
              $.address.update();
              $.address.autoUpdate(true);
            }
            // TODO: Maybe later code
            // processing the location path
            // that is right after the hash
            // i put this here instead of up
            // higher because we needed to
            // purge the hidden uno's from
            // parameter list.
            processCommandsInURL(parameterList, null);
          }
          else {
            if (!isKeyInParameterList(parameterList, ["panx", "panzoom"])) {
              updateAddress();
            }
            processAddress();
          }

          PreviousUrlAddress = $.address.value();


        }

      }, 500);
    });
    //console.log("In svgloaded, ready to call processAddress");
    //make sure everything is set to off and close
    //The following is called after map is processed
    // callAllGroups("setAllToOff"); //default state
    //callAllGroups("setAllToClose"); //default state I do this in initialize ddd so I don't call all the custom function at first

    //Set just the top groups to off
    // $('.svg-pan-zoom_viewport>g[id]').each(function() {
    //   var id = $(this).attr("id");
    //   if (id in idGroupObject) {
    //     idGroupObject[id].setThisToOff();
    //   }

    // });

    var parameterList = getURLParameterList($.address.queryString());
    // if we don't have panx we probably don't have any pan/zoom
    // parameters in url
    if (!isKeyInParameterList(parameterList, ["panx", "panzoom"])) {
      updateAddress();
    }
    processAddress();
    // $.address.init(processAddress);
    /**
     * Handle hovering over tagged words in text We need to do this everytime we populate stuff with text,
     * so user can hover over stuff And mimic hovering over objects in svg
     */
    // TODO: Make objects for these so we don't keep creating new
    // pane events and processing pane markup.
    createHoverEventForTaggedWords();


    // normalizeMapPane(); //this should not be called on start-up; it is called elsewhere on startup

    // Added by Larry Maddocks to write new values to url after
    // clicking reset button

    $(window).resize(function() {
      //This will completely restart the svg-pan-zoom library
      reloadZoomTiger(); //reload zoomTiger from svg-pan-zoom.js
      var doResizeFitPan = function() {

        //$(SvgTweenEvent).off("svgTweenComplete", doResizeFitPan);
        //console.log("In doResizeFitPan()");
        // Marshall Clemens 03/08/16
        // Capture the zoom value - that fits the SVG to the current window size.
        // Use to calculate relative zoom values.

        zoomRatio = zoomTiger.getZoom();

        updateAddress();
        //console.log("hit reset button");

      };
      //$(SvgTweenEvent).on("svgTweenComplete", doResizeFitPan);
      setTimeout(function() {
        zoomTiger.resize();
        zoomTiger.fit();
        zoomTiger.center();
        doResizeFitPan(); //TODO: Take this out of this function and put it back here
      }, 400);
    });
    $(svgness).click(function(e) {
      if (!$(':focus').is("body")) {
        $(':focus').blur(); //Sets focus to body so we can do things like g-click.
      }

      if (e.shiftKey) {
        updateAddress(null, true);
        // copy the URL to the clipboard
        //document.execCommand("copy", 0, "I copied this text!");

        /*
         * I was trying out panning to a certain object
         * zoomTiger.pan({x:0,y:0}); var rz =
         * zoomTiger.getSizes().realZoom; bounding =
         * $("#thingB").get(0).getBoundingClientRect();
         * zoomTiger.pan({ x:
         * -(bounding.left*rz)+(zoomTiger.getSizes().width/2),y:
         * -(bounding.top*rz)+(zoomTiger.getSizes().height/2)});
         * 
         */
      }
      else if ($(e.target).closest("#svg-pan-zoom-reset-pan-zoom").length) {
        // Added by Larry Maddocks to write new values to
        // url after clicking reset button

        if (idiagramSvg.options && idiagramSvg.options.onResetClick) {
          idiagramSvg.options.onResetClick();
        }
        else onResetClick();
      }
    });

    //Everything is finished processing. Now ready to display the svg.
    //Note: I am loading in the css last so that css is not trying to draw elements before they are finished processing
    $("head").append("<link rel='stylesheet' id='extracss' href='" + "/stylesheets/mapWindow.min.css" + "' type='text/css' />");
    $("head").append("<link rel='stylesheet' id='extracss' href='" + "/stylesheets/jquery.qtip.min.css" + "' type='text/css' />");
    $("head").append("<link rel='stylesheet' id='extracss' href='" + "/stylesheets/svg-styles2.min.css" + "' type='text/css' />");
    $("head").append("<link rel='stylesheet' id='extracss' href='" + "/stylesheets/fontello/css/fontello.min.css" + "' type='text/css' />");
    $("head").append("<link rel='stylesheet' id='extracss' href='" + "/stylesheets/menustyles.min.css" + "' type='text/css' />");
    $("head").append("<link rel='stylesheet' id='extracss' href='" + "/stylesheets/bootstrap-iso.min.css" + "' type='text/css' />");
    idiagramSvg.doTweeningInSvgPanZoom = true; //Set this true after first initializing so svg-pan-zoom & other initialization will start tweening.
    $("#container").css("visibility", "visible");
    $(window).triggerHandler("svgloadedComplete");
  }, 1);
  //  return true;
  // });
} // end of svgloaded


var beforePan;
beforePan = function(oldPan, newPan) {
  var //stopHorizontal = false,
    //stopVertical = false,
    gutterWidth = 100, //getGlobal("gutterWidth"),
    gutterHeight = 100, //getGlobal("gutterHeight"),
    // Computed variables

    sizes = this.getSizes(),
    leftLimit = -((sizes.viewBox.x + sizes.viewBox.width) * sizes.realZoom) + gutterWidth,
    rightLimit = sizes.width - gutterWidth - (sizes.viewBox.x * sizes.realZoom),
    topLimit = -((sizes.viewBox.y + sizes.viewBox.height) * sizes.realZoom) + gutterHeight,
    bottomLimit = sizes.height - gutterHeight - (sizes.viewBox.y * sizes.realZoom);
  var customPan = {};
  customPan.x = Math.max(leftLimit, Math.min(rightLimit, newPan.x));
  customPan.y = Math.max(topLimit, Math.min(bottomLimit, newPan.y));
  return customPan;
};


/**
 * 
 *getDatabaseAndInfoFile() is only called once when page is first loaded.  If we do not have an updated map db, then it is loaded
 *from server, else use the local persistant copy.
 **/
function getDatabaseAndInfoFile(localVersion) {

  lastEmbedSrc = designerPrefs !== undefined && designerPrefs.svgFile !== undefined ? designerPrefs.svgFile : ""; // svg file found from global in html file or json file with same first name as html file.
  /**
   * Load the database for this svg.
   */
  var dataLength = 0;
  //var doc2data = [];
  var doc2data = new Map();
  masterDatabase = doc2data;
  idiagramSvg.database = database = masterDatabase;

  //This is called when we are finished grabbing map data from local database.
  $(idiagramSvg.masterForage).on("masterForageIterateCompleted", function() {
    $(idiagramSvg.masterForage).off("masterForageIterateCompleted"); //don't need this event trigger taking up memory anymore.
    console.log('masterForage.iterate has completed');
    getOverRideDatabase(masterDatabase);
  });
  $(idiagramSvg.lastUpdatedDb).on("lastUpdatedDb_setItem_complete", function() {
    $(idiagramSvg.lastUpdatedDb).off("lastUpdatedDb_setItem_complete"); //don't need this event trigger taking up memory anymore.
    console.log('lastUpdatedDb_setItem_complete');
    getOverRideDatabase(masterDatabase);
  });
  if (designerPrefs.masterDB !== undefined && designerPrefs.masterDB.length) {

    $.get("/mapdata/" + designerPrefs.masterDB + "/" + localVersion.toString(), function(res, status) {
      // TODO: Create better error-handling
      if (status === "success" && res.data == true) {
        // doc2data = new Map(); //this will contain rows of objects like I had when there was a schema

        dataLength = res.doc.length;
        var data = res.doc; //this contains the rows from the map db
        for (var i = 0; i < dataLength; i++) {
          //doc2data.push(data[i].doc);
          //TODO: we  should clear out all the data from this local database collection first.
          doc2data.set(data[i].doc.id, data[i].doc);
          masterForage.setItem(data[i].doc.id, data[i].doc, function(err, value) {
            // Do other things once the value has been saved.
            if (err)
              console.log(err);
            return null;
          });
        }
        idiagramSvg.lastUpdatedDb.setItem(idiagramSvg.designerPrefs.masterDB, res.serverVersion).
        then(function(value) {
          // Do other things once the value has been saved.
          console.log(value);
          getOverRideDatabase(masterDatabase);
          //$(idiagramSvg.lastUpdatedDb).triggerHandler("lastUpdatedDb_setItem_complete");
          //return getOverRideDatabase(masterDatabase); // Now get the override database
          return null;
        }).catch(function(err) {
          // This code runs if there were any errors
          console.log(err);
        });
      }
      else if (localVersion) {
        // do this if our local database is already updated
        idiagramSvg.masterForage.iterate(function(value, key, iterationNumber) {
          // Resulting key/value pair -- this callback
          // will be executed for every item in the
          // database.
          console.log([key, value]);
          //doc2data.push(value);
          doc2data.set(key, value);
        }).then(function() {
          console.log('masterForage.iterate has completed');
          $(idiagramSvg.masterForage).triggerHandler("masterForageIterateCompleted");
          return null;

          // return getOverRideDatabase(masterDatabase);
        }).catch(function(err) {
          // This code runs if there were any errors
          console.log(err);
        });
      }
      else {
        console.log("No master database: " + status);
        return getOverRideDatabase(null);

      }

    });

  }

  $.get(designerPrefs.infoFile, function(data, status) {
    if (status === "success") {
      // Populate default infopane data
      var infopane = converter.makeHtml(data);
      // this will clean up event handlers
      // TODO:Do i really need this?
      $(".information-pane p").remove();
      // now wrap this so you can hide this later when you start
      // populating this with data from db
      // this gets hidden later in populateInfoPane()
      var divToWrap = document.createElement("div");
      $(divToWrap).attr({
        "class": "info-p-content",
        id: "tempInfoPane___info"
      });
      $("#mapDbEditor").hide();
      $(divToWrap).addClass("show");
      CurrentIdOfInfoPane = "tempInfoPane";
      $(divToWrap).append(infopane);
      infopane = divToWrap;
      $(".information-pane").html(infopane);
      return null;
    }
    else {
      return console.log("infopane data Error: " + status);
    }
  });
  if (typeof designerPrefs.segmentsFile !== "undefined" && designerPrefs.segmentsFile !== undefined && designerPrefs.segmentsFile.length) {
    $.get(designerPrefs.segmentsFile, function(data, status) {
      if (status === "success") {
        present.PresentationJson = data;
        // process json file
        return present.processAnimatePresentate(); //note that right now we cannot handle loading multiple segmentsFile's
      }
      else {
        return console.log("Error loading SegmentsFile: " + status);
      }
    });
  }
  else if (designerPrefs.hasOwnProperty("SegmentsFile")) {
    console.log("SegmentsFile is now depreciated. Use lower case 's', as in 'segmentsFile'");
    alert("SegmentsFile is now depreciated. Use lower case 's', as in 'segmentsFile'");
  }
}

//reload zoomTiger from svg-pan-zoom.js
function reloadZoomTiger() {
  zoomTiger = null; //hopefully enables junk collections
  // set up pan and zoom object. This adds some navigation groups and a group
  // with .svg-pan-zoom_viewport

  var eventsHandler;
  eventsHandler = {
    haltEventListeners: ['touchstart', 'touchend', 'touchmove', 'touchleave', 'touchcancel'],
    init: function(options) {
      var instance = options.instance,
        initialScale = 1,
        pannedX = 0,
        pannedY = 0
      // Init Hammer
      // Listen only for pointer and touch events
      this.hammer = Hammer(options.svgElement, {
        inputClass: Hammer.SUPPORT_POINTER_EVENTS ? Hammer.PointerEventInput : Hammer.TouchInput
      })
      // Enable pinch
      this.hammer.get('pinch').set({
        enable: true
      })
      // Handle press
      this.hammer.on('press', function(ev) {
        runToggleMenuOn(ev);
      })
      // Handle double tap
      // this.hammer.on('doubletap', function(ev){
      //   instance.zoomIn()
      // })
      // Handle pan
      this.hammer.on('panstart panmove', function(ev) {
        // On pan start reset panned variables
        if (ev.type === 'panstart') {
          pannedX = 0
          pannedY = 0
        }
        // Pan only the difference
        instance.panBy({
          x: ev.deltaX - pannedX,
          y: ev.deltaY - pannedY
        })
        pannedX = ev.deltaX
        pannedY = ev.deltaY
      })
      // Handle pinch
      this.hammer.on('pinchstart pinchmove', function(ev) {
        // On pinch start remember initial zoom
        if (ev.type === 'pinchstart') {
          initialScale = instance.getZoom()
          instance.zoom(initialScale * ev.scale)
        }
        instance.zoom(initialScale * ev.scale)
      })
      // Prevent moving the page on some devices when panning over SVG
      options.svgElement.addEventListener('touchmove', function(e) {
        e.preventDefault();
      });
    },
    destroy: function() {
      this.hammer.destroy()
    }
  }

  zoomTiger = svgPanZoom(svgness, {
    // beforePan: beforePan,
    zoomEnabled: true,
    maxZoom: designerPrefs.hasOwnProperty("maxZoom") ? designerPrefs.maxZoom : 10, // Maximum Zoom level
    minZoom: designerPrefs.hasOwnProperty("minZoom") ? designerPrefs.minZoom : 0.5, // Minimum Zoom level - added by Marshall Clemens
    zoomScaleSensitivity: designerPrefs.zoomSensitivity, // Zoom sensitivity
    onPan: resetDuration,
    onZoom: resetDuration,
    // we are using double-click to jump to url defined in db for this object
    dblClickZoomEnabled: false,
    controlIconsEnabled: false,
    customEventsHandler: eventsHandler,

    fit: 1,
    center: 1,
    panEnabled: true,
    // viewportSelector: '#svgness',
    // mouseWheelZoomEnabled : true,
    preventMouseEventsDefault: false
    // TODO: make sure this is set (right)to false?) so that clicks can do more
    // than what svg-pan-zoom handles

  });
  idiagramSvg.zoomTiger = zoomTiger;
}

function onResetClick() {
  zoomTiger.resize();
  zoomTiger.fit();
  zoomTiger.center();
  zoomRatio = zoomTiger.getZoom();
  updateAddress();
}

function THIS_IS_WHERE_IT_ALL_STARTS() {}
$(function() {
  /*Important: As of jQuery 1.4, if the JSON file contains a syntax error, the request will usually 
  fail silently. Avoid frequent hand-editing of JSON data for this reason. JSON is a data-interchange 
  format with syntax rules that are stricter than those of JavaScript's object literal notation. 
  For example, all strings represented in JSON, whether they are properties or values, must be 
  enclosed in double-quotes. For details on the JSON format, see http://json.org/.*/
  //first figure name of the designerprefs.json file. If it is there, it is the same name as the html file.
  //var designerprefsFileName = location.pathname.substring(location.pathname.lastIndexOf("/") + 1);
  //designerprefsFileName = designerprefsFileName.split(".")[0]; //split into an array, then get first array value

  //$.getJSON(designerprefsFileName + ".json", function(j) {
  $.getJSON("config.json", function(j) {
      idiagramSvg.designerPrefs = designerPrefs = j; //one global replaces a lot of little ones.
      //create local databases

      //create local master database
      if (designerPrefs.masterDB !== undefined && designerPrefs.masterDB.length) {
        masterForage = idiagramSvg.masterForage = localforage.createInstance({
          name: designerPrefs.masterDB
        });
      }
      // *******temp
      // idiagramSvg.masterForage.getItem("db_" + idiagramSvg.designerPrefs.masterDB + "_" + "0").then(function(value) {
      //   console.log(value);
      // });
      //create local overrride database
      if (designerPrefs.overrideDB !== undefined && designerPrefs.overrideDB.length) {
        overrideForage = localforage.createInstance({
          name: designerPrefs.overrideDB
        });
      }

      //create local database of dates so I know if remote database (and other stuff?) has been updated since I downloaded it.
      idiagramSvg.lastUpdatedDb = lastUpdatedDb = localforage.createInstance({
        name: "lastUpdatedDb"
      });
      // $(idiagramSvg.lastUpdatedDb).on("lastUpdatedDb_Iterate_Completed", function() {
      //   $(idiagramSvg.lastUpdatedDb).off("lastUpdatedDb_Iterate_Completed"); //don't need this event trigger taking up memory anymore.
      //   console.log('lastUpdatedDb Iteration has completed');
      //   if (designerPrefs.svgFile === undefined) {
      //     designerPrefs.svgFile = svgFile !== undefined ? svgFile : null;
      //     designerPrefs.svgFile ?
      //       getDatabaseAndInfoFile() : alert("Error: svg file name is missing!");
      //   }
      //   else
      //     getDatabaseAndInfoFile();
      // });
      // idiagramSvg.lastUpdatedDb.iterate(function(value, key, iterationNumber) {
      //   // Resulting key/value pair -- this callback
      //   // will be executed for every item in the
      //   // database.
      //   // console.log([key, value]);
      //   //doc2data.push(value);
      //   //doc2data.set(key, value);
      // }).then(function() {
      //   $(idiagramSvg.lastUpdatedDb).triggerHandler("lastUpdatedDb_Iterate_Completed");
      //   return null;
      // }).catch(function(err) {
      //   // This code runs if there were any errors
      //   console.log(err);
      // });

      $(idiagramSvg.lastUpdatedDb).on("setitem_complete", function() {
        $(idiagramSvg.lastUpdatedDb).off("setitem_complete"); //don't need this event trigger taking up memory anymore.
        console.log('setitem_complete');
        getDatabaseAndInfoFile(0); //0 because this tells the server that we have nothing yet.
      });

      //This is a funcky callback since I can't get localForage callbacks to work
      $(idiagramSvg.lastUpdatedDb).on("getitem_complete", function(event, version) {
        $(idiagramSvg.lastUpdatedDb).off("getitem_complete"); //don't need this event trigger taking up memory anymore.
        console.log('getitem_complete');
        if (version !== undefined && version !== null) {
          console.log('we just read ' + version);
          getDatabaseAndInfoFile(version);

        }
        else {
          //this is not populated yet in the local version db, so populate this master version now, then call getDatabaseAndInfoFile(0);
          idiagramSvg.lastUpdatedDb.setItem(idiagramSvg.designerPrefs.masterDB, 0).
          then(function(value) {
            // Do other things once the value has been saved.
            console.log(value);
            $(idiagramSvg.lastUpdatedDb).triggerHandler("setitem_complete");
            return null;
          }).catch(function(err) {
            // This code runs if there were any errors
            console.log(err);
          });
        }
      });

      //get version of master

      return idiagramSvg.lastUpdatedDb.getItem(idiagramSvg.designerPrefs.masterDB).then(function(value) {
        $(idiagramSvg.lastUpdatedDb).triggerHandler("getitem_complete", [value]);
        return null;
      }).catch(function(err) {
        // This code runs if there were any errors
        console.log(err);
      });



    })
    .done(function() {
      console.log("in getJSON(designerprefsFileName.json done");
      return null;
    })
    .fail(function() {
      //TODO: Test to see if all of these parameters are defined
      // if (typeof svgFile !== "undefined") {
      //   idiagramSvg.designerPrefs = designerPrefs = {
      //     "svgFile": svgFile,
      //     "folder": folder,
      //     "storyFile": storyFile,
      //     "infoFile": infoFile,
      //     "masterDB": masterDB,
      //     "overrideDB": overrideDB,
      //     "zoomSensitivity": designerPrefs.zoomSensitivity = typeof designerPrefs.zoomSensitivity !== "undefined" ? designerPrefs.zoomSensitivity : 5.5,
      //     "defaultURL": defaultURL
      //   };
      // }
      // else
      alert("error getting designerprefs." /* , and no svgFile defined in html file" */ );
      console.log("Error getting designerprefs.json!!!!");
      return getDatabaseAndInfoFile(0);
    })
  // .always(function() {
  //   //console.log("in getJSON always");
  //   return null;
  // });


}); //end if $(function  ..called after page loads


function eventHandler(eventValue) {
  this.type = "eventHandler";
  this.eventValue = eventValue;
}
eventHandler.prototype.triggerStuff = function() {
  $(this).triggerHandler(this.eventValue);
};

function runASlideInSlideShow($thisSlide) {

  var locationString = $thisSlide.prop("hash");
  locationString = locationString.replace(/.*\#(.*)/, "$1");
  var parameterString = locationString.replace(/.*\?(.*)/, "$1"); //I think I am replacing the text after the '?' with the text after the hash
  var parameterList = getURLParameterList(parameterString);
  processCommandsInURL(parameterList, null);
  // we don't really use anchorValues
  // here
  var anchorValues = {};
  var thisId = getLastIdParameterOnClickedAnchor($thisSlide, anchorValues);
  if (thisId !== undefined && thisId !== 0 && idGroupObject[thisId] !== undefined) {
    populateInfoPane(idGroupObject[thisId]);
  }

}

/**
 * Called when user hits the h key or from the drop-down menu.
 * It shows a modal help window. The html must be set up to show this. See
 * Documentation
 **/
function showHelp() {
  if ($('#myModal').length) {
    if (designerPrefs.hasOwnProperty("helpLink")) {
      // var link = document.createElementNS("http://www.w3.org/1999/xhtml", "a");



      //This will add dynamic content to the story pane. 

      //if we already have content for help, do not try to load it again.
      if ($("#modal-body").children().length === 0) {

        $.get(designerPrefs.helpLink, function(fileContents, status) {
          if (status === "success") {
            var dyn = $("#modal-body")[0];
            if (dyn) {

              $(dyn).html(fileContents);
              $('#myModal').modal('show');
            }
          }
          else {
            console.error("error getting help file: " + status);
          }
        }.bind(this));
        //LastStoryFile = infofile;
      }
      else {
        $('#myModal').modal('show');
      }

    }

  }
  else {
    var htmlFileName = location.pathname.substring(location.pathname.lastIndexOf("/") + 1);
    console.error("Error. Cannot display the help information because the help file elements are missing from the " + htmlFileName + " file!")
  }
}

/**
 * Called when user hits the "p" key, which is ascii 80
 **/
function printSvg() {


  //make a copy of the svgness
  //get css
  //insert the css
  //fix up the svg
  //let the user download it.
  //take it out of memory

  //clone svgness
  var svgnessCopy = $(svgness).clone();
  var controlToRemove = $(svgnessCopy).find("#svg-pan-zoom-controls");
  $(controlToRemove).remove();
  // $(svgnessCopy).remove("#svg-pan-zoom-controls"); //we don't want the user controls -- zoom in/out and rest, etc.
  svgnessCopy = svgnessCopy[0];
  var isThisCssAlreadyInserted = $(svgnessCopy).find("#savedSvgCss"); //if this css is already there, don't grab it again
  if (!isThisCssAlreadyInserted.length) {
    //get css to insert
    //show_svg(svgnessCopy);return; //open svg in another page
    $.get("/filedata/" + "stylesheets/svgOutCss.css", function(svgnessCopy, data, status) {
      if (status === "success") {
        //insert css
        var insertCss = document.createElementNS("http://www.w3.org/2000/svg", "style");
        insertCss.setAttribute('type', 'text/css'); //this is a css style
        insertCss.setAttribute("id", "savedSvgCss"); //need id so we don't keep adding this if svg used again sometime
        insertCss.textContent = data; //insert the css conent in the dynamic style we just created
        var whereInsertCss = $(svgnessCopy).find('.svg-pan-zoom_viewport')[0];
        whereInsertCss !== undefined ? $(whereInsertCss).prepend(insertCss) : {}; //stick this style under svg element
        show_svg(svgnessCopy); //open svg in another page
        /*

        //get svg source.
        var serializer = new XMLSerializer();
        var source = serializer.serializeToString(svgnessCopy);

        //add name spaces.
        if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
          source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
        }
        if (!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)) {
          source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
        }

        //add xml declaration
        source = '<?xml version="1.0" standalone="no"?>\r\n' + source;

        //convert svg source to URI data scheme.
        var url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
        //set url value to a element's href attribute.
        //$("#getSvg").href = url;
        document.getElementById("getSvg").href = url;
        document.getElementById("svgModalTitle").innerText = "Download Current SVG View";
        $('#svgModal').modal('show');
        $("#setNewInstructions").show();
        $("#svgInstructions").click(function(url, svgnessCopy) {
          $(this).off("click");

          document.getElementById("svgModalTitle").innerText = "One Moment While Your SVG is Prepared...";
          setTimeout(function(url, svgnessCopy) {
            $("#setNewInstructions").hide();
            //document.getElementById("getSvg").href = "";
            url = null;
            svgnessCopy = null;
          }.bind(this, url, svgnessCopy), 1000);

          //TODO: When clicking, make sure that svgnessCopy is set to null
        }.bind(this, url, svgnessCopy));
        //you can download svg file by right click menu.
        */
      }
      else {
        console.error("infopane data Error: " + status);
      }

      // Populate default infopane data

    }.bind(this, svgnessCopy));

  }
  else {

    show_svg(svgnessCopy); //open svg in another page


  }

}
//open svg in another page
function show_svg(svg) {
  // var svg = document.getElementById("output-pic");
  var serializer = new XMLSerializer();
  var svgString = serializer.serializeToString(svg);
  svgString = svgString.replace(/(unicode=\".+\")/g, ''); //take out unicodes, some of which break the svg
  var svg_blob = new Blob([svgString], {
    'type': "image/svg+xml"
  });


  if (window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveOrOpenBlob(svg_blob, 'svg_win.svg'); // Now the user will have the option of clicking the Save button and the Open button.
  }
  else {

    var url = URL.createObjectURL(svg_blob);
    var currentWindowTitle = $.address.title();
    //var svg_win = window.open(url, "svg_win.svg");
    var svg_win = window.open(url, "svg_win.svg", "resizable,scrollbars,status");
    if (svg_win !== undefined && svg_win !== null) {
      svg_win.onload = function() {
        setTimeout(function() {
          svg_win.document.title = currentWindowTitle; //Set title of window to something that makes sense.
        }.bind(this), 500);
      };
    }
    else {
      alert("To print this svg, you must allow pop-ups for this site.");
    }
  }
}

function zoomAll(e) {
  e.stopImmediatePropagation();

  //It takes a bit to do the resize/fit/center stuff.  So test to see if pan is finished
  var doResizeFitPan = function() {

    //$(SvgTweenEvent).off("svgTweenComplete", doResizeFitPan);
    //console.log("In doResizeFitPan()");
    // Marshall Clemens 03/08/16
    // Capture the zoom value - that fits the SVG to the current window size.
    // Use to calculate relative zoom values.

    zoomRatio = zoomTiger.getZoom();

    updateAddress();
    //console.log("hit reset button");

  };
  //$(SvgTweenEvent).on("svgTweenComplete", doResizeFitPan);
  zoomTiger.resize();
  zoomTiger.fit();
  zoomTiger.center();
  doResizeFitPan(); //TODO: Take this out of this function and put it back here  

}


/*
function show_svg(svgnessCopy) {
  var svg_win = window.open("", "svg_win");
  //var embedded_svg =  svgness; // document.getElementById("output-pic");
  var transplanted_svg = svg_win.document.importNode(svgnessCopy, true);
  var blank_root = svg_win.document.documentElement;
  svg_win.document.removeChild(blank_root);
  svg_win.document.appendChild(transplanted_svg);
} */
/*
 * This will navigate through the anchor tags that contain slide class name When
 * pane content is shown, it needs to set the vars, Slides and SlideSelected.
 * TODO: We need sets of these vars for the different panes
 */
$(window).keydown(function(e) {
  if (!zoomTiger) return;
  var $thisSlide;

  //don't do anything if focus is on a textarea or input
  var nodeName = e.target.nodeName.toLowerCase();
  //var nodeType = e.target.type.toLowerCase();
  if (nodeName == "textarea" || (nodeName == "input" && e.target.type.toLowerCase() == "text")) {
    return;
  }

  if ((e.shiftKey && e.keyCode == 188) || e.keyCode == 36) {
    //clicked on shift-comma or home
    SlideSelected = 0; //jump to beginning
    $(".selected").removeClass('selected');
    $(Slides.get(SlideSelected)).addClass('selected');
    $thisSlide = $(Slides.get(SlideSelected));
    runASlideInSlideShow($thisSlide);
  }
  else if ((e.shiftKey && e.keyCode == 190) || e.keyCode == 35) {
    //clicked on shift-period or end key
    SlideSelected = Slides.length - 1; //jump to end
    $(".selected").removeClass('selected');
    $(Slides.get(SlideSelected)).addClass('selected');
    $thisSlide = $(Slides.get(SlideSelected));
    runASlideInSlideShow($thisSlide);
  }

  //None of the commands below should have multiple keys, such as control-h or whatever.
  //Also make sure we don't have the focus on a form.
  if (!e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey /* && $(document.activeElement).is("body") */ ) {

    if (e.which === 190 || (e.which === 34)) {
      //typed in period or page down
      if (Slides.length) { //if we have any slides at all to navigate
        //clicked on period or page-down
        $(".selected").removeClass('selected');
        SlideSelected++;
        if (SlideSelected >= Slides.length) {
          //SlideSelected = 0;
          SlideSelected = Slides.length - 1;
        }
        if (SlideSelected < 0) {
          //SlideSelected = Slides.length - 1;
          SlideSelected = 0;
        }
        $(Slides.get(SlideSelected)).addClass('selected');
        $thisSlide = $(Slides.get(SlideSelected));
        runASlideInSlideShow($thisSlide);
      }
    }
    else if (e.which === 188 || (e.which === 33)) {
      //typed in comma or page up

      if (Slides.length) { //if we have any slides at all to navigate
        //clicked comma or page-up
        $(".selected").removeClass('selected');
        SlideSelected--;
        if (SlideSelected >= Slides.length) {
          SlideSelected = Slides.length - 1;
        }
        if (SlideSelected < 0) {
          //SlideSelected = Slides.length - 1;
          SlideSelected = 0;
        }
        $(Slides.get(SlideSelected)).addClass('selected');
        $thisSlide = $(Slides.get(SlideSelected));
        runASlideInSlideShow($thisSlide);
      }
    }
    else if (e.which == 86) {
      // if key is "v"
      e.stopImmediatePropagation();
      var v = $("#version");
      if (!v || !v.length) {
        $(".narration-pane").prepend("<div id='version'>" + version + "</div>");
      }
      else {
        $(v).toggle();
      }
    }
    else if (e.which === 65) {
      //clicked a key
      //c-click will will open a closed UNO, and close an open one
      idiagramSvg.gClicked = "a";
      //now set it back to null after a short time
      setTimeout(function() {
        idiagramSvg.gClicked = null;
      }, 600);
    }
    else if (e.which === 67) {
      //clicked c key
      //c-click will will open a closed UNO, and close an open one
      idiagramSvg.gClicked = "c";
      //now set it back to null after a short time
      setTimeout(function() {
        idiagramSvg.gClicked = null;
      }, 600);
    }
    else if (e.which === 71) {
      //clicked g key
      //Keyboard shortcut: A g-click on an UNO will trigger a gotoz=thatUNO
      idiagramSvg.gClicked = "g";
      //now set it back to null after a short time
      setTimeout(function() {
        idiagramSvg.gClicked = null;
      }, 600);
    }
    else if (e.which === 77) {
      //m-click on a uno will open the mapform for that uno
      //Keyboard shortcut: A m-click on an UNO will trigger a edit=thatUNO
      idiagramSvg.gClicked = "m";
      //now set it back to null after a short time
      setTimeout(function() {
        idiagramSvg.gClicked = null;
      }, 600);
    }

    // else if (e.which === 75) {
    //   //clicked k key
    //   //c-click will will open a closed UNO, and close an open one
    //   //idiagramSvg.gClicked = "k";
    //   $(".lockOnOff").each(function() {
    //     $(this).removeClass("lockOnOff");
    //   });
    //   //now set it back to null after a short time
    //   // setTimeout(function() {
    //   //   idiagramSvg.gClicked = null;
    //   // }, 600);
    // }
    else if (e.which === 76) {
      //clicked l (el) key
      //On an UNO: toggle highlight for that UNO
      idiagramSvg.elClicked = "l"; //lower-case "L" (el)
      //now set it back to null after a short time
      setTimeout(function() {
        idiagramSvg.elClicked = null;
      }, 600);
    }
    else if (e.which === 84) {
      //user hit the t key, which stops all traces - stoptrace=all
      var urlCommand = "+++&stoptrace=all";
      $.address.history(true);
      addCommandToURL("stoptrace", "all");
      $.address.history(false);

      if (urlCommand !== null) {
        // get a list of parameters and execute them
        //console.log("Custom On/off command: " + urlCommand);
        urlCommand = urlCommand.replace(/^\?/, ""); //replace leading "?" with nothing
        var q = getURLParameterList(urlCommand);
        processCommandsInURL(q);
      }
    }
    else if (e.which === 85) {
      //clicked u key, which Unhighlights all UNOs -  unhlt=all
      var urlCommand = "+++&unhlt=all";
      $.address.history(true);
      addCommandToURL("unhlt", "all");
      $.address.history(false);

      if (urlCommand !== null) {
        // get a list of parameters and execute them
        //console.log("Custom On/off command: " + urlCommand);
        urlCommand = urlCommand.replace(/^\?/, ""); //replace leading "?" with nothing
        var q = getURLParameterList(urlCommand);
        processCommandsInURL(q);
      }
    }
    else if (e.which === 79) {
      //clicked o key
      //c-click will will open a closed UNO, and close an open one
      idiagramSvg.gClicked = "o";
      //now set it back to null after a short time
      setTimeout(function() {
        idiagramSvg.gClicked = null;
      }, 600);
    }
    /* else if (e.which === 72) {
       //clicked h key to get help
       // alert("Help");
       if (designerPrefs.hasOwnProperty("helpLink")) {
         var link = document.createElementNS("http://www.w3.org/1999/xhtml", "a");
         link.href = designerPrefs.helpLink; //"http://45.55.23.31:3000/docs/help.html";
         link.target = "_blank";
         var event = new MouseEvent('click', {
           'view': window,
           'bubbles': false,
           'cancelable': true
         });
         link.dispatchEvent(event);
       }
     }*/

    else if (e.which === 72) {
      //clicked h key to get help as a modal popup
      showHelp();

    }
    else if (e.which === 69) {
      //clicked e key. want to toggle the east pane
      idiagramUi.myLayout.toggle("east");
      updateAddress("East Pane Toggled", true);
    }
    else if (e.which === 80) {
      //clicked p key. let user download the svg file.
      printSvg();
    }
    else if (e.which === 87) {
      //clicked w key. want to toggle the east pane
      idiagramUi.myLayout.toggle("west");
      updateAddress("West Pane Toggled", true);
    }
    else if (e.which == 220) {
      // if key is  \ (or should this be 92?)
      zoomAll(e);
    }
    else if (e.which == 91 || e.which == 219) {
      // if key is "["
      // zoomTiger.zoomOut();
      // Use our own zoom increment
      zoomTiger.zoomBy(0.833333); //defaults to 0.833333
    }
    else if (e.which == 93 || e.which == 221) {
      // if key is "]"
      // zoomTiger.zoomIn();
      // Use our own zoom increment
      zoomTiger.zoomBy(1.2);
    }
    else if (e.which == 37 || e.which == 38 || e.which == 39 || e.which == 40) {
      // Arrow key for panning

      var pan = zoomTiger.getPan();
      var panStep = 100; // the pan increment to be used for all

      if (e.which == 37) {
        // Left-arrow key
        pan.x = pan.x + panStep;
        zoomTiger.pan(pan);
      }
      else if (e.which == 39) {
        // Right-arrow key
        pan.x = pan.x - panStep;
        zoomTiger.pan(pan);
      }
      else if (e.which == 38) {
        // Up-arrow key
        pan.y = pan.y + panStep;
        zoomTiger.pan(pan);
      }
      else if (e.which == 40) {
        // Down-arrow key
        pan.y = pan.y - panStep;
        zoomTiger.pan(pan);
      }
    }
    else if (e.keyCode == 27) {
      //escape key pressed, so show svg instead of map db editor
      $(".information-pane").show();
      $("#mapDbEditor").hide();
    }
  }
});


function normalizeMapPane() {
  // Marshall Clemens 03/09/16
  // Setup svg-pan-zoom for the new window size - without altering the user's view of the map.
  // console.log("In normalizeMapPane()");



  // Capture the current values
  var oldpan = zoomTiger.getPan();
  var oldzoom = zoomTiger.getZoom();


  var getZoomRatio = function() {
    //console.log("In normalizeMapPane() svgTweenComplete");
    zoomRatio = zoomTiger.getZoom();
    // $(SvgTweenEvent).off("svgTweenComplete", getZoomRatio);
    // Reset the old pan and zoom values - so we don't change the user's current view
    zoomTiger.zoom(oldzoom);
    zoomTiger.pan(oldpan);
  };
  //$(SvgTweenEvent).on("svgTweenComplete", getZoomRatio);
  // Set up for the new window size
  zoomTiger.resize();
  zoomTiger.fit();
  getZoomRatio(); //TODO: Pull stuffo ut of this function and put back here
  /* setTimeout(function() {
     console.log("In normalizeMapPane() setTimeout()");
     // Capture the new zoom ratio value - that will fit the SVG to the current window size.
     

     // No need to update the addresss as we deliberately haven't change the view
     //    updateAddress();
   }, 1000);*/

}
/**
 * This will insert content (from the data parameter) into the story pane.  If isHtml == true
 * then it is assumed that this is not a markdown file and we will not convert it to html from markdown.
 * If this is the first time this function is called, it will create a div element, with an id of 
 * infoPaneDynamicContent___info with a class called info-p-content.  If this element contains a class
 * called show then this part of the info-pane will display. 
 * 
 **/
function populateInfoPaneWithUrlContent(data, isHtml) {
  // TODO: When this file is replaced, need to delete any
  // event handlers to stop memory leak.
  var infopane;

  //if this is an html file, no need to process it. In future check on security problems.
  if (!isHtml) {
    data = decodeURI(data);
    infopane = converter.makeHtml(data);
  }
  else {
    infopane = data;
  }
  // this will clean up event handlers
  // TODO:Do i really need this?
  $(".information-pane p").remove();

  // see if we already have a div to shove this in. If not,
  // make it
  if ($("#infoPaneDynamicContent___info").length === 0) {
    var divToWrap = document.createElement("div");
    $(divToWrap).attr({
      "class": "info-p-content",
      id: "infoPaneDynamicContent___info"
    });
    $(".information-pane").append(divToWrap);
  }
  CurrentIdOfInfoPane = "infoPaneDynamicContent___info";
  var dyn = $("#infoPaneDynamicContent___info")[0];

  if (dyn) {

    //Need to remove event handlers from links on this.
    $(dyn).find("a").off();
    // replace data in our special dynamic div in
    // .information-pane with new content
    $(dyn).html(infopane);
    $(".info-p-content").removeClass("show");
    $("#mapDbEditor").hide(); //don't want to see the map db editor while looking at info pane content
    $(dyn).addClass("show");
    $('.ui-layout-pane-east').scrollTop(0); //scroll to top of new content in info pane
    createHoverEventForTaggedWords();
  }
}

function populateStoryPaneWithUrlContent(data, isHtml) {
  // TODO: When this  file is replaced, need to delete any
  // event handlers to stop memory leak.
  var storyPane;
  //if this is an html file, no need to process it. In future check on security problems.
  if (!isHtml) {
    data = decodeURI(data);
    //data = decodeURIComponent(data);
    storyPane = converter.makeHtml(data);
  }
  else {
    storyPane = data;
  }
  //remove event listeners
  $(".narration-pane").find("a").off();
  $(".narration-pane").html(storyPane);
  $('.ui-layout-west').scrollTop(0); //scroll to top
  Slides = $('a.slide');
  SlideSelected = -1;
  createHoverEventForTaggedWords();
  $(".slide").click(function(e) {
    for (var i = 0; i < Slides.length; i++) {
      if (Slides[i] === e.currentTarget) {
        SlideSelected = i;
        $(".selected").removeClass('selected');
        $(Slides.get(SlideSelected)).addClass('selected'); //TODO: can't we just do this with a couple of lines of jQuery?
        break;
      }
    }
  });
}



/**
 * Called from fileInfo command after calling $.get(infofile, callbackLoadDynamicContent.bind(this, infofile, keyName));
 * Also called from story command where this is called: $.get(infofile, callbackLoadDynamicContent.bind(this, infofile, keyName));
 **/
function callbackLoadDynamicContent(filePath, whichPane, fileContents, status) {
  if (status === "success") {

    // get extension of file.
    var ext = /^data:audio\/([^;,]+);/i.exec(filePath);
    if (!ext) {
      ext = /\.([^.]+)$/.exec(filePath.split('?', 1)[0]);
    }

    if (ext) {
      ext = ext[1].toLowerCase();

      switch (ext) {

        case "hbs": //we got a handlebars file
          //var fileContents = "<p>Hello, my name is {{name}}. I am from {{hometown}}. I have </p>" +

          var template = Handlebars.compile(fileContents);
          //mapEditorTemplate = template; //global to keep track of this

          //data is null first time in.  Or we need a way to grab some data to put in.
          //TODO:  !!! Grab any default data from database and insert this here!!!
          var data = {
            /*"name": "Alan",
            "hometown": "Somewhere, TX",
            "kids": [{
              "name": "Jimmy",
              "age": "12"
            }, {
              "name": "Sally",
              "age": "4"
            }]*/

          };
          var result = template(data);
          if (whichPane == "infofile" || whichPane == "info" || whichPane == "fileInfo") {
            //Note when we load this in, this may contain a global variable called infoFileData
            //it contains data that is unique to this particular info file.
            // here is an example:
            // var infoFileData = {
            //   dbEditing : true //let's me know that this allows user to click on a uno and have it populate this form with it's row of data from the database
            // }
            populateInfoPaneWithUrlContent(result, true);
          }
          else if (whichPane == "storyfile" || whichPane == "story") {
            // alert("storypane code not yet completed.");
            LastStoryFile = filePath;
            populateStoryPaneWithUrlContent(result, true);
          }
          break;
        case "txt":
        case "md":
        case "html":
        case "htm":
          var isHtml = ((ext === "html") || (ext === "htm")) ? true : false; //if true then don't put through decodeURI or markdown
          if (whichPane == "infofile" || whichPane == "info" || whichPane == "fileInfo") {
            populateInfoPaneWithUrlContent(fileContents, isHtml);
          }
          else if (whichPane == "storyfile" || whichPane == "story") {
            // alert("storypane code not yet completed.");
            LastStoryFile = filePath;
            populateStoryPaneWithUrlContent(fileContents, isHtml);
          }
          break;
        default:
          break;

      }
    }
  }
  else {
    console.error("infopane data Error: " + status);
  }

  // Populate default infopane data

}



/**
 * Called after loading the json of a map form that was created with formBuilder
 **/
function callbackLoadMapEditor(fileContents) {


  //if ($("#mapDbEditor").length === 0) { 
  //we don't test for the presence of mapDbEditor because I test to see if the mapEditor file has been loaded before calling this function.
  //So, right now, if we get this this position, this function has never been called.  This is one reason the browser must be refreshed each time a new map
  //svg file is loaded.
  var divToWrap = document.createElement("div");
  $(divToWrap).attr({
    "class": "mapDbEditor",
    id: "mapDbEditor"
      //set style at first to display: none;
      ,
    style: "display: none;"
  });
  $(".information-pane").append(divToWrap);
  //Now let the esape button remove this form view without saving. See this under $(window).keydown(function(e)
  //I upt this here also because if the focus was on this editor, then hitting escape did not work
  $("#mapDbEditor").keydown(function(e) {
    if (e.keyCode == 27) {
      //escape key pressed
      // $(".information-pane").show();
      $("#mapDbEditor").hide();
    }
  });
  var dyn = $("#mapDbEditor")[0];
  if (dyn) {
    $(dyn).html(fileContents);
    $(".info-p-content").removeClass("show");
  }


}



/**
 * This will determine if a variable is an integer
 */
function isNumeric(num) {
  return !isNaN(num);
}
/**
 * check to see there is a question mark at the beginning of a url. Add it if missing. If not, then
 * .address.parameter() adds it in weird ways.
 */
function verifyQuestionMarkInURL(url) {
  if (/^[\/][?]/.test(url) !== true) {
    if (/^\/[^?]/.test(url)) {
      // if we are missing ?, such as /on=
      url = url.replace(/^\//, "\/?");
    }
    else if (/^[^\/]/.test(url) && /^[^?]/.test(url)) {
      // there must be no leading slash or ?
      url = "\/?" + url;
    }
    else if (/^[?]/.test(url)) {
      // if there is only a ? then add a slash.
      url = url.replace(/^\?/, "\/?");
    }
  }
  return url;
}
/**
 * used to Returns true if parameterList contains a matching command/value pair
 * Now I want it to return the number of matches, so that if there are DUPLICATES in the url
 * then I know to make it so there is only one.
 */
function isDuplicatedCommandValue(parameterList, command, value) {
  var groupId, key, numberOfDups = 0;
  // var pm = $.address.parameterNames();
  // var pname = $.address.parameter(command);
  for (var i = 0; i < parameterList.length; i++) {
    // command will be something like "open" or "close" or "on" or "off"
    key = Object.getOwnPropertyNames(parameterList[i])[0];
    groupId = parameterList[i][key];
    if (key === command && groupId === value) {
      // return true;
      numberOfDups++;
    }
  }
  return numberOfDups;
}
/**
 * Send in a command and a value and this will add it to the url address bar. It will make sure that it is not
 * duplicated. NOTE: You must worry about setting $.address.history(false) before and after this if need be.
 */
function addCommandToURL(command, value) {
  var parameterList = getURLParameterList($.address.queryString());
  if (parameterList && parameterList.length) {
    if (!isDuplicatedCommandValue(parameterList, command, value)) {
      var myUrlAddress = parameterListArrayToUrlAddress(parameterList);
      $.address.value(verifyQuestionMarkInURL(myUrlAddress + "&" + command + "=" + value));
    }
  }
}
/**
 * This takes an array of parameter objects and creates a new one with commands filtered out that already
 * match the state. i.e., if a command is open=foo and we have <g id="foo" class="open" >, this will remove
 * this command from the parameter list. A new list will be returned. purgeMatchedStatesFromParamList() NOTE:
 * This does NOT test to see if there is a duplicate command in the URL list
 */
function purgeMatchedStatesFromParamList(parameterList) {
  var command;
  var groupId, groupObject;
  // this new list will be the same as parameterList, but without redunant
  // commands. If a group is already opened, it won't be opened again
  // I needed to do it this way so that when we hover off, I can simply
  // reverse what I set, and not reverse something that was set before.
  var newParameterList = [];
  // parameterList[0];
  // look through each key/value pair and then call the isStatusMatch()
  // function to see if it is
  // already set to that.
  for (var i = 0; i < parameterList.length; i++) {
    // command will be something like "open" or "close" or "on" or "off"
    command = Object.getOwnPropertyNames(parameterList[i])[0];
    // if (command === "+++") {
    // TODO:openall and closeall in this list may not reverse this when
    // hoover off
    var rfxtypes = /^(?:\+\+\+|panx|pany|zoom|panzoom|all|animate|play|stop|stopall|openall|closeall|wpane|epane|formInfo|info|fileInfo|unoInfo|story|edit|map|infotext|storytext|maptext|goto|gotoz|run|move|scale|fade|rotate|masteron|masteroff|hlt|unhlt)$/;
    if (rfxtypes.test(command) || (typeof window[command] === "function")) {
      // insert the "+++" parameter in the new list
      newParameterList.push(parameterList[i]);
      continue;
    }
    groupId = parameterList[i][command];

    //TODO. Make sure there are no other problems with the following code. I am not going to purge on=.someClass or whateverCommand=.someClass
    if (isClass(groupId)) {
      newParameterList.push(parameterList[i]);
      continue;
    }

    groupObject = idGroupObject[groupId];
    //If we don't have a valid id or if we not are using unhlt=all
    //TODO: See if the if statement is right.
    if (groupObject === undefined || (groupId == "all" && command == "unhlt")) {
      alert("Error. Unhandled command or id. Command: " + command + " id: " + groupId);
      console.error("Error. Unhandled command or id. Command: " + command + " id: " + groupId);
      return null;
    }
    if (!groupObject.isStateMatch(command)) {
      // this state was not already set, so it gets into the parameter
      // list.
      newParameterList.push(parameterList[i]);
    }
  }
  return newParameterList;
}


/**
 * This was called from updateAddress() and in processCommandsInURL(), so I made this function. update the pan
 * and zoom parameters in the URL address. toFixed(x) means we want to only include one x points, else each
 * zoom and pan value has two many decimal points taking up space. It is up to the caller to handle
 * $.address.history(false), etc.
 */
function updatePanInURL() {
  var s = zoomTiger.getSizes();
  var pan = zoomTiger.getPan();

  // Use absolute pan values - Marshall Clemens 03/07/16
  // The calculation below converts from pixels in the map-pane to points in the SVG
  var relativeX = 0;
  var relativeY = 0;
  if (s.realZoom == 0) {
    relativeX = 0;
    relativeY = 0;
  }
  else {
    relativeX = ((s.width / 2) - pan.x) / s.realZoom;
    relativeY = ((s.height / 2) - pan.y) / s.realZoom;
  }
  $.address.parameter("panx", relativeX.toFixed(1));
  $.address.parameter("pany", relativeY.toFixed(1));
}

/**
 * When a user clicks on an object, this will update the address bar with that item. We do this by going
 * through all the items that are clicked on. if doHistory is defined and true, then let this update be
 * recorded in browser history
 * uno is optional. If you send it in then the label associated with it will be used in the browser history
 */
function updateAddress(uno, doHistory) {
  $.address.autoUpdate(false);
  if (doHistory === undefined) doHistory = false;
  if (doHistory === false) {
    $.address.history(false);
  }
  // $.address.value("");
  // set title and history value from label field in db
  if (uno !== undefined && uno !== null) {
    var label = getDatabase(uno, "label");
    if (label.length) {
      $.address.title(PageTitle + " " + label);
    }
    else {
      //uno is not an id, but a title value to save in history
      $.address.title(PageTitle + " " + uno);
    }
  }
  if (zoomTiger !== undefined) {
    updatePanInURL();

    // The zoom value needs to be relative to the current window size.
    // zoomRatio is the value of zoom that fits the SVG to the current window size
    // i.e. so a zoom value of 1.0 always fits the full map.
    var zoom = zoomTiger.getZoom();
    var relativeZ = zoom / zoomRatio;

    $.address.parameter("zoom", relativeZ.toFixed(3));
  }

  // do left and right panes open or shut
  var state = idiagramUi.myLayout.state;
  var isWestPaneOpen = !state.west.isClosed;
  var isEastPaneOpen = !state.east.isClosed;
  var westCurrentSize = state.west.size;
  var eastCurrentSize = state.east.size;
  $.address.parameter("wpane", isWestPaneOpen ? westCurrentSize : "0");
  $.address.parameter("epane", isEastPaneOpen ? eastCurrentSize : "0");

  if ($.address.parameter("story") == undefined && LastStoryFile !== null) {
    $.address.parameter("story", LastStoryFile);
  }

  doHistory ? $.address.history(true) : {};
  $.address.update();
  $.address.autoUpdate(true);
  $.address.history(true);
  idiagramSvg.PreviousUrlAddress = $.address.value(); //added 3/21/17
}
/**
 * There is a variable called defaultURL in the html file that has the default URL if no parameters were sent
 * while loading the page for first time. This populates the address bar with defaultURL NOTE: This is onlly
 * called from processAddress()
 */
function updateAddressWithDefaultURL() {
  if (designerPrefs.defaultURL !== undefined && designerPrefs.defaultURL.length) {
    var result = verifyQuestionMarkInURL(designerPrefs.defaultURL);
    $.address.value(result);
    //$.address.update(); //added this 6/1/2016. Why was this not updating before????
    //Now get rid of story file if we already had one loaded.
    if (LastStoryFile !== null) {
      $.address.parameter("story", "");
    }
    //now lose +++, which probably does not make sense to be here.
    $.address.parameter("+++", "");


    PreviousUrlAddress = $.address.value();
    /*
     * return; var anchorValues = {}; var newAnchor =
     * document.createElement("a"); $(newAnchor).attr("href",defaultURL)
     * //this populates anchorValues with the hash value (location) and
     * parameter list getLastIdParameterOnClickedAnchor(newAnchor,
     * anchorValues); var q = anchorValues.parameterList; var locationString =
     * anchorValues.locationString;
     * 
     * //Now stick those values in address bar $.address.autoUpdate(false);
     * if (locationString.length) { $.address.hash(locationString); }
     * $.address.queryString(anchorValues.parameterString);
     * $.address.update(); $.address.autoUpdate(true);
     */
  }
}
/**
 * handle deep linking. This will look at address bar and mimic the clicking events of one or more objects in
 * the SVG file. toggleStuffOffOn==true, Then toggle tooltip off then on. We don't want to toggle tooltips off
 * and on when the address is coming from outside of the page; only when something is clicked on.
 * makePersistant == true means we want to make the object open that we clicked on.
 */
function processAddress() {
  // make sure svgness is defined
  if (svgness !== undefined) {
    //console.log("In processAddress()");
    // var q = $.address.parameterNames();

    var q = getURLParameterList($.address.queryString());
    // if (clickedOnObjects.length) {
    // Put this back into a normal state if it isn't already
    // unclickAllAndReset();
    // }

    $.address.autoUpdate(false);
    //I think that q.length is always at least one
    if (!q || q.length < 2) {
      updateAddressWithDefaultURL();
      // now we have complete list, polpulate q with the complete list of
      // parameters in the URL
      // q = getURLParameterList($.address.queryString());
      // I am going to return because calling
      // updateAddressWithDefaultURL() will cause
      // $.address.externalChange(function(e) to be triggered, which will
      // call this function again.
      // return;
    }
    else {
      // See if there is at least some object to work on. If not, I am
      // assuming there are no id's, in which I will use the
      // default URL stored in the web page defaultURL variable, if any.
      var keys = ["+++", "on", "off", "open", "close", "all", "animate", "play", "stop", "openall", "closeall", "stopall",
        "info", "formInfo","unoInfo", "story", "edit", "infotext", "maptext", "storytext", "map", "goto", "gotoz", "run", "move", "scale", "fade", "rotate",
        "masteron", "masteroff"
      ];
      if (!isKeyInParameterList(q, keys)) {
        updateAddressWithDefaultURL();
        // now we have complete list, polpulate q with the complete list
        // of parameters in the URL
        q = getURLParameterList($.address.queryString());
        // I am going to return because calling
        // updateAddressWithDefaultURL() will cause
        // $.address.externalChange(function(e) to be triggered, which
        // will call this function again.
        // return;
      }
    }

    //TODO: is turning off history the right thing to do here?
    // $.address.history(false);

    // if there is no story defined to stick in .narration-pane then get it from the default defined in html
    var isStory = $.address.parameter("story");
    if (isStory == undefined && designerPrefs.storyFile !== undefined && LastStoryFile === null) {
      $.address.parameter("story", designerPrefs.storyFile);
    }
    $.address.update(); //added this 6/1/2016. Why was this not updating before????
    idiagramSvg.PreviousUrlAddress = $.address.value();
    $.address.autoUpdate(true);
    // $.address.history(true);
    q = getURLParameterList($.address.queryString());
    var scrollToId = $.address.path().replace(/\//g, ''); //this is an id in pane that we should scroll to
    processCommandsInURL(q, scrollToId);
  }
}

/**
 * This will get the id parameter with the highest number (i.e., id4, not id3) in an anchor tag with a class
 * called "tagged." Called from createHoverEventForTaggedWords() and also from somewhere in
 * createHoverEventForTaggedWords() anchorValues contains a list of parameters in the anchor tag, plus other
 * things I may need to return
 */
function getLastIdParameterOnClickedAnchor(thisClickedOnObject, anchorValues) {
  // looks like this: "#/?id0=Accounting_2_"
  var locationString = $(thisClickedOnObject).prop("hash");
  if (locationString !== undefined) {
    locationString = locationString.replace(/.*\#(.*)/, "$1");
    var parameterString = locationString.replace(/.*\?(.*)/, "$1");
    // onclick="sndReq('j=1&q=2&t=127.0.0.1&c=5');
    var parameterTokens = parameterString.split("&");
    // onclick="sndReq('j=1,q=2,t=127.0.0.1,c=5');
    var parameterList = [];
    for (var j = 0; j < parameterTokens.length; j++) {
      var parameterName = parameterTokens[j].replace(/(.*)=.*/, "$1");
      // j
      var parameterValue = parameterTokens[j].replace(/.*=(.*)/, "$1");
      // 1
      parameterList[parameterName] = parameterValue;
    }
    var q = parameterList;
    anchorValues.parameterList = parameterList;
    anchorValues.locationString = locationString;
    anchorValues.parameterString = parameterString;
    if (q && Object.keys(q).length) {
      //
      // get id of object, then triggerHandler showing it
      // we are not going to all just an id. it needs to be id0, id1, etc
      // var objectId = $.address.parameter("id");
      // set objectId to null if it is undefined.
      // objectId = objectId ? objectId : null;
      var filteredKeyVals = getAllKeysAndValuesStartingWith(q, "gotoz");
      // var k = Object.keys(q).length;
      // grab last id on the list to highlight it.
      var objectId = filteredKeyVals["gotoz"];
      if (objectId && objectId.length) {
        anchorValues.lastId = objectId;
      }
      else {
        filteredKeyVals = getAllKeysAndValuesStartingWith(q, "open");
        // var k = Object.keys(q).length;
        // grab last id on the list to highlight it.
        objectId = filteredKeyVals["open"];
        if (objectId && objectId.length) {
          anchorValues.lastId = objectId;
        }
        else {
          filteredKeyVals = getAllKeysAndValuesStartingWith(q, "on");
          // var k = Object.keys(q).length;
          // grab last id on the list to highlight it.
          objectId = filteredKeyVals["on"];
          if (objectId && objectId.length) {
            anchorValues.lastId = objectId;
          }
        }
      }

      // TODO: this is ugly code because I changed it from something else.
      // In hurry
      return objectId != undefined ? objectId : 0;
    }
    else {
      anchorValues.lastId = 0;
      return 0;
    }
  }
  else {
    // big error if this is 0. Probably programmer error
    return 0;
  }
}
/**
 * This will allow hovering over certain text to mimic a hovering event on objects in the svg Sample anchor
 * tag in the text that will triggerHandler a hover event: <a
 * href="/#/?id0=SDGs_2_&id1=SDGs_4_&id2=IntegratedSolutions_2_" class="tagged">Integrated Solutions</a> <a
 * href="/#/?id0=Accounting_2_&id1=SDGs_4_&id2=IntegratedSolutions_2_" class="tagged">Accountants & Actuaries</a>
 * #/?id0=Accounting_2_ We need to do this everytime we populate stuff with text, so user can hover over stuff
 * And mimic hovering over objects in svg We only want to load this once for each object id that is loaded, so
 * we don't get multiple events registered, so the parameter, clickedObjectId, helps us track that.
 */
function createHoverEventForTaggedWords() {
  // see if this is already evented
  // var firstObject = $("a.tagged").get(0);
  // if (ObjectsAlreadyHoverEvented.indexOf(firstObject) === -1) {
  // ObjectsAlreadyHoverEvented.push(firstObject);
  // console.log("In createHoverEventForTaggedWords()");
  // var objectStack = [];
  // var dummy = 1;
  $("a.tagged:not(.evented),a.hover:not(.evented)")
    .hover(
      function(e) {
        var that = this;
        TextHoverTimer = setTimeout(function() {
          //console.log("In a.tagged:not(.evented) in createHoverEventForTaggedWords()");
          var anchorValues = {};
          if (svgness !== undefined) {
            //Record the state of all elements so you can restore them later.
            that.savedStateOfWrappedElements = [];
            getStatesOfAllWrappedElements(that.savedStateOfWrappedElements);

            // that.isActiveHover means I hovered on
            // this long enough to qualify for it to
            // process hovering.
            // if this is false on hover off, I do
            // nothing
            that.isActiveHover = true;
            //console.log("In mouseenter");
            // we want to know the current address
            // here so that we can return to what it
            // was before.
            that.previousUrlAddress = $.address.value();
            // this should not have a clicked class
            // before coming into this hover event. It should get added only
            // while hovering. I need to take any
            // clicked class off because sometimes
            // we do not get a hover-off event, and the
            // clicked class doesn't get removed, thus leaving this
            // in a sort of persistant (open) state
            if (hasClass(this, "clicked")) {
              removeClass(this, "clicked");
            }
            anchorValues = {};
            // looks like this:
            // "#/?id0=Accounting_2_"
            var locationString = $(that).prop("hash");
            locationString = locationString.replace(/.*\#(.*)/, "$1");
            var parameterString = locationString.replace(/.*\?(.*)/, "$1");
            // Now get the path that is right after
            // the hash, in case we should scroll
            // down the info or story pane.
            // $.address.autoUpdate(false);
            // var savePath = $.address.path();
            // var saveExistingHash =
            // $.address.queryString();
            // $.address.queryString(parameterString);
            // var scrollToId =
            // $.address.path().replace(/\//g, '');
            var parameterList = getURLParameterList(parameterString);
            // we use that.originalParameterList to
            // store our original unpurged parameter
            // list
            that.originalParameterList = parameterList;
            // Let us go through these parameters
            // and see if any are already set to the
            // same state.
            that.isPlusPlusPlusInParameters = false;
            if (isKeyInParameterList(parameterList, ["+++"])) {
              that.isPlusPlusPlusInParameters = true;
              parameterList = purgeMatchedStatesFromParamList(parameterList);
            }
            // We use parameterList when we hover
            // off
            if (parameterList) {
              that.parameterList = parameterList;
              if (that.isPlusPlusPlusInParameters === true && that.parameterList.length < 2) {

                // if there is nothing in the
                // parameterList but "+++" then
                // don't process this
              }
              else { // TODO: Maybe later add
                // code that processes the location path that is right after the hash
                processCommandsInURL(parameterList, null);
                // we don't really use anchorValues
                // here
                anchorValues = {};
                var thisId = getLastIdParameterOnClickedAnchor(that, anchorValues);
                if (thisId !== undefined && thisId !== 0 && idGroupObject[thisId] !== undefined) {
                  populateInfoPane(idGroupObject[thisId]);
                }
              }
            }
          }
        }.bind(that), TextHoverDelay);
      },
      function() {
        clearTimeout(TextHoverTimer);
        if (this.isActiveHover === true) {
          this.isActiveHover = false;
          // TODO: We need to return to previous state, not
          // put everything to default values.
          if (hasClass(this, "clicked")) {
            // if user clicked on this, then when hover off,
            // do nothing.
            // i can tell if he clicked on this because in
            // the click listener singleClk = function()
            // I add click to this class.
            removeClass(this, "clicked");
            return;
          }

          //We saved them with mouse hover; this will restore them with hover off.
          restoreStatesOfAllWrappedElements(this.savedStateOfWrappedElements);
          $.address.autoUpdate(false);
          $.address.history(false);
          $.address.value(this.previousUrlAddress);
          $.address.update();
          $.address.history(true);
          $.address.autoUpdate(true);
          return;
        }
      });
  // TODO: separate this out so it is only defined once.
  var singleClk = function(event) {
    //console.log("In singleClk() for text");
    // will this just do this automatically?
    // if user clicked on this, then when hover off, do nothing.
    addClass(this, "clicked");

    //I am also calling this here because I call event.stopImmediatePropagation();
    // and event.preventDefault(); below, which makes it so if there is both a slide and a hover class
    // the slide stuff doesn't get called.  So I call it here.  If they both get called for
    //some reason, there is no bad effects.
    if (hasClass(this, "slide")) {
      for (var i = 0; i < Slides.length; i++) {
        if (Slides[i] === event.currentTarget) {
          SlideSelected = i;
          $(".selected").removeClass('selected');
          $(Slides.get(SlideSelected)).addClass('selected');
          break;
        }
      }
    }
    // If this is a link to a svg object on this page, make sure we know
    // there is a click event
    // so we know to toggle the off-on of the tooltip.
    // AnchorTagClicked = true;
    // re-write this so that we return the url back to what it was with
    // added commands
    // addCommandToURL(command, value)
    // do not do anything if we only have +++ in the parameter list and
    // nothing else
    if (this.isPlusPlusPlusInParameters === true) {
      // update the url bar
      // $.address.history(false); we want to update url address bar when
      // stuff is clicked on
      // need to get this.parameterList less the "+++" stuff
      // var purgedParameterList =
      // removeCommandFromParameterListArray(this.parameterList, "+++");
      var purgedParameterList = removeCommandFromParameterListArray(this.originalParameterList, "+++");
      // var myUrlAddress =
      // parameterListArrayToUrlAddress(purgedParameterList);
      // var urlToAdd = this.previousUrlAddress + "&" + myUrlAddress;
      $.address.autoUpdate(false);
      $.address.history(false);
      // add +++ commands to url
      $.address.value(this.previousUrlAddress);
      $.address.update();
      for (var i = 0; i < purgedParameterList.length; i++) {
        // command will be something like "open" or "close" or "on" or
        // "off"
        var command = Object.getOwnPropertyNames(purgedParameterList[i])[0];
        // if (command === "+++") {
        // var rfxtypes = /^(?:\+\+\+|panx|pany|zoom|all)$/;
        // if (rfxtypes.test(command)) {
        // insert the "+++" parameter in the new list
        // newParameterList.push(parameterList[i]);
        // continue;
        // }
        var groupId = purgedParameterList[i][command];
        addCommandToURL(command, groupId);
      }
      // we want to record this in browser history
      $.address.history(true);
      // we want to update this to the address bar
      $.address.update();
      // from now on any time we call $.address.value(foo) it will write
      // the value to the address bar.
      $.address.autoUpdate(true);
      // $.address.value(verifyQuestionMarkInURL(urlToAdd));
      // $.address.autoUpdate(true);
      // $.address.history(true);
    }
    else if (this.isPlusPlusPlusInParameters === false && this.parameterList.length) {
      // set history and autoupdate to false while we fix up this url
      $.address.history(false);
      $.address.autoUpdate(false);
      // the url gets whatever is in the this.parameterList
      var url = parameterListArrayToUrlAddress(this.parameterList);
      url = verifyQuestionMarkInURL(url);
      $.address.value(url);
      if (!isKeyInParameterList(this.parameterList, ["panx", "panzoom"])) {
        updateAddress(null, false);
      }
      // now we are ready to put this in history
      $.address.history(true);
      $.address.update();
      $.address.autoUpdate(true);
    }
    PreviousUrlAddress = $.address.value();
    event.stopImmediatePropagation();
    event.preventDefault();
  };

  /**
   * This will be called below. This will create click and double-click event for anchor elements that are in
   * pane content.
   */
  // function handleClickAndDoubleClickForText() {
  // TODO: separate this out so it is only defined once.
  var doubClkFn = function() {
    //console.log("In doubClkFn() for text");
    // I do not use anchorValues in this instance.
    var anchorValues = {};
    var thisId = getLastIdParameterOnClickedAnchor(this, anchorValues);
    var doubleClick = getDatabase(thisId, "ondoubleclick");
    if (doubleClick && doubleClick.length && doubleClick !== "0") {
      var target = getDatabase(thisId, "target");
      // if no target specified open in new window
      target = target.length ? target : "_blank";
      var link = document.createElementNS("http://www.w3.org/1999/xhtml", "a");
      link.href = doubleClick;
      // if target field is current, need to send in "" to get this to
      // open in current window
      link.target = target === "current" ? "" : target;
      var event = new MouseEvent('click', {
        'view': window,
        'bubbles': false,
        'cancelable': true
      });
      link.dispatchEvent(event);
    }
    // e.stopImmediatePropagation();
    // e.preventDefault();
  };

  // set up trigger for single or double click
  /*
   * $("a.tagged:not(.evented)").each(function() {
   * $(this).singleDoubleClickText(singleClk, doubClkFn); });
   */
  // }
  $("a.tagged:not(.evented),a.hover:not(.evented)").each(function() {
    $(this).click(singleClk);
  });
  $("a.tagged:not(.evented),a.hover:not(.evented)").each(function() {
    $(this).keypress(function(e) {
      if (e.key === "d") {
        doubClkFn.call(this);
      }
    });
  });
  // handleClickAndDoubleClickForText();
  // add evented so we don't double-add event handler to this.
  $("a.tagged:not(.evented),a.hover:not(.evented)").addClass('evented');

  // reset the container holding all the slides
  // Need to reset the slideshow start values when you load in a
  // new story pane
  //NOTE:  I am not going to worry about slides in the ino pane right now because
  //   if I am pressing arrow keys during a slide, and it loads an info pane, then
  // it resets the key I am on and it sets it back to the start.
  // Slides = $('a.slide');
  //SlideSelected = -1;
} // end of createHoverEventForTaggedWords()
/**
 * Loads and svg file
 */
function createNewEmbed(src) {
  var svgFile = src;
  var loadXML = new XMLHttpRequest;

  function handler() {


    if (loadXML.readyState == 4 && loadXML.status == 200) {
      // $("#container").innerHTML=loadXML.responseText;
      //hide container until we be finished processing svg
      $("#container").css("visibility", "hidden");
      $("#container").html(loadXML.responseText);
      loadXML.onreadystatechange = null; //Had to do this because other svg loadation was calling this, I think. TODO: In future, if we want to load new maps without refreshing page, this will need to be changed.
      loadXML = null;
      svgloaded();
      // ---show in this example textarea---
      // mySvgValue.value=svgInlineDiv.innerHTML
    }

  }
  if (loadXML !== null) {
    loadXML.open("GET", svgFile, true);
    loadXML.onreadystatechange = handler;
    loadXML.send();
  }
}
/**
 * This will take a row from the master db and the override db and merge them
 */
function mergeTwoIdsInMasterAndOverride(master, override) {
  /*
   * Merges two (or more) objects, giving the last one precedence
   */
  if (typeof master !== 'object') {
    master = {};
  }
  for (var property in override) {
    if (override.hasOwnProperty(property)) {
      var overrideProperty = override[property];
      if (typeof overrideProperty === 'object') {
        master[property] = mergeMasterAndOverride(master[property], overrideProperty);
        continue;
      }
      if (overrideProperty.length) {
        master[property] = overrideProperty;
      }
    }
  }
  return master;
}
/**
 * Merge master and override databases. Returns a master database that is merged. if there is a field in
 * override that is missing in master, this adds it.
 */
function mergeMasterAndOverride(master, override) {
  for (var i = 0, j = override.length; i < j; i++) {
    var foundStuff = false;
    for (var k = 0, m = master.length; k < m; k++) {
      foundStuff = false;
      if (override[i].id === master[k].id) {
        master[k] = mergeTwoIdsInMasterAndOverride(master[k], override[i]);
        foundStuff = true;
        break;
      }
    }
    if (foundStuff === false) {
      // We never found a match, so add this to master.
      master.push(override[i]);
    }
  }
  return master;
}
/**
 * This is called after getting the master database. This gets the override database, then merges them
 * according to the specs. Basically the we use the data from the master database. The override database will
 * override the data from the master. If master or override collection is not available, this will use the one
 * that is available, if any
 */
function getOverRideDatabase(masterDatabase) {
  if (false) /* TODO: Implement the override database junk sometime */ {
    //if (designerPrefs.overrideDB !== undefined && designerPrefs.overrideDB.length) {
    $.get("/mapdata/" + designerPrefs.overrideDB, function(data, status) {
      // TODO: Create better error-handling
      if (status === "success") {
        //var doc2data = []; //this will contain rows of objects like I had when there was a schema
        var doc2data = new Map(); //this will contain rows of objects like I had when there was a schema
        for (var i = 0; i < data.length; i++) {
          doc2data.set(data[i].doc.id, data[i].doc);
        }
        overrideDatabase = doc2data;

        if (masterDatabase !== null) {
          idiagramSvg.database = database = mergeMasterAndOverride(masterDatabase, overrideDatabase);
          // free up this memory
          masterDatabase = null;
          overrideDatabase = null;
        }
        else {
          idiagramSvg.database = database = overrideDatabase;
        }
        // Load svg file
        createNewEmbed(lastEmbedSrc);
      }
      else {
        if (masterDatabase !== null) {
          idiagramSvg.database = database = masterDatabase;
          // Load svg file
          createNewEmbed(lastEmbedSrc);
        }
        else {
          idiagramSvg.database = database = new Map();
          console.error("Database Error: " + status);
          alert("Error fetching map data")
        }
      }
      // console.log(data);
      // alert("Status: " + status);
    });
  }
  else {
    if (masterDatabase !== null) {
      idiagramSvg.database = database = masterDatabase;
      // Load svg file
      createNewEmbed(lastEmbedSrc);
    }
    else {
      idiagramSvg.database = database = new Map();
      console.error("Database Error: ");
    }
  }
}
jQuery.fn.single_double_click = function(single_click_callback, double_click_callback, timeout) {
  return this.each(function() {
    var clicks = 0,
      self = this;
    jQuery(this).click(function(event) {
      clicks++;
      if (clicks == 1) {
        setTimeout(function() {
          if (clicks == 1) {
            single_click_callback.call(self, event);
          }
          else {
            double_click_callback.call(self, event);
          }
          clicks = 0;
        }, timeout || 350);
      }
    });
  });
};

/**
 * This will tell me if the first character of unoIdOrClass is a dot character, which
 * let's me know I am dealing with a class, not an id of a group element. Returns
 * true if this is a class
 **/
function isClass(unoIdOrClass) {
  return unoIdOrClass.charAt(0) === '.';
}

/**
 * Part of the hasClass() addClass() functions.
 */

var hasClass = function(el, className) {
  return $(el).hasClass(className);

};
var addClass = function(el, className) {
  $(el).addClass(className);
  return;
};

function removeClass(el, className) {
  $(el).removeClass(className);
}

/** ************************************************************* */
/**
 * Finds all members whose names start with str
 */
// TODO: This may need to be changed from starting with to equalling the str
// value
function getAllKeysAndValuesStartingWith(obj, str) {
  var key, results = [];
  for (key in obj) {
    if (obj.hasOwnProperty(key) && key.indexOf(str) === 0) {
      results[key] = obj[key];
    }
  }
  return results;
}
/**
 * This will return an array of objects containing key/value pairs containing a list of parameters in a URL
 * address. Right now I am requiring just the query string (ie., ?a=b&c=d)
 */
function getURLParameterList(parameterString) {
  var parameterTokens = parameterString.split("&");
  // onclick="sndReq('j=1,q=2,t=127.0.0.1,c=5');
  var parameterList = [];
  for (var j = 0; j < parameterTokens.length; j++) {
    var parameterName = parameterTokens[j].replace(/(.*)=.*/, "$1");
    // j
    var parameterValue = parameterTokens[j].replace(/.*=(.*)/, "$1");
    // 1
    // parameterList[parameterName] = parameterValue;
    var o = {};
    o[parameterName] = parameterValue;
    parameterList[j] = o;
  }
  return parameterList;
}
/**
 * Send in a an array of key names and the parameter array (which looks like: [{key:value},{key:value}]) and
 * this will return true or false to let you know if it is present in the list.
 * Like isDuplicatedCommandValue() but it doesn't care what value keys is set to
 */
function isKeyInParameterList(parameterList, keys) {
  // var key;
  if (parameterList !== undefined && parameterList.length) {
    var l = parameterList.length;
    for (var k = 0; k < l; k++) {
      // go through the array of key names in keys and see if there is a
      // match. If so return true!
      for (var i = 0; i < keys.length; i++) {
        if (keys[i] === Object.getOwnPropertyNames(parameterList[k])[0]) {
          return true;
        }
      }
    }
  }
  return false;
}

function finishCreatingInfoPanePlaceholder(unoGIdObject, longDescription) {
  var label = getDatabase(unoGIdObject.uno, "label");
  var webLinks = getDatabase(unoGIdObject.uno, "webLinks");
  var references = getDatabase(unoGIdObject.uno, "references");
  //unoGIdObject.infoPane = '### ' + label + '\n\n' + longDescription;
  unoGIdObject.infoPane = longDescription;
  if (webLinks.length) {
    unoGIdObject.infoPane += '\n\n### Further Information\n\n' + webLinks;
  }
  if (references.length) {
    unoGIdObject.infoPane += '\n\n### Bibliography\n\n' + references;
  }
  // convert markdown to html
  unoGIdObject.infoPane = converter.makeHtml(unoGIdObject.infoPane);
  unoGIdObject.infoPane = "<infopane-title>" + label + "</infopane-title>\n\n" + unoGIdObject.infoPane;
  // you don't need this longDescription any more that is sitting in
  // the db array, so delete it.
  //deleteItemFromDatabase(unoGIdObject.uno, "longDescription");
  // next wrap this in it's own div Also have a div id equal to the id
  // of unoGIdObject.uno with maybe an appended "-div."
  var divToWrap = document.createElement("div");
  $(divToWrap).attr({
    "class": "info-p-content",
    id: unoGIdObject.uno + "___info"
  });
  $(divToWrap).append(unoGIdObject.infoPane);
  unoGIdObject.infoPane = divToWrap;
  // next insert this into the info-pane. It should start out
  // invisible
  $(".information-pane").append(unoGIdObject.infoPane);
  createHoverEventForTaggedWords();


}

/**
 * Populate infopane if we are supposed to
 */
function populateInfoPane(unoGIdObject) {

  if (unoGIdObject.populateInfoPaneWasCalledOnce === false) {
    unoGIdObject.populateInfoPaneWasCalledOnce = true;
    //console.log("In populateInfoPane()");
    unoGIdObject.shouldPopulateInfoPane = getDatabase(unoGIdObject.uno, "infoPane");

    // set unoGIdObject.shouldPopulateInfoPane to "1" if it is undefined or null (means use default) or "click" or "hover"
    if (unoGIdObject.shouldPopulateInfoPane == undefined || unoGIdObject.shouldPopulateInfoPane === null || /click|hover|1/.test(unoGIdObject.shouldPopulateInfoPane)) {
      unoGIdObject.shouldPopulateInfoPane = "1";
    }
    if (unoGIdObject.shouldPopulateInfoPane === "1") {
      var longDescription = getDatabase(unoGIdObject.uno, "longDescription");
      //Now test to see if the description should be loaded in from a file. We know that because we have "+++&info=" prepended to the longdescription text instead of text.
      if (/\+\+\+&info/.test(longDescription)) {
        var re = /\+\+\+&info=(.+)/i; //regular expression: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp
        var found = longDescription.match(re); //grab the file name. found[1] contains the file name

        var unoLabel = {
          label: getDatabase(unoGIdObject.uno, "label")
        };

        //------------------------------------------------------------------
        //formApi is an endpoint in Node.js that handles this call and returns this html form data so that we can insert it into the info pane
        //We are sending in three parameters. Two are the form name and the collection that the form is found in. The unoLabel
        //is another way to store parameters, and contains the label which inserted into the form.
        $.get("/formApi/" + found[1] + "/" + getGlobal("formDB"), unoLabel, function(data, status) {
          // TODO: Create better error-handling
          if (status === "success") {



            //--------------------------------------------------------
            //  $.get(found[1], function(data, status) {
            unoGIdObject.populateInfoPaneWasCalledOnce = false;
            populateInfoPaneWithUrlContent(data, true);
          }
          // return;

          // finishCreatingInfoPanePlaceholder(unoGIdObject, data);
          // if (unoGIdObject.shouldPopulateInfoPane === "1") {
          //   // do not reload this if it is already there because it messes up
          //   // hover-on-tagged-word events
          //   if (unoGIdObject.uno !== CurrentIdOfInfoPane) {
          //     $(".info-p-content").removeClass("show");
          //     // show our element. The CSS will make it show.
          //     $(unoGIdObject.infoPane).addClass("show");
          //     // next: turn the div associated with CurrentIdOfInfoPane off
          //     // next: turn this div on
          //     // step 2:
          //     // this will clean up event handlers
          //     // $(".information-pane a").remove();
          //     // $(".information-pane").html(unoGIdObject.infoPane);
          //   }

          //   $('.ui-layout-pane-east').scrollTop(0); //scroll to top of new content in info pane
          // }
          // CurrentIdOfInfoPane = unoGIdObject.uno;

        });
        return;
      }
      else {
        finishCreatingInfoPanePlaceholder(unoGIdObject, longDescription);
      }

    }

  }
  if (unoGIdObject.shouldPopulateInfoPane === "1") {
    // do not reload this if it is already there because it messes up
    // hover-on-tagged-word events
    if (unoGIdObject.uno !== CurrentIdOfInfoPane) {
      $(".info-p-content").removeClass("show");
      // show our element. The CSS will make it show.
      $("#mapDbEditor").hide();
      $(unoGIdObject.infoPane).addClass("show");
      // next: turn the div associated with CurrentIdOfInfoPane off
      // next: turn this div on
      // step 2:
      // this will clean up event handlers
      // $(".information-pane a").remove();
      // $(".information-pane").html(unoGIdObject.infoPane);
    }

    $('.ui-layout-pane-east').scrollTop(0); //scroll to top of new content in info pane
  }
  CurrentIdOfInfoPane = unoGIdObject.uno;
}
/**
 * This will return an id with all of the characters after a "_" (including the "_") stripped off the end
 */
function stripId(thisId) {
  var pos = thisId.indexOf("_");
  var truncatedId = thisId;
  if (pos > -1) {
    truncatedId = thisId.slice(0, pos);
  }
  // now remove stuff after vvv or ooo
  truncatedId = truncatedId.replace(/^ooo.+/, 'ooo');
  truncatedId = truncatedId.replace(/^vvv.+/, 'vvv');
  truncatedId = truncatedId.replace(/^xxx.+/, 'xxx');
  truncatedId = truncatedId.replace(/^ccc.+/, 'ccc');

  return truncatedId;
}
/**
 * This will return an id with all of the characters after a "-" (including the "-") stripped off the end We
 * hopefully only need this for getDatabase()
 */
/*function stripDash(thisId) {
  var pos = thisId.indexOf("-");
  var truncatedId = thisId;
  if (pos > -1) {
    truncatedId = thisId.slice(0, pos);
  }
  return truncatedId;
}*/

/**
 * Enter an id and field that you want back. This will remove junk from front and end of thisId and look it up
 * in database and return the value. Removes ddd and vvv from front and junk on end that is put there by AI
 */
function getDatabase(thisId, field) {
  // truncate "_" and subsequent characters
  var truncatedId = stripId(thisId);

  // Now loose the ddd or vvv. Do we really need this?

  var row;
  //TODO: sometime handle the merged db of master and override.
  // masterForage.getItem("db_" + designerPrefs.masterDB + "_" + truncatedId, function(err, value, field, callBack, truncatedId) {
  //   if (err) {
  //     console.log('Error getting ' + truncatedId + ' from database.');
  //   }
  //   else {
  //     console.log('we just read ' + value);
  //     row = value;
  //     if (row.id !== undefined && row.id === truncatedId && row[field] !== undefined) {
  //       callBack(err, row[field]);
  //       //return row[field];
  //     }
  //   }
  // }.bind(this, field, callBack, truncatedId));
  row = database.get(truncatedId);
  if (row !== undefined && row.id !== undefined && row[field] !== undefined) {
    return row[field];
  }
  // for (var i = 0; i < database.length; i++) {
  //   row = database[i];
  //   if (row.id !== undefined && row.id === truncatedId && row[field] !== undefined) {
  //     return row[field];
  //   }
  // }
  //console.log("*** Database id not found!! " + truncatedId);
  return "";
}

/**
 * after the rotate command (and other tween commands), this will remove the class that makes stuff so it is there, 
 * though not seen. It reverses the display:inline command
 **/
function removeZeroOpacity() {
  $("g[id^='viewport']").removeClass("zero-opacity");
}

/**
 * change stuff from display: none; to opacity:0.0 by setting one class & making css rules do the rest
 * This is so that a tween can work when tweening elements that normall have the css style, display: none;
 **/
function addZeroOpacity() {
  $("g[id^='viewport']").addClass("zero-opacity");
}

/**
 * For tweening, this populates selector and resultArray.
 * selector contains the css selector of id's and classes that need to be tweened.
 * resultArray contains the other parameters that are used in various tween commands, such as scale values, etc.
 **/
function getSelectorAndResultArray(customFuncParameters) {
  //first, if browser is firefox or some others, need to change encoded values to normal single quote:
  //here are values to change:  %E2%80%99  or  %60  or %27
  //also %3E is the > character
  //also %20 is a space
  var shiftParams = customFuncParameters;
  shiftParams = shiftParams.replace(/(?:%E2%80%99)|(?:%60)|(?:%27)/g, "'"); //fix single quotes
  shiftParams = shiftParams.replace(/%3E/gi, ">"); //fix single quotes
  shiftParams = shiftParams.replace(/%20/g, " "); //fix single quotes
  shiftParams = shiftParams.replace(/^\s*/, ""); //loose any leading spaces

  //grabs the selector part of this. This is getting a quote, then putting the stuff in between quotes into a 
  //result, then matching last quote (whatever quote character we use) then returning the captured group
  var selector = shiftParams.match(/^['’`]([^’'`]+)[’'`]/); //selector may look like: ".step3>.ooo, step3>.vvv>.ccc, .step3>.arclabel"
  var relative;
  if (selector !== undefined && selector !== null) {
    var paramsAfterSelector = shiftParams.slice(selector[0].length);
    if (!paramsAfterSelector.length) {
      //did not get a normal tween parameter, so return parameter that user sent in via fullParameterString
      return {
        selector: customFuncParameters,
        resultArray: null,
        relative: null,
        fullParameterString: customFuncParameters //return parameter that user sent in via fullParameterString
      };
    }
    var resultArray = paramsAfterSelector.split(","); //looks like: ["", "1", "f", "1.3", "1.3"]
    if (resultArray !== undefined && resultArray.length > 2) {
      relative = resultArray[2].toLowerCase() === 't' ? "+=" : "";
      //this puts a pound in front of the first character if it is missing a "." or "#". Only handles the first char in the line
      /*selector = selector.replace(/^[ ]*([^\.#])/g, function(a, b) {
        return '#' + a.charAt(0); //a.charAt(0) is to restore that first character that would have been replaced.
      });*/
      selector[1] = selector[1].replace(/@/g, "#");
      //This handles all other items after a comma.  If there is no period at start, it is an id, so add # to start of id
      /*re = /([,>\s]+)([^.])([\w]+)/g;
       subRe = /([,>\s]+)([^.])([\w]+)/;
      var s = selector[1];
      s = s.replace(re, function(a, b, c) {
        var match = subRe.exec(a);
        if (match != null) {
          //Index 1 in the array is the captured group if it exists
          //Index 0 is the matched text, which we use if no captured group exists
         var r = match[1] +"#"+  match[2] +  match[3] ;
          return r;
        }
        return a;
      });*/
      /* re = /([,>\s]+)([^.])([\w]+)/g;
       do {
         var match = re.exec(selector[1]);
         if (match != null) {
           //Index 1 in the array is the captured group if it exists
           //Index 0 is the matched text, which we use if no captured group exists
           var r = match[1] ? match[1] : match[0];
         }
       } while (match != null);*/
      /* var result = re.exec(selector[1]);
       selector[1] = selector[1].replace(re, function(a, b) {
         return '#' + a.charAt(0); //a.charAt(1) is the first character after the comma that was being left out.
       });*/

    }
    else {
      //did not get a normal tween parameter, so return parameter that user sent in via fullParameterString

      return {
        selector: shiftParams,
        resultArray: null,
        relative: null,
        fullParameterString: shiftParams //return parameter that user sent in via fullParameterString
      };
    }
    return {
      selector: selector[1],
      resultArray: resultArray,
      relative: relative,
      fullParameterString: shiftParams
    };
  }
  else {
    //did not get a normal tween parameter, so return parameter that user sent in via fullParameterString

    return {
      selector: shiftParams,
      resultArray: null,
      relative: null,
      fullParameterString: shiftParams
    };
  }
}

/**
 * This is called from case "on": and others where I end up with duplicate on=.class command/values in url
 * This only removes duplicate command/value pairs, and leave only one command/value pairs. It doesn't delete all commands, just
 * duplicate command/value pairs.
 **/
function removeDupCommandValFromUrl(keyName, objectId) {
  var parameterList = getURLParameterList($.address.queryString());
  //  var a = $.address.value();
  if (parameterList && parameterList.length) {
    if (isDuplicatedCommandValue(parameterList, keyName, objectId) > 1) {
      removeCommandFromURL(keyName, objectId, true); //take'em all out
      // $.address.parameter(keyName, objectId); //doesn't work. Takes them all out (including other values) and puts only 1 back in.
      addCommandToURL(keyName, objectId);
    }
  }
}

/**
 * Called from processCommandsInURL() to process pan and zoom commands
 **/
function runPanZoomCommands(zoom, panx, pany, doPanning, doZoom, gotoId, panzoomDuration) {
  //console.log("In setTimeout for processCommandInURL()");

  //else idiagramSvg.tweenDuration = tweenDuration;  edit -- let us do this from the onPan and onZoom callback function
  // The zoom value needs to be relative to the current window size. Marshall Clemens, 03/08/16
  //doZoom is false if we have a gotoz command
  if (zoom !== undefined && doZoom === true) {
    var relativeZ = zoom * zoomRatio;
    if (panzoomDuration !== undefined) {
      idiagramSvg.tweenDuration = panzoomDuration;
    }
    zoomTiger.zoom(relativeZ);
  }
  if (panx !== undefined && pany !== undefined && doPanning == true) {
    // Now get the new sizes AFTER we've done the new zoom above.
    var s = zoomTiger.getSizes();
    zoomTiger.getPan();

    /*  Marshall Clemens, 03/07/16
    Pan values correspond to absolute coordinates in points (the native Illustrator / SVG units)
    e.g. a pan value of 100, 200 will pan the center of the map-pane to 100pt, 200pt on the SVG.
    The calculation below converts from points (panx, pany) to pixels (x, y), and the pan
    point is offset to the center of the map-pane e.g. (s.width / 2).
    This calculation is inverted when getting the pan values and setting them in the URL.
         */

    var x = (s.width / 2) - (panx * s.realZoom);
    var y = (s.height / 2) - (pany * s.realZoom);
    if (panzoomDuration !== undefined) {
      idiagramSvg.tweenDuration = panzoomDuration;
    }
    zoomTiger.pan({
      x: x,
      y: y
    });
  }
  else if (doPanning === false) { //In other words, if we have a goto or gotoz command

    //we don't want this showing up in the url; only the panx and pany and zoom stuff
    $.address.autoUpdate(false);
    $.address.parameter("goto", "");
    // $.address.parameter("gotoz", "");
    //ta = $("#thingA  #ooo")[0].getBBox();
    var id$ = $("#" + gotoId)[0];
    if (id$ !== undefined) {
      var ta = id$.getBBox();
      // gotoz - handle zoom stuff if we had a gotoz command
      if (!doZoom) {
        //TODO: Make this a global to speed things up


        var zoomToElement;
        s = zoomTiger.getSizes();


        // Do the Zoom
        // Fit the element to the map-pane width or height depending on the map-pane aspect ratio
        if (((s.width / s.height) / (ta.width / ta.height)) >= 1.0) {
          // Calculate zoom-to-fill for height
          // We must adjust for which dimension the zoom ration was set for
          if (s.viewBox.height / s.viewBox.width > s.height / s.width) {
            zoomToElement = ((s.viewBox.height / ta.height) * zoomRatio);
          }
          else {
            zoomToElement = ((s.viewBox.height / ta.height) * zoomRatio) * ((s.viewBox.height / s.viewBox.width) / (s.height / s.width));
          }
        }
        else {
          // Calculate zoom-to-fill for width
          // We must adjust for which dimension the zoom ration was set for
          if (s.viewBox.height / s.viewBox.width > s.height / s.width) {
            zoomToElement = ((s.viewBox.width / ta.width) * zoomRatio) * ((s.viewBox.height / s.viewBox.width) / (s.height / s.width));
          }
          else {
            zoomToElement = ((s.viewBox.width / ta.width) * zoomRatio);
          }
        }
        //  do the zooming
        zoomTiger.zoom(zoomToElement);
        // then back off ~ 20% zoom to provide a bit extra space
        zoomTiger.zoomBy(getGlobal("gotozRatio")); //defaults to 0.833333
        // get the new zoom value and normalize to the zoomRatio, then set the URL parameter
        zoomToElement = zoomTiger.getZoom() / zoomRatio;
        $.address.parameter("zoom", zoomToElement.toFixed(1));
      }



      // Do the panning
      s = zoomTiger.getSizes();
      zoomTiger.getPan();

      x = (s.width / 2) - ((ta.x + (ta.width / 2)) * s.realZoom);
      y = (s.height / 2) - ((ta.y + (ta.height / 2)) * s.realZoom);

      var tweenCallback = function(s) {
        // $(SvgTweenEvent).off("svgTweenComplete", tweenCallback);
        console.log("In tweenCallback()");
        var pan = zoomTiger.getPan();

        // Use absolute pan values - Marshall Clemens 03/07/16
        // The calculation below converts from pixels in the map-pane to points in the SVG
        var relativeX = 0;
        var relativeY = 0;
        if (s.realZoom == 0) {
          relativeX = 0;
          relativeY = 0;
        }
        else {
          relativeX = ((s.width / 2) - pan.x) / s.realZoom;
          relativeY = ((s.height / 2) - pan.y) / s.realZoom;
        }
        $.address.parameter("panx", relativeX.toFixed(1));
        $.address.parameter("pany", relativeY.toFixed(1));

        //TODO: may need to call this after a few omments if pan values in url are wrong:  updatePanInURL(); //need to set pan in url. Call it here AFTER you pan.
        $.address.update();
        $.address.autoUpdate(true);
        $.address.history(true);
      }; //.bind(this, s);
      //the stuff in tweenCallback is actually called after the pan command (below) is finished.
      //$(SvgTweenEvent).on("svgTweenComplete", tweenCallback);
      if (panzoomDuration !== undefined) {
        idiagramSvg.tweenDuration = panzoomDuration;
      }
      zoomTiger.pan({
        x: x,
        y: y
      });
      tweenCallback(s);
    }
    else {
      alert("Bad id in gotoz command: " + gotoId);
    }

  }
  //idiagramSvg.tweenDuration = tweenDuration; //set back to global  (edit. This will happen from pan and zoom)
}

/**
 * Send in one command and this will pre-pend a +++ and run the command and also add 
 * it to the url if it isn't in there.
 **/
function processCommandsAndAddToURL(command, id) {
  var addressHistoryState = $.address.history();
  // $.address.history(true);
  var q = idiagramSvg.getURLParameterList("+++&" + command + "=" + id);
  $.address.history(true);
  idiagramSvg.processCommandsInURL(q);
  idiagramSvg.addCommandToURL(command, id); //openall=id
  $.address.update();
  // $.address.history(false);
  idiagramSvg.PreviousUrlAddress = $.address.value();
  $.address.history(addressHistoryState);
}

/**
 * Handles parameter commands from URL's from both browser address bar and also anchor tags in text Called by
 * processAddress() and the hover event in createHoverEventForTaggedWords() If scrollToId is not null then it
 * is the path, if any, right after the hash that tells us where to scroll to on the page.
 */
function processCommandsInURL(q, scrollToId) {
  // Step 1: See if there is a "+++" if there is not, reset svg to everything
  // off.
  //myClientSocket.emitCommandsForUrl(q); //TODO: handle scrollToId

  if (!isKeyInParameterList(q, ["+++"])) {
    //if we have '---' then handle smart commands. Only close or off uno's that are not in this list as on or open
    if (isKeyInParameterList(q, ["---"])) {
      for (var i = 0; i < q.length; i++) {
        var keyName = Object.getOwnPropertyNames(q[i])[0];
        q[i][keyName] = q[i][keyName] === undefined ? q[i][keyName] = "" : q[i][keyName];
        if (q[i][keyName] === keyName && keyName !== "+++" && keyName !== "---") {
          alert("Error. Command without a parameter: " + keyName);
        }
        else if (!q[i][keyName] && keyName !== "+++" && keyName !== "---") {
          alert("Error. Command without a parameter: " + keyName);
        }

        var unoId;
        var selector;

        switch (keyName) {
          case "on":
            try {
              unoId = q[i][keyName];
              selector = "#" + unoId;
              $(selector).addClass("hold");
              // Work down the chain of immediate UNOs
              selector += " > .uno";
              while ($(selector).length) {
                $(selector).addClass("hold");
                selector += " > .uno";
              }
              selector = "#xxx" + unoId + " > .uno";
              $(selector).addClass("hold");
            }
            catch (err) {
              alert("Error. Aborting: " + err);
              console.error("Error. Aborting: " + err);
              return;
            }
            break;
          case "open":
            try {
              unoId = q[i][keyName];
              selector = "#" + unoId;
              $(selector).addClass("hold");
              // Work down the chain of immediate UNOs
              selector += " > .uno";
              while ($(selector).length) {
                $(selector).addClass("hold");
                selector += " > .uno";
              }
              selector = "#vvv" + unoId + " > .uno";
              $(selector).addClass("hold");
            }
            catch (err) {
              alert("Error. Aborting: " + err);
              console.error("Error. Aborting:  " + err);
              return;
            }
            break;
          case "openall":
            try {
              unoId = q[i][keyName];
              $("#" + unoId).addClass("hold");
              $("#" + unoId).find(".ddd").each(function() {
                unoId = $(this).attr("id");
                $("#" + unoId).addClass("hold");
              });
            }
            catch (err) {
              alert("Error. Aborting: " + err);
              console.error("Error. Aborting: " + err);
              return;
            }
            break;
          default:
            break;
        } //switch
      } //for
      //now close and set all to off that does not contain a hold class
      callAllGroups("setNonHoldToClose"); //default state
      callAllGroups("setNonHoldToOff"); //default state
      $(".hold").removeClass("hold"); //Now everything without a hold class is set to off and close, remove everything containing a hold class
    } //if
    //TODO: Why do we have this? Need better documentation
    else if (!isKeyInParameterList(q, ["all"])) {
      //callAllGroups("removeAllOpen");
      //callAllGroups("setThisToOff");
      //callAllGroups("setAllToClose");\
      if (idiagramSvg.doTweeningInSvgPanZoom == true) /* do not call this stuff while first initializing */ {

        callAllGroups("setAllToClose"); //default state
        callAllGroups("setAllToOff"); //default state

      }


      //Set just the top groups to off
      $('.svg-pan-zoom_viewport>g[id]').each(function() {
        var id = $(this).attr("id");
        if (id in idGroupObject) {
          idGroupObject[id].setThisToOff();
        }

      });

    }
  }
  // [ "on", "panx", "pany", "zoom", "wpane", "epane" ]
  var objectId;
  var gotoId; //for goto
  var state = idiagramUi.myLayout.state;
  var isWestPaneOpen = !state.west.isClosed;
  var isEastPaneOpen = !state.east.isClosed;
  var panx, pany, zoom, panzoomDuration;
  var doPanning = true; //doPanning set to false if we are processing a goto or gotoz command
  var doZoom = true; //doZoom is later set to false if gotoz command is present, because we handle zoom there.
  var timeToWaitBeforeDoingGoto = 0;
  var wPaneCommandHappened;
  var ePaneCommandHappened = wPaneCommandHappened = false; //if we got a wpane or epane command, then pause code while we wait for panes to open and close
  // Step 2: step through all parameters and follow the commands in order.
  // q is an array of objects, like this: [{key:value},{key:value}]). We want
  // to look at the name of the key
  for (var i = 0; i < q.length; i++) {
    var keyName = Object.getOwnPropertyNames(q[i])[0];
    q[i][keyName] = q[i][keyName] === undefined ? q[i][keyName] = "" : q[i][keyName];
    if (q[i][keyName] === keyName && keyName !== "+++" && keyName !== "---") {
      alert("Error. Command without a parameter: " + keyName);
    }
    else if (!q[i][keyName] && keyName !== "+++" && keyName !== "---") {
      alert("Error. Command without a parameter: " + keyName);
    }

    switch (keyName) {
      case "+++":
      case "---":
        // we handled this above
        break;
      case "all":
        var command = q[i][keyName];
        switch (command) {
          case "on":
            callAllGroups("setAllToOn");
            break;
          case "open":
            callAllGroups("setAllToOpen"); //this also calls addPermanent()

            break;
          case "off":
            callAllGroups("setAllToOff");
            break;
          case "close":
            callAllGroups("setAllToClose");
            break;
          default:
            // default code block
            alert("Bad command: all=" + command);
            break;
        }
        break;
      case "on":
        objectId = q[i][keyName];
        removeCommandFromURL("off", objectId, true); //take out "off" commands for this id, since it usually makes no sense to have them in the url
        removeDupCommandValFromUrl(keyName, objectId); //remove duplicate of this key/value from url
        $.address.update(); //update the url
        if (objectId in idGroupObject) {
          idGroupObject[objectId].setAllToOn(); //actually this only turns this on but it also sets the permanent class
        }
        else
          //see if this is a class. If so loop through all id's that have this class
          if (isClass(objectId)) {
            //remove duplicated on commands. I think we only need to do this for class; id's are handled elsewhere.
            //--------------------------------
            //removeDupCommandValFromUrl(keyName, objectId);


            //------------------------


            $(svgness)
              .find(objectId).each(function(i) {
                var unoId = $(this).attr("id");
                removeCommandFromURL("off", unoId, true); //take out conflicting commands for this id, since it usually makes no sense to have them in the url
                if (unoId in idGroupObject) {
                  // idGroupObject[unoId].setThisToOn();
                  idGroupObject[unoId].defaultSetThisToOn();
                }
              });
          }
        else {
          alert("Bad id in on command: " + objectId);
        }
        break;
      case "off":
        objectId = q[i][keyName];
        removeCommandFromURL("on", objectId, true); //take out "on" commands for this id, since it usually makes no sense to have them in the url
        removeDupCommandValFromUrl(keyName, objectId); //remove duplicate of this key/value from url
        $.address.update(); //update the url
        if (objectId in idGroupObject) {
          idGroupObject[objectId].setThisToOff(true);
        } //see if this is a class. If so loop through all id's that have this class
        else if (isClass(objectId)) {
          //remove duplicated off commands. I think we only need to do this for class; id's are handled elsewhere.
          //removeDupCommandValFromUrl(keyName, objectId);


          $(svgness)
            .find(objectId).each(function(i) {
              var unoId = $(this).attr("id");
              removeCommandFromURL("on", unoId, true); //take out conflicting commands for this id, since it usually makes no sense to have them in the url
              if (unoId in idGroupObject) {
                idGroupObject[unoId].setThisToOff();
              }
            });
        }
        else {
          alert("Bad id in off command: " + objectId);
        }
        break;


      case "open":
        objectId = q[i][keyName];
        removeCommandFromURL("close", objectId, true); //take out "close" commands for this id, since it usually makes no sense to have them in the url
        removeDupCommandValFromUrl(keyName, objectId); //remove duplicate of this key/value from url
        $.address.update(); //update the url

        if (objectId in idGroupObject) {
          idGroupObject[objectId].setThisToOpen();
          idGroupObject[objectId].addPermanent();
        } //see if this is a class. If so loop through all id's that have this class
        else if (isClass(objectId)) {
          //remove duplicated off commands. I think we only need to do this for class; id's are handled elsewhere.
          // removeDupCommandValFromUrl(keyName, objectId);
          $(svgness)
            .find(objectId).each(function(i) {
              var unoId = $(this).attr("id");
              removeCommandFromURL("close", unoId, true); //take out conflicting commands for this id, since it usually makes no sense to have them in the url
              if (unoId in idGroupObject) {
                idGroupObject[unoId].setThisToOpen();
                idGroupObject[unoId].addPermanent();
              }
            });
        }
        else {
          alert("Bad id in open command: " + objectId);
        }

        break;
      case "openall":
        objectId = q[i][keyName];

        removeDupCommandValFromUrl(keyName, objectId); //remove duplicate of this key/value from url
        $.address.update(); //update the url
        if (objectId in idGroupObject) {
          idGroupObject[objectId].parentOpenAllChildren();
        }
        break;
      case "closeall":
        objectId = q[i][keyName];

        removeDupCommandValFromUrl(keyName, objectId); //remove duplicate of this key/value from url
        $.address.update(); //update the url
        if (objectId in idGroupObject) {
          //see if there is an open or openall for this id, and delete it.
          var parameterList = getURLParameterList($.address.queryString());
          //  var a = $.address.value();
          if (parameterList && parameterList.length) {
            if (isDuplicatedCommandValue(parameterList, "open", objectId)) {
              removeCommandFromURL("open", objectId, true); //take'em all out
            }
            if (isDuplicatedCommandValue(parameterList, "openall", objectId)) {
              removeCommandFromURL("openall", objectId, true); //take'em all out
            }
          }
          idGroupObject[objectId].parentCloseAllChildren();
        }
        // removeDupCommandValFromUrl(keyName, objectId);
        break;
      case "close":
        objectId = q[i][keyName];

        removeCommandFromURL("open", objectId, true); //take out "open" commands for this id, since it usually makes no sense to have them in the url
        removeDupCommandValFromUrl(keyName, objectId); //remove duplicate of this key/value from url
        $.address.update(); //update the url
        if (objectId in idGroupObject) {
          idGroupObject[objectId].setThisToClose(true);
        } //see if this is a class. If so loop through all id's that have this class
        else if (isClass(objectId)) {
          //remove duplicated off commands. I think we only need to do this for class; id's are handled elsewhere.
          removeDupCommandValFromUrl(keyName, objectId);
          var unoId;
          $(svgness)
            .find(objectId).each(function(i) {
              unoId = $(this).attr("id");
              removeCommandFromURL("open", unoId, true); //take out conflicting commands for this id, since it usually makes no sense to have them in the url
              if (unoId in idGroupObject) {
                idGroupObject[unoId].setThisToClose(true);
              }
            });
        }
        break;
      case "panx":
        panx = q[i][keyName];
        break;
      case "pany":
        pany = q[i][keyName];
        break;

      case "zoom":
        zoom = q[i][keyName];
        /* if (!zoom) {
           alert("Bad zoom value in url command.");
         }*/
        zoom = zoom ? zoom : "1.0";
        // moving zoom out so that it can zoom after the panes are opened or
        // closed.
        // zoomTiger.zoom(zoom);
        break;
      case "panzoom": //panzoom = duration, xpos, ypos, zoom

        //the parameters are in this array: duration=0,xpos = 1, ypos=2,zoom=3
        var shiftParams = q[i][keyName];
        var autoUpdate = $.address.autoUpdate();
        $.address.autoUpdate(false);
        $.address.parameter("panzoom", ""); //remove all these commands?  
        $.address.parameter("panzoom", shiftParams); //add just this back in
        var resultArray = shiftParams.split(",");
        if (resultArray !== undefined && resultArray.length > 0) {
          panzoomDuration = resultArray[0];
          panx = resultArray[1];
          pany = resultArray[2];
          zoom = resultArray[3];
        }
        $.address.autoUpdate(autoUpdate);
        break;
      case "epane":
        console.log("case: epane");
        var epane = q[i][keyName];
        if (epane && (epane.toLowerCase() === "close" || epane.toLowerCase() === "closed" || epane === "0")) {
          if (isEastPaneOpen) {
            timeToWaitBeforeDoingGoto = 1005;
            ePaneCommandHappened = true;
            idiagramUi.myLayout.close("east");
            //myWidgetResizer();
          }
        }
        else {
          // if epane says "open" it needs to be open now if it is not
          // already
          if (isNumeric(epane)) {
            //timeToWaitBeforeDoingGoto = 1005;
            var newSize = epane;
            newSize = newSize < state["east"].minSize ? state["east"].minSize : newSize; //can't be less than minSize
            newSize = newSize > state["east"].maxSize ? state["east"].maxSize : newSize;
            epane = newSize;
            ePaneCommandHappened = epane != state["east"].size ? true : false; //don't wait to process zoom/pan command if wpane size is different
            idiagramUi.myLayout.open("east");
            idiagramUi.myLayout.sizePane("east", +epane);
            //myWidgetResizer();
          }
          else {
            if (epane && isEastPaneOpen) {}
            else {
              timeToWaitBeforeDoingGoto = 1005;
              ePaneCommandHappened = true;
              idiagramUi.myLayout.open("east");
              //myWidgetResizer();
            }
          }
        }
        break;
      case "wpane":
        console.log("case: wpane");
        var wpane = q[i][keyName];
        if (wpane && (wpane.toLowerCase() === "close" || wpane.toLowerCase() === "closed" || wpane === "0")) {
          if (isWestPaneOpen) {
            timeToWaitBeforeDoingGoto = 1005;
            wPaneCommandHappened = true;
            idiagramUi.myLayout.close("west");
            //myWidgetResizer();
          }

        }
        else {
          // it needs to be open now if it is not already
          // see if this is an integer. If it is then open this to that
          // width
          // user can send in wpane=open or wpane=300
          if (isNumeric(wpane)) {
            //timeToWaitBeforeDoingGoto = 1005;
            var newSize = wpane;
            newSize = newSize < state["west"].minSize ? state["west"].minSize : newSize; //can't be less than minSize
            newSize = newSize > state["west"].maxSize ? state["west"].maxSize : newSize;
            wpane = newSize;
            wPaneCommandHappened = wpane != state["west"].size ? true : false; //don't wait to process zoom/pan command if wpane size is different

            idiagramUi.myLayout.open("west");
            idiagramUi.myLayout.sizePane("west", +wpane);
            //myWidgetResizer();
          }
          else {
            if (wpane && isWestPaneOpen) {}
            else {
              timeToWaitBeforeDoingGoto = 1005;
              wPaneCommandHappened = true;
              idiagramUi.myLayout.open("west");
              //myWidgetResizer();
            }
          }

        }
        break;
      case "animate":
        var animateParams = q[i][keyName];
        // make sure syntax is correct. Can have zero or more spaces before
        // and after the comma: foo,play
        var resultArray = animateParams.match(/(\w+)(?:\s)*(?:%20)*,(?:\s)*(?:%20)*(\w+)/);
        if (resultArray !== undefined && resultArray.length > 0) {
          present.segmentCommand(resultArray[1], resultArray[2]);
        }
        //take out annoying duplicate animation commands
        $.address.history(false);
        $.address.parameter("animate", "");
        $.address.history(true);
        break;

      case "play":
        //example: play=thisSegmentName - plays the segment from the start
        present.callAllAnimations("stop");
        var segmentName = q[i][keyName];
        present.segmentCommand(segmentName, "play");

        //take out annoying duplicate animation commands
        $.address.history(false);
        $.address.parameter("play", "");
        $.address.history(true);
        break;
        /* case "stop":
           //example: play=thisSegmentName  - plays the segment from the start
           var segmentName = q[i][keyName];
           segmentCommand( segmentName, "stop");

           //take out annoying duplicate animation commands
           $.address.history(false);
           $.address.parameter("stop", "");
           $.address.history(true);
           break;*/
      case "stop":
      case "stopall":
        // MyTriggerAllClass.stopAll();
        //stop an animation that is playing
        present.callAllAnimations("stop");
        break;
      case "fileInfo":
        var infofile = q[i][keyName];
        /**
         * delete all dup commands but this one.
         **/
        var autoUpdate = $.address.autoUpdate();
        $.address.autoUpdate(false);
        $.address.parameter("fileInfo", ""); //remove all these commands?  
        $.address.parameter("fileInfo", infofile); //add just this back in
        $.address.autoUpdate(autoUpdate);
        // var filePath = infofile; //designerPrefs.folder + "/" + infofile;

        //This will add dynamic content to the info pane. 


        if (infofile !== undefined && infofile !== null) {

          $.get(infofile, callbackLoadDynamicContent.bind(this, infofile, keyName));
          $.address.update(); //update the url

        }
        break;
      //case "info":
      case "formInfo": //the form ‘formName’ must be stored in the form database specified in the map’s config.json file: "formDB": "theFormDB",


        var infofile = q[i][keyName];
        /**
         * delete all dup commands but this one.
         **/
        var autoUpdate = $.address.autoUpdate();
        $.address.autoUpdate(false);
        $.address.parameter("info", ""); //remove all these commands?  
        $.address.parameter("info", infofile); //add just this back in
        $.address.autoUpdate(autoUpdate);
        // var filePath = infofile; //designerPrefs.folder + "/" + infofile;

        //This will add dynamic content to the info pane. 


        if (infofile !== undefined && infofile !== null) {
          var unoLabel = {
            label: "" //This label only applies when this is associated with a UNO as in populateInfoPane() when loaded in via longDescription
          };
          //------------------------------------------------------------------
          //formApi is an endpoint in Node.js that handles this call and returns this html form data so that we can insert it into the info pane
          //We are sending in three parameters. Two are the form name and the collection that the form is found in. The unoLabel
          //is another way to store parameters, and contains the label which inserted into the form.
          $.get("/formApi/" + infofile + "/" + getGlobal("formDB"), unoLabel, function(data, status) {
            // TODO: Create better error-handling
            if (status === "success") {
              //--------------------------------------------------------
              //  $.get(found[1], function(data, status) {
              // unoGIdObject.populateInfoPaneWasCalledOnce = false;
              populateInfoPaneWithUrlContent(data, true);
              $.address.update(); //update the url
            }

          });


        }
        break;

      case "unoInfo":
      case "info":
        objectId = q[i][keyName];
        var unoGIdObject = idGroupObject[objectId];
        if (unoGIdObject !== undefined) {
          populateInfoPane(unoGIdObject);
        } else {
          console.error("Unknown unoId: " + objectId);
        }
        
        break;
      case "story":
        var infofile = q[i][keyName];
        // var filePath = infofile; //designerPrefs.folder + "/" + infofile;

        //This will add dynamic content to the story pane, which is the left pane 

        if (infofile !== undefined && infofile !== null && LastStoryFile !== null && LastStoryFile === infofile) {
          break; //if we already have the same story content loaded in the story pane then don't load it again!!!
        }
        if (infofile !== undefined && infofile !== null) {

          $.get(infofile, callbackLoadDynamicContent.bind(this, infofile, keyName));
          //LastStoryFile = infofile;
        }

        // load this. If it is a text file, put it through the mardown
        // converter first.

        // we will keep this in memory if it is not already loaded. In case
        // we keep
        // loading in a bunch of image files. (??? really?)
        // step 1 load in file
        // is it a markdown? -- yes format it
        // insert it in default dev for this and display it.

        break;
        // case "mapform": //edit map database


        //   var mapEditing = q[i][keyName]; //if true then start the map db editor when clicking on a uno

        //   idiagramSvg.dbEditing = mapEditing === "true" ? true : false;
        //   //This will add dynamic content to the info pane or popup. 
        //   if (getGlobal("dbEditing") === true) {
        //     if ($("#mapDbEditor").length === 0) //don't reload template file if we already have it. Note: someday we may want to load different map db editors
        //     {
        //       //if ( infofile !== undefined && infofile !== null) {

        //       $.get("/mapDbEditor.hbs", callbackLoadMapEditor.bind(this));

        //       //}
        //     }
        //   }
        //   else {
        //     //mapform == false, so hide the form and show the pane stuff.
        //     $(".information-pane").show();
        //     $("#mapDbEditor").hide();
        //   }
        //   // $.address.history(addressHistoryState);
        //   //$.address.autoUpdate(autoUpdate); //restore state of autoUpdate.
        //   break;
        // case "edit": //edit map database. Looks like edit=unoid. Use this so you don't have to click on an uno to edit it.
        //   //TODO: Delete this after you get edit2 working
        //   var unoIdToEdit = q[i][keyName]; //if true then start the map db editor when clicking on a uno
        //   //var that = this;
        //   //This will add dynamic content to the info pane or popup. 
        //   if ($("#mapDbEditor").length === 0) //don't reload template file if we already have it. Note: someday we may want to load different map db editors
        //   {
        //     var mapForm = getGlobal("mapForm");
        //     if (mapForm == undefined || mapForm === null) {
        //       mapForm = "/mapDbEditor.hbs";
        //       console.error("designerPrefs is missing mapForm definition. Using default mapDbEditor");
        //     }
        //     $.get(mapForm, function(unoIdToEdit, fileContents, status) {
        //       callbackLoadMapEditor(fileContents, status);
        //       mapDbApi.junk_populateMapForm(unoIdToEdit);
        //     }.bind(this, unoIdToEdit));
        //   }
        //   else {
        //     mapDbApi.junk_populateMapForm(unoIdToEdit);
        //   }

        //   break;
      case "edit": //edit map database. Looks like edit=unoid. Use this so you don't have to click on an uno to edit it. 
        //This version of edit will get map from form database instead of a hard copy of a map .hbs file
        var unoIdToEdit = q[i][keyName]; //if true then start the map db editor when clicking on a uno
        //var that = this;
        //This will add dynamic content to the info pane or popup. 
        // if ($("#mapDbEditor").length === 0) //don't reload template file if we already have it. Note: someday we may want to load different map db editors
        // {
        var mapForm = getGlobal("mapForm");
        if (mapForm == undefined || mapForm === null) {
          mapForm = "mapDbEditor";
          console.error("designerPrefs is missing mapForm definition. Using default mapDbEditor");
        }
         var unoLabel = {
          label: getDatabase(unoIdToEdit, "label")
        };
        //-------------------------------------
        $.get("/mapDbEditor/" + mapForm + "/" + "mapForm", unoLabel, function(unoIdToEdit, data, status) {
          // TODO: Create better error-handling
          if (status === "success") {
            //--------------------------------------------------------
            $("#mapDbEditor").remove(); //remove this if it was created earlier
            callbackLoadMapEditor(data);
            mapDbApi.getRowAndUpdateMapDbForm(unoIdToEdit);
            // populateInfoPaneWithUrlContent(data, true);

          }
          else {
            console.error("data data Error: " + status);

          }

        }.bind(this, unoIdToEdit));
        //----------------------------


        // $.get(mapForm, function(unoIdToEdit, fileContents, status) {
        //     callbackLoadMapEditor2(fileContents, status);
        //     mapDbApi.populateMapForm2(unoIdToEdit);
        // }.bind(this, unoIdToEdit));
        //}
        // else {
        //   mapDbApi.populateMapForm2(unoIdToEdit);
        // }

        break;

      case "infotext":
        var infotext = q[i][keyName];
        if (infotext !== undefined && infotext !== null) {
          populateInfoPaneWithUrlContent(infotext, false);
        }
        break;
      case "maptext":
        alert("maptext code not yet completed.");
        break;
      case "storytext":
        alert("storytext will not be a valid command.");
        break;
      case "map":
        alert("map code not yet completed.");
        break;
      case "goto":
        gotoId = q[i][keyName];
        //var element = $(svgness).find("#" + objectId)[0];
        //var pan = gotoElement(element);
        doPanning = false;

        break;
      case "gotoz":
        gotoId = q[i][keyName];
        //var element = $(svgness).find("#" + objectId)[0];
        //var pan = gotoElement(element);
        doPanning = false;
        doZoom = false; //we will do zoom while we handle the gotoz stuff
        break;


      case "move":
        var shiftParams = q[i][keyName];
        // i.e:run=move, 'Steps, @AD'2,f,160,160
        // make sure syntax is correct. Can have zero or more spaces before
        // and after the comma: foo,play
        //var resultArray = shiftParams.match(/(\w+)(?:\s)*(?:%20)*,(?:\s)*(?:%20)*(\w+)/);
        var selectorAndResultArray = getSelectorAndResultArray(shiftParams);
        if (selectorAndResultArray !== null) {
          var selector = selectorAndResultArray.selector;
          var resultArray = selectorAndResultArray.resultArray;
          var relative = selectorAndResultArray.relative;
          addZeroOpacity(); //change stuff from display: none; to opacity:0.0 by setting one class & making css rules do the rest
          TweenLite.to(selector, resultArray[1], {
            x: relative + resultArray[3],
            y: relative + resultArray[4],
            onComplete: removeZeroOpacity
          }); //groupId,duration,x,y
        }
        break;
      case "scale":
        //So we could issue commands with a space between the classes, in order to tween multiple things at once.  Such as:
        // &scale=.step3 .step4,1,f,1.5,1.5
        //scale=unoid or .class,duration,relative(t or f),scaleX, scaleY
        var shiftParams = q[i][keyName];
        var selectorAndResultArray = getSelectorAndResultArray(shiftParams);
        if (selectorAndResultArray !== null) {
          var selector = selectorAndResultArray.selector;
          var resultArray = selectorAndResultArray.resultArray;
          var relative = selectorAndResultArray.relative;
          addZeroOpacity(); //change stuff from display: none; to opacity:0.0 by setting one class & making css rules do the rest
          TweenLite.to(selector, resultArray[1], {
            transformOrigin: "50% 50%",
            scaleX: relative + resultArray[3],
            scaleY: relative + resultArray[4],
            onComplete: removeZeroOpacity
          });
        }

        break;

      case "fade":
        //fade=unoid or .class,duration,relative,opacity i.e. fade='.myClass',1,f,0
        var shiftParams = q[i][keyName];
        var selectorAndResultArray = getSelectorAndResultArray(shiftParams);
        if (selectorAndResultArray !== null) {
          var selector = selectorAndResultArray.selector;
          var resultArray = selectorAndResultArray.resultArray;
          var relative = selectorAndResultArray.relative;
          addZeroOpacity(); //change stuff from display: none; to opacity:0.0 by setting one class & making css rules do the rest
          TweenLite.to(selector, resultArray[1], {
            opacity: relative + resultArray[3],
            onComplete: removeZeroOpacity
          });
        }
        break;

      case "rotate":
        //rotate=unoid  | class,duration,relative,angle 

        var shiftParams = q[i][keyName];

        var selectorAndResultArray = getSelectorAndResultArray(shiftParams);
        if (selectorAndResultArray !== null) {
          var selector = selectorAndResultArray.selector;
          var resultArray = selectorAndResultArray.resultArray;
          var relative = selectorAndResultArray.relative;
          addZeroOpacity(); //change stuff from display: none; to opacity:0.0 by setting one class & making css rules do the rest
          TweenLite.to(selector, resultArray[1], {
            transformOrigin: "50% 50%",
            rotation: relative + resultArray[3],
            onComplete: removeZeroOpacity
          });
        }
        else {
          alert("Bad selector: " + shiftParams);
        }

        break;
      case "run": //this will handle dynamic functions. It comes in looking like this: run=functionName, p1, p2, …
        var runParams = q[i][keyName];
        //see if this is a dynamic function found in user's .js file, such as customstuff.js loaded in
        //from html file
        // make sure syntax is correct. Can have zero or more spaces before
        // and after the comma: foo,play
        //var resultArray = shiftParams.match(/(\w+)(?:\s)*(?:%20)*,(?:\s)*(?:%20)*(\w+)/);
        // var resultArray = runParams.split(",");
        var resultArray = runParams.match(/^([^,]+),?(.+)/);
        if (resultArray !== undefined && resultArray.length > 0) {
          var customFunction = window[resultArray[1]]; //custom function, such as move or fade
          if (typeof customFunction === "function") {
            //resultArray.shift(); //remove the first element, which is the name of the function, so we can send in the parameters.
            var selectorAndResultArray = getSelectorAndResultArray(resultArray[2]);
            customFunction.call(this, selectorAndResultArray);
          }
          else
            alert("Bad run function: " + keyName);
        }
        break;

      case "masteron":
        idiagramSvg.messageServer = true; //turns this into the socket message server
        break;
      case "masteroff":
        idiagramSvg.messageServer = false; //turns off socket message server
        break;
      case "togglehlt":
        var selectorAndResultArray = getSelectorAndResultArray(q[i][keyName]);
        idiagramUtil.togglehlt(selectorAndResultArray);
        break;
      case "hlt":
        var selectorAndResultArray = getSelectorAndResultArray(q[i][keyName]);
        idiagramUtil.hlt(selectorAndResultArray);
        break;

      case "unhlt":
        var selectorAndResultArray = getSelectorAndResultArray(q[i][keyName]);
        idiagramUtil.unhlt(selectorAndResultArray);
        break;

      default:
        var customFunction = window[keyName]; //custom function, such as move or fade
        if (typeof customFunction === "function") {
          //resultArray.shift(); //remove the first element, which is the name of the function, so we can send in the parameters.
          var selectorAndResultArray = getSelectorAndResultArray(q[i][keyName]);
          customFunction.call(this, selectorAndResultArray);
        }
        else
          alert("Bad command in URL: " + keyName);
        break;
    }

  }

  //Now remove the tween commands from url. If there are, say multiple rotate commands, then we can't do this before
  //we are finished looping through all the commands, so we do it here.
  var addressAutoUpdateState = $.address.autoUpdate();
  var addressHistoryState = $.address.history();
  $.address.history(false);
  $.address.parameter("rotate", ""); //remove all these commands from url
  //$.address.parameter("mapform", ""); //remove all these commands from url
  $.address.parameter("edit", ""); //remove all these commands from url
  $.address.parameter("fade", ""); //remove all these commands from url
  $.address.parameter("scale", ""); //remove all these commands from url
  $.address.parameter("move", ""); //remove all these commands
  $.address.parameter("stop", ""); //remove all these commands from url
  $.address.parameter("stopall", ""); //remove all these commands

  $.address.parameter("masteron", ""); //remove all these commands
  //removeCommandFromAddressDotValueString( $.address.value(),"masteron"); //remove all these commands
  $.address.parameter("masteroff", ""); //remove all these commands
  $.address.parameter("closeall", ""); //remove all these commands
  //$.address.update();
  $.address.history(addressHistoryState);
  $.address.autoUpdate(addressAutoUpdateState);
  //WE ARE PUTTING THE PAN/ZOOM CODE IN A SETTIMEOUT FUNCTION BECAUSE THE PANE CHANGES NEED TIME TO COMPLETE!
  //setTimeout(function(zoom, panx, pany, doPanning, doZoom, gotoId, panzoomDuration) {
  if (ePaneCommandHappened == false && wPaneCommandHappened == false) {
    runPanZoomCommands(zoom, panx, pany, doPanning, doZoom, gotoId, panzoomDuration);
  }
  else {
    $(window).on("panesResized", function(zoom, panx, pany, doPanning, doZoom, gotoId, panzoomDuration) {
      $(window).off("panesResized");
      runPanZoomCommands(zoom, panx, pany, doPanning, doZoom, gotoId, panzoomDuration);
    }.bind(this, zoom, panx, pany, doPanning, doZoom, gotoId, panzoomDuration));
  }

  // }.bind(this, zoom, panx, pany, doPanning, doZoom, gotoId, panzoomDuration),100 /* 1800 timeToWaitBeforeDoingGoto */ );
  /** **************************************************** */
  /**
   * If there is a tag in url that points to an anchor, this will jump to it.
   */
  // This comes in looking like /foo/ The following removes the slashes
  // var scrollToId = $.address.path().replace(/\//g, '');
  if (scrollToId && scrollToId.length) {
    // I use .info-p-content.show because there are other div's in the east
    // pane that are invisible
    try {
      if ($("#" + scrollToId).length) {
        $('.ui-layout-west,.info-p-content.show').animate({
            scrollTop: $("#" + scrollToId).offset().top
          },
          'slow');
      }
    }
    catch (err) {

    }

  }

}

//This will be called after pan and zoom happens.  This is assigned via onPan and onZoom options
function resetDuration() {
  setTimeout(
    function() {
      idiagramSvg.tweenDuration = tweenDuration; //set back to global
    }, 500);
}

// iterates through all objects and calls the function in functionName
function callAllGroups(functionName, args) {
  var x;
  var fn;
  x = null;
  for (x in idGroupObject) {
    fn = idGroupObject[x][functionName];
    if (typeof fn === 'function') {
      idGroupObject[x][functionName](args);
    }
  }
}

function removeCommandFromParameterListArray(parameterList, key) {
  if (parameterList !== null) {
    var l = parameterList.length;
    var newList = [];
    for (var k = 0; k < l; k++) {
      // look at key and see if there is a match. If not push that to
      // new array because we only want those that do not match
      // for (var i = 0; i < keys.length; i++) {
      if (key !== Object.getOwnPropertyNames(parameterList[k])[0]) {
        newList.push(parameterList[k]);
        // console.log("*************** Is +++??? "+
        // Object.getOwnPropertyNames(parameterList[k])[0]);
      }
      // }
    }
    return newList;
  }
  else return [];
}
/**
 * Send in an array of parameters for a url with commands, and this will turn it into a url string for
 * inserting into url bar with $.address.value( )
 */
function parameterListArrayToUrlAddress(parameterList) {
  var urlAddressText = "";
  var command;
  var l = parameterList.length;
  if (l) {
    command = Object.getOwnPropertyNames(parameterList[0])[0];
    urlAddressText += command + "=" + parameterList[0][command];
  }
  for (var k = 1; k < l; k++) {
    command = Object.getOwnPropertyNames(parameterList[k])[0];
    urlAddressText += "&" + command + "=" + parameterList[k][command];
  }
  return urlAddressText;
}

/**
 * Remove command from a string that came from  $.address.value();
 * In the first case for this, I need to remove panx from the global, PreviousUrlAddress
 **/
function removeCommandFromAddressDotValueString(urlAddressValue, command) {
  //save off the current state of these, then set to false then put urlAddressValue in address then use library to remove command.
  //I remove all commands that equal the command parameter
  var addressAutoUpdateState = $.address.autoUpdate();
  var addressHistoryState = $.address.history();
  var currentAddressValue = $.address.value();
  var returnValue = null;
  $.address.autoUpdate(false);
  $.address.history(false);
  $.address.value(urlAddressValue);
  $.address.parameter(command, "");
  returnValue = $.address.value(); //this is the value with the command removed
  //now restore everything
  $.address.value(currentAddressValue);
  $.address.history(addressHistoryState);
  $.address.autoUpdate(addressAutoUpdateState);
  return returnValue;
}


/**
 * This will remove a command from the url. It seems the open commands are what usually need to be removed.
 * Given open=id this will remove open=id
 */
function removeCommandFromURL(command, id, dontUpdateAddress) {
  $.address.autoUpdate(false);
  $.address.history(false);
  // $.address.value("/?+++&close=" + this.uno);
  var val = $.address.value();
  // expands to something like: /open=FriendsProvidentMeeting(&|$)/
  var regexstring = command + "=" + id + "(&|$)";
  // need to set up a regex looking for either another "&" at end of id or an
  // end of line.
  var regexp = new RegExp(regexstring, 'g');
  if (regexp.test(val)) {
    // if (val.indexOf(command + "=" + id) > -1) { //******* You need to get
    // right value here. this is matching FriendsProvident and
    // FriendsProvidentMeeting
    //$.address.autoUpdate(false);
    // $.address.parameter("open", this.uno, true);
    //val = val.replace("&" + command + "=" + id, "");  //TODO: What about spaces?
    val = val.replace(regexp, ""); //TODO: What about spaces?
    // in case I didn't remove it with the last line
    val = val.replace(command + "=" + id, "");
    val = val.replace("&&", "&");
    val = val.replace("&=", "");

    val = val.replace(/&$/, "");
    if (val !== undefined) {
      val = verifyQuestionMarkInURL(val);
      // why am I doing this??
      // $.address.value($.address.value(val));
      $.address.value(val);
      // this.oldAddressValue = "";
      // TODO: Get the title of the last open item if any in URL
      // $.address.title(this.oldTitle);
      dontUpdateAddress !== undefined && dontUpdateAddress ? {} : updateAddress(); //default is to call updateAddress()
    }
  }
  /*
   * var result = $.address.value(); //.replace(/\/\?/g, ''); //take out
   * "+++&" or "+++=&" and then append to current address. result =
   * result.replace(/\+\+\+=*&/g, '');
   */

  PreviousUrlAddress = $.address.value();
}



/**
 * See reportMyState(). This gets states for all elements found in idGroupObject and record their state so
 * that they can be restored again via restoreStatesOfAllWrappedElements() after hovering off
 * 
 * @param savedStateOfWrappedElements
 */
function getStatesOfAllWrappedElements(savedStateOfWrappedElements) {
  var x;
  for (x in idGroupObject) {
    var state = idGroupObject[x].reportMyState();
    savedStateOfWrappedElements.push(state);
  }
}

function restoreStatesOfAllWrappedElements(savedStateOfWrappedElements) {
  var x, i = 0;
  if (savedStateOfWrappedElements) {
    for (x in idGroupObject) {
      //savedStateOfWrappedElements should have been populated in same order as the stuff in idGroupObject()
      idGroupObject[x] !== undefined && savedStateOfWrappedElements[i] !== undefined ? idGroupObject[x].restorMyState(savedStateOfWrappedElements[i]) : {};
      i++;
    }
  }
}

/**
 * This will take in a string from getDatabase(this.uno, "onURL") or offURL, etc and take out any junk like
 * amp; or ? and return the result
 * 
 * @param onURL
 */
function fixUpOnURLetc(onURL) {
  var val;

  val = onURL.length ? onURL.replace(/&amp;/g, '&') : null;

  // get rid of question mark in rrr val
  val = val !== null ? val.replace(/\/\?/g, '') : null;
  val = val !== null ? val.replace(/\?/g, '') : null;
  return val;
}

/**
 * Mouse Interactivity – (works very much like it does now - except in how triggerHandler-groups work) A
 * hovering on/off a UNO’s ooo-group is equivalent to an open/close command. A click open/close is a
 * ‘persistent’ open/close command: • hover-on ooo-group = temporary open: hide ooo, show vvv and all of vvv’s
 * other siblings, show toolip. The ooo-group, although hidden, retains mouse control i.e. we���re waiting for 2
 * possible mouse events: a hover-off the ooo, or a click on the ooo (the ccc-group will not get mouse control
 * unless a permanent click-open happens). • hover-off ooo-group = persistent close: hide vvv, show ooo,
 * tooltip off. Note that the UNO can contain other stuff: other objects, sss-groups – but its only the
 * ooo-group that responds to mouse events (only in a really simple object with loose artwork and no other
 * groups would it be right to to talk about hovering on the (whole) UNO.) • Hover-on ccc-group = temporary
 * close: hide vvv, show ooo, show toolip. The ccc-group, although hidden, retains mouse control i.e. we’re
 * waiting for 2 possible mouse events: a hover-off the ccc, or a click on the ccc (the ooo-group will not get
 * mouse control unless a permanent click-close happens). • Hover-off ccc-group = persistent-open: hide ooo,
 * show vvv, tooltip off. • click-on ooo-group = persistent open: hide ooo, show vvv, transfer mouse control
 * to the ccc-group, turn off tooltip (for bit - then show again (if still hovering on)), update URL. •
 * click-on ccc-group = persistent close: hide vvv, show ooo, transfer mouse control to the ooo-group,
 * turn-off tooltip (then wait a bit before allowing a hover-on) update URL. if in open state, ooo is not
 * visible and has no poiinter events if in closed state, ooo is visible and has pointer events When site
 * initially starts, if something is turned on, then it is not in open state, but really a closed state.
 */

/**
 * There are various global variables that we want to get the value of. This will see if
 * it is defined and return it or return null
 **/
function getGlobal(globalVar) {

  switch (globalVar) {
    //stuff in the json file with global values
    // case "hoverOpenClose":
    case "hoverAction":
    case "hoverOpenClose":
      //we are defaulting to this being both, which means when user hovers over an object on the map, it will toggle between open and close of that object.
      if (idiagramSvg.designerPrefs.hasOwnProperty(globalVar)) {
        //true and false are for the few days of legacy code.
        if (idiagramSvg.designerPrefs[globalVar] === true) {
          idiagramSvg.designerPrefs[globalVar] = "both";
        }
        else if (idiagramSvg.designerPrefs[globalVar] === false) {
          idiagramSvg.designerPrefs[globalVar] = "none";
        }
        return idiagramSvg.designerPrefs[globalVar];
      }

      else return "both"; //default
      // break;

    case "gutterWidth":
      if (idiagramSvg.designerPrefs.hasOwnProperty("gutterWidth")) /* legacy option name */ {
        return idiagramSvg.designerPrefs["gutterWidth"];
      }
      else return 100; //default
      //  break;
    case "gutterHeight":
      if (idiagramSvg.designerPrefs.hasOwnProperty("gutterHeight")) /* legacy option name */ {
        return idiagramSvg.designerPrefs["gutterHeight"];
      }
      else return 100; //default
      //  break;
    case "folder":
    case "svgFile":
    case "storyFile":
    case "infoFile":
    case "helpLink":
    case "segmentsFile":
    case "masterDB":
    case "overrideDB":
    case "minZoom":
    case "maxZoom":
    case "zoomSensitivity":
    case "tweenDuration":
    case "defaultURL":
    case "mapForm":
    case "formDB":
      if (idiagramSvg.designerPrefs.hasOwnProperty(globalVar)) {
        return idiagramSvg.designerPrefs[globalVar];
      }
      // break;
    case "clickAction":
      if (idiagramSvg.designerPrefs.hasOwnProperty(globalVar)) {
        return idiagramSvg.designerPrefs[globalVar];
      }
      else return "both"; //defaults to true
      // break;
    case "showDelay":
      if (idiagramSvg.designerPrefs.hasOwnProperty(globalVar)) {
        return idiagramSvg.designerPrefs[globalVar];
      }
      else return 0; //defaults to true
      // break;
    case "hideDelay":
      if (idiagramSvg.designerPrefs.hasOwnProperty(globalVar)) {
        return idiagramSvg.designerPrefs[globalVar];
      }
      else return 0; //defaults to true
      // break;
    case "gotozRatio":
      if (idiagramSvg.designerPrefs.hasOwnProperty(globalVar)) {
        return idiagramSvg.designerPrefs[globalVar];
      }
      else return 0.833333; //defaults to 0.833333
      // break;
      //stuff NOT in that json file
    case "normalizeMapPane":
    case "processCommandsInURL":
    case "getURLParameterList":
    case "zoomTiger":
    case "isClass":
    case "tweenDuration":
    case "updateAddress":
    case "addZeroOpacity":
    case "removeZeroOpacity":
    case "messageServer":
    case "isKeyInParameterList":
    case "processAddress":
    case "mapEditorTemplate":
    case "database":
    case "dbEditing":
      if (idiagramSvg.hasOwnProperty(globalVar)) {
        return idiagramSvg[globalVar];
      }
      // break;
    default:
      return null;
      // break;
  }
}
var idiagramSvg = {
  normalizeMapPane: normalizeMapPane,
  processCommandsInURL: processCommandsInURL,
  getURLParameterList: getURLParameterList,
  zoomTiger: zoomTiger,
  isClass: isClass,
  tweenDuration: tweenDuration, //used in svg-pan-zoom for the tween duration
  traceTime: traceTime, // used in controlmenu.js
  hltDuration: hltDuration,
  hltOpacity: hltOpacity,
  bw: bw,
  updateAddress: updateAddress,
  addZeroOpacity: addZeroOpacity,
  removeZeroOpacity: removeZeroOpacity,
  messageServer: false, //true if this instance is controlling other browsers
  isKeyInParameterList: isKeyInParameterList,
  processAddress: processAddress,
  mapEditorTemplate: null,
  database: database,
  designerPrefs: designerPrefs,
  dbEditing: false,
  getDatabase: getDatabase,
  svgness: svgness,
  idGroupObject: idGroupObject,
  fixUpOnURLetc: fixUpOnURLetc,
  converter: converter,
  gClicked: gClicked,
  elClicked: elClicked,
  removeCommandFromURL: removeCommandFromURL,
  addCommandToURL: addCommandToURL,
  getGlobal: getGlobal,
  Panning: Panning,
  populateInfoPane: populateInfoPane,
  PreviousUrlAddress: PreviousUrlAddress,
  verifyQuestionMarkInURL: verifyQuestionMarkInURL,
  getStatesOfAllWrappedElements: getStatesOfAllWrappedElements,
  restoreStatesOfAllWrappedElements: restoreStatesOfAllWrappedElements,
  getSelectorAndResultArray: getSelectorAndResultArray,
  reloadZoomTiger: reloadZoomTiger,
  zoomRatio: zoomRatio,
  removeDupCommandValFromUrl: removeDupCommandValFromUrl,
  options: {
    onResetClick: onResetClick
  },
  showHelp: showHelp,
  printSvg: printSvg,
  zoomAll: zoomAll,
  processCommandsAndAddToURL: processCommandsAndAddToURL,
  doTweeningInSvgPanZoom: doTweeningInSvgPanZoom,
  stripId: stripId,
  masterForage: masterForage,
  lastUpdatedDb: lastUpdatedDb
};
//idiagramSvg.idGroupObject = idGroupObject;
module.exports = idiagramSvg;
