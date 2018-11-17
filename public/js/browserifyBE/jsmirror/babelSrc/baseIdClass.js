/**
 * baseIdClass.js class for handling logic svg groups idiagram Created Nov. 9, 2016, Larry A. Maddocks
 */
/* global $, 
    TweenLite,   
    Window,  myLayoutObj, present, showdown,  MouseEvent, myClientSocket, Handlebars, mapDbApi,
    idiagramSvg */

// TODO: Everything should default to closed state.
// This is only used as a baseclass. Nothing should really get assigned to this.
// Just the derived classes (or I should say, "objects.")
var idGroupObject;
// keeps track of tooltips so only one shows at a time

// used in timer so we don't have such a sensitive hover on objects
var timer = null;

/**
 * Functions from MC:  openOnly(),closeOnly(), parentOpenAllChildren(),parentCloseAllChildren()
 * These functions are used to 'manually' open/close show/hide UNOs - used primarily by custom open/close tweening functions
 * The open/closeOnly functions do what the default open/close function does except they do NOT run the show/hide function.
 * (From Marshall Clemens)
 **/

function openOnly(unoId) {
  var wrappedGroup = getWrapper(unoId);
  wrappedGroup.setThisToOpenOnly();
};

function closeOnly(unoId) {
  var wrappedGroup = getWrapper(unoId);
  wrappedGroup.setThisToCloseOnly();
};

function parentOpenAllChildren(unoId) {
  var wrappedGroup = getWrapper(unoId);
  wrappedGroup.parentOpenAllChildren();
};

function parentCloseAllChildren(unoId) {
  var wrappedGroup = getWrapper(unoId);
  wrappedGroup.parentCloseAllChildren();
};



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

function callCustomFunction(openFunction) {
  var q = idiagramSvg.getURLParameterList(openFunction);
  if (q) {
    for (var i = 0; i < q.length; i++) {
      var keyName = Object.getOwnPropertyNames(q[i])[0];
      keyName = keyName.replace(/^\?/, ""); //replace leading "?" with nothing
      if (keyName == "+++") {
        continue; //this is really not a function.
      }
      q[i][keyName] = q[i][keyName] === undefined ? q[i][keyName] = "" : q[i][keyName];
      if (q[i][keyName] === keyName && keyName !== "+++") {
        alert("Error. Command without a parameter: " + keyName);
      }
      else if (!q[i][keyName] && keyName !== "+++") {
        alert("Error. Command without a parameter: " + keyName);
      }
      var customFunction = window[keyName]; //custom function, such as move or fade
      if (customFunction !== undefined && typeof customFunction === "function") {
        //resultArray.shift(); //remove the first element, which is the name of the function, so we can send in the parameters.
        var selectorAndResultArray = idiagramSvg.getSelectorAndResultArray(q[i][keyName]);
        customFunction.call(this, selectorAndResultArray);
      }
      else {
        alert("Bad command in URL: " + keyName);
      }
    }


  }

}

/**
 * Get the wrapper object for a group.
 * Wrote this because I am tired of trying to remember how to get this
 * just send in the id of the group
 **/
function getWrapper(objectId) {
  return idGroupObject[objectId];
}

function defaultHide(unoId) {
  var wrappedGroup = getWrapper(unoId);
  wrappedGroup.isOn() ? wrappedGroup.show() : wrappedGroup.hide();
  //find grabs all descendants that are of type ddd,vvv,ooo,xxx,wrapInDb,wrapNotDb
  wrappedGroup.findGIdObjectGMyType.each(function() {
    if ($(this).hasClass("on")) {}
    else {
      addClass(this, "hide");
      removeClass(this, "lm-show");
    }
  });
};

function defaultShow(unoId) {
  var wrappedGroup = getWrapper(unoId);
  wrappedGroup.isOn() ? wrappedGroup.show() : wrappedGroup.hide();
  //find grabs all descendants that are of type ddd,vvv,ooo,xxx,wrapInDb,wrapNotDb
  wrappedGroup.findGIdObjectGMyType.each(function() {
    if ($(this).hasClass("on")) {
      addClass(this, "lm-show");
      removeClass(this, "hide");
    }
  });
};

function defaultShowHide(unoId) {
  var wrappedGroup = getWrapper(unoId);
  wrappedGroup.isOn() ? wrappedGroup.show() : wrappedGroup.hide();
  //find grabs all descendants that are of type ddd,vvv,ooo,xxx,wrapInDb,wrapNotDb
  wrappedGroup.findGIdObjectGMyType.each(function() {
    if ($(this).hasClass("on")) {
      addClass(this, "lm-show");
      removeClass(this, "hide");
    }
    else {
      addClass(this, "hide");
      removeClass(this, "lm-show");
    }
  });

};

/**
 * Function that can be called from custom code to show all but vvv groups
 **/
function showXXX(unoId) {
  var wrappedGroup = getWrapper(unoId);
  wrappedGroup.isOn() ? wrappedGroup.show() : wrappedGroup.hide();
  //find all descendants that are of type ddd,xxx,ooo,wrapInDb,wrapNotDb
  $(wrappedGroup.gIdObject).find("g[mytype]:not(.vvv)").each(function() {
    if ($(this).hasClass("on")) {
      addClass(this, "lm-show");
      removeClass(this, "hide");
    }
  });
};

/**
 * Function that can be called from custom code to not show xxx stuff
 **/
function showVVV(unoId) {
  var wrappedGroup = getWrapper(unoId);
  wrappedGroup.isOn() ? wrappedGroup.show() : wrappedGroup.hide();
  //find all descendants that are of type ddd,vvv,ooo,wrapInDb,wrapNotDb
  $(wrappedGroup.gIdObject).find("g[mytype]:not(.xxx)").each(function() {
    if ($(this).hasClass("on")) {
      addClass(this, "lm-show");
      removeClass(this, "hide");
    }
  });

};

/**
 * Function that can be called from custom code tohide everything but  vvv stuff
 **/
function hideXXX(unoId) {
  var wrappedGroup = getWrapper(unoId);
  wrappedGroup.isOn() ? wrappedGroup.show() : wrappedGroup.hide();
  //find grabs all descendants that are not of type vvv
  $(wrappedGroup.gIdObject).find("g[mytype]:not(.vvv)").each(function() {
    if (!$(this).hasClass("on")) {
      addClass(this, "hide");
      removeClass(this, "lm-show");
    }
  });

};

/**
 * Function that can be called from custom code to hide everything but xxx stuff
 **/
function hideVVV(unoId) {
  var wrappedGroup = getWrapper(unoId);
  wrappedGroup.isOn() ? wrappedGroup.show() : wrappedGroup.hide();
  //find grabs all descendants that are not of type xxx
  $(wrappedGroup.gIdObject).find("g[mytype]:not(.xxx)").each(function() {
    if (!$(this).hasClass("on")) {
      addClass(this, "hide");
      removeClass(this, "lm-show");
    }
  });

};

/**
 * Hide a group, such as vvv or xxx
 **/
// function hideGroup(group) {
//   // addClass(group, "lmHide");
//   //addClass(group, "off");
//   addClass(group, "lmHide");
// }

/**
 * lm-show a group, such as vvv or xxx
 **/
// function showGroup(group) {
//   removeClass(group, "lmHide");
// }

/**
 * Called when parsing groups with id's .
 * gIdObject is sent in. It is the svg group object
 **/
BaseIdClass.staticMyViewport = null;

function BaseIdClass(gIdObject) {
  if (gIdObject !== undefined) {
    this.gIdObject = gIdObject; //  gIdObject is the svg group object that this class wraps around. This could be: <id="ID" class="ddd">
    this.thisId = $(this.gIdObject).attr("id");
    // uno is just the id associated with this UNO group
    this.uno = $(this.gIdObject).attr("uno-id");
    // unoGIdObject should be the parent object for ooo and vvv groups. In
    // other words the uno or ddd object.
    this.unoGIdObject = this.dddGIdObject = null; //dddGIdObject is a wrapper object; not a svg group. Dumb names
    this.vvvGIdObject = null;
    this.oooGIdObject = null;
    this.xxxGIdObject = null;
    // Actuall object of parent group, if there is one.
    // TODO: See if these variables can be junked. Do I really use them?
    this.parentSvgObject = null;
    // This is the id of the parent group, if there is one.
    this.parentId = null;
    this.parentGIdObject = null;
    this.shortDesc = null;
    // this className needs to be overridden in derived classes
    this.className = "BaseIdClass";
    // shortDescription is the value from the database. It is only set once
    // -- the first time it is needed.
    // It is processed with markdown and event handlers for anchored data
    // only once.
    this.shortDescription = null;
    // contains value of info pane if we have populated this.
    this.infoPane = null;
    // If database tells us if should populated infoPane
    this.shouldPopulateInfoPane = null;
    this.populateInfoPaneWasCalledOnce = false;
    // this.onhover comes from db
    this.onhover = null;
    // elem & myRect is the whitelayer that allows us to dim the background,
    // where we put vvv objects in front of.
    this.whiteLayer = null;
    // I don't know if I need to save myRect, but here it is
    this.myRect = null;
    this.doDimming = null;
    this.myViewport = null;
    // if doubleClick has a URL in it then we jump to it if we doubleclick
    // an object.
    this.doubleClick = null;
    // target is whether to open a window in new tab or in this window. If
    // it is not set or is "_blank" then opens in new tab
    this.target = null;
    // if onclick is 1 then this is persistant if we click once.
    //this.onclick = null;
    /**
     * If user clicks on an ooo, then ccc gets mouse focus, but Marshall wants to disable hovering until they
     * focus off ccc then back on. Defaults to true
     */
    // this.hover = true;
    // rrr values are URL string that run commands. Found under vvv and
    // uno's in text element, i.e., <text> #/?+++&on=Worker </text>
    //Note -- they are now found in the database. On is executed when ddd is turned on. Off when ddd turned off.
    //Open when ooo opened.
    this.onURL = null;
    this.offURL = null;
    this.onFunction = null;
    this.offFunction = null;
    this.openURL = null;
    this.closeURL = null;
    this.openFunction = null;
    this.closeFunction = null;
    this.hoverAction = null;
    this.hoverFunction = null;
    this.clickFunction = null;
    this.clickAction = null;
    // set "already" things to lm-show if things have already been set
    this.alreadySetToolTip = false;
    this.alreadySetClickAndDoubleClick = false;
    this.alreadySetHoverOnOff = false;
    this.mytype = $(this.gIdObject).attr("mytype");
    // outOfPlaceHolder = true means I took this group out of it's
    // placeholder group and put stuck it on top
    this.outOfPlaceHolder = false;
    // see createPlaceHolder() for what placeHolder is. It contains our
    // group object unless it is moved out and to front.
    this.placeHolder = null;
    // oldAddressValue gets set before running an rrr command, so we can
    // return to the previous state after hovering off or clicking ccc
    this.oldAddressValue = null;
    // oldTitle gets set before running an rrr command
    this.oldTitle = "";
    // css values css when showing, cssH when hiding


    this.link = null;

    // ************  State variables Go Here -- Stuff that needs to be restored after hover off ************

    // isThisGroupOn is true if it is set to on.
    //this.isThisGroupOn = false;
    //this.isThisGroupOpen = false; //set if the state of this group is open

    //this.isThisGroupTempClose = false;

    // this.parentHide is set for children of parents that are turned off.
    // Marshall wants them to retain their
    // state for when the parents are turned on again.
    // this.parentHide = false;

    this.myTooltip; //points to a copy of the qtip for this object
    this.tooltipApi; //points to the qtip api see 
    this.infoPane = null;
    this.findGIdObjectGMyType = null; //this gets initialized only once so we don't keep doing a costly find()


    // ************* End of State Vars *****************************
  }
}
/**
 * Had to do this because some of the values, suchas cccGIdObject, were referencing objects that were not
 * created yet. I need to finish creating all these in svgLoaded() before initializing these values. This
 * needed to be called before they were put in the placeholder groups
 */
BaseIdClass.prototype.initialize = function() {


  idGroupObject = idiagramSvg.idGroupObject; //global from idiagram-svg.js
  // unoGIdObject should be the parent object for ooo and vvv groups. For
  // ddd's (meaning uno's themselves) this will be a pointer to itself
  this.dddGIdObject = idGroupObject[this.uno] ? idGroupObject[this.uno] : null; //dddGIdObject is a wrapper object; not a svg group. Dumb names
  this.unoGIdObject = this.dddGIdObject;
  //this.cccGIdObject = null; //idGroupObject["ccc" + this.uno] ? idGroupObject["ccc" + this.uno] : null;
  this.vvvGIdObject = idGroupObject["vvv" + this.uno] ? idGroupObject["vvv" + this.uno] : null;
  this.oooGIdObject = idGroupObject["ooo" + this.uno] ? idGroupObject["ooo" + this.uno] : null;
  this.xxxGIdObject = idGroupObject["xxx" + this.uno] ? idGroupObject["xxx" + this.uno] : null;
  // Actuall object of parent group, if there is one.
  // TODO: See if these variables can be junked. Do I really use them?
  this.parentSvgObject = $(this.gIdObject).parent("g").length ? $(this.gIdObject).parent("g")[0] : null;
  // This is the id of the parent group, if there is one.
  this.parentId = this.parentSvgObject ? $(this.parentSvgObject).attr("id") : null;
  this.parentGIdObject = this.parentId && idGroupObject[this.parentId] ? idGroupObject[this.parentId] : null;
  if (BaseIdClass.staticMyViewport == null) {
    BaseIdClass.staticMyViewport = $(idiagramSvg.svgness).find('.svg-pan-zoom_viewport')[0]; //TODO: Make sure this doesn't become obsolete after resetting zoomTiger
  }

  this.myViewport = BaseIdClass.staticMyViewport;
  // Get rrr value.
  // TODO: If there is also rrr or css values right under the uno AND the vvv
  // then what will happen when grabbing children? TEST THIS
  var databaseResult = idiagramSvg.getDatabase(this.uno, "onURL");
  this.onURL = databaseResult.length ? idiagramSvg.fixUpOnURLetc(databaseResult) : null;
  databaseResult = idiagramSvg.getDatabase(this.uno, "offURL");
  this.offURL = databaseResult.length ? idiagramSvg.fixUpOnURLetc(databaseResult) : null;

  databaseResult = idiagramSvg.getDatabase(this.uno, "onFunction");
  this.onFunction = databaseResult.length ? idiagramSvg.fixUpOnURLetc(databaseResult) : null;
  databaseResult = idiagramSvg.getDatabase(this.uno, "offFunction");
  this.offFunction = databaseResult.length ? idiagramSvg.fixUpOnURLetc(databaseResult) : null;


  databaseResult = idiagramSvg.getDatabase(this.uno, "openURL");
  this.openURL = databaseResult.length ? idiagramSvg.fixUpOnURLetc(databaseResult) : null;
  databaseResult = idiagramSvg.getDatabase(this.uno, "closeURL");
  this.closeURL = databaseResult.length ? idiagramSvg.fixUpOnURLetc(databaseResult) : null;
  databaseResult = idiagramSvg.getDatabase(this.uno, "openFunction");
  this.openFunction = databaseResult.length ? idiagramSvg.fixUpOnURLetc(databaseResult) : null;
  databaseResult = idiagramSvg.getDatabase(this.uno, "closeFunction");
  this.closeFunction = databaseResult.length ? idiagramSvg.fixUpOnURLetc(databaseResult) : null;

  databaseResult = idiagramSvg.getDatabase(this.uno, "hoverAction");
  this.hoverAction = databaseResult.length ? databaseResult : null;


  databaseResult = idiagramSvg.getDatabase(this.uno, "hoverFunction");
  this.hoverFunction = databaseResult.length ? idiagramSvg.fixUpOnURLetc(databaseResult) : null;

  databaseResult = idiagramSvg.getDatabase(this.uno, "clickFunction");
  this.clickFunction = databaseResult.length ? idiagramSvg.fixUpOnURLetc(databaseResult) : null;

  databaseResult = idiagramSvg.getDatabase(this.uno, "clickAction");
  this.clickAction = databaseResult.length ? databaseResult : "openClose";

  databaseResult = idiagramSvg.getDatabase(this.uno, "onDoubleClick");
  this.onDoubleClick = databaseResult.length ? databaseResult : null;

  databaseResult = idiagramSvg.getDatabase(this.uno, "infoPane");
  this.infoPane = databaseResult.length ? databaseResult : null;
  if (this.infoPane == undefined || this.infoPane === null || /hover|1/.test(this.infoPane)) {
    this.infoPane = "hover";
  }

  $(this.gIdObject).click(this.mClick);
  this.findGIdObjectGMyType = $(this.gIdObject).find("g[mytype]"); //so I don't have to keep doing a costly find

};

BaseIdClass.prototype.show = function() {
  addClass(this.gIdObject, "lm-show");
  removeClass(this.gIdObject, "hide");
};

BaseIdClass.prototype.hide = function() {
  //if (this.gIdObject.hasClass("")) {
  addClass(this.gIdObject, "hide");
  removeClass(this.gIdObject, "lm-show");
  //}
};



/**
 * Called with command all=on. I will set this to be permanent since it seems to be coming from url
 **/
BaseIdClass.prototype.setAllToOn = function() {
  //this.removeParentHide(false);
  // if (this.isThisGroupOn === false) {
  //Only turn ddd groups on or off

  if (/ddd|wrapInDb|wrapNotDb/.test(this.mytype)) {
    if (this.isOff()) /* part of mc's smart command idead */ {
      this.setThisToOn();
      this.addPermanent();
    }
  }
};

BaseIdClass.prototype.isOn = function() {
  return $(this.gIdObject).hasClass("on");
};
BaseIdClass.prototype.isOff = function() {
  return $(this.gIdObject).hasClass("off");
};
// BaseIdClass.prototype.isLockOnOff = function() {
//   return $(this.gIdObject).hasClass("lockOnOff");
// };
BaseIdClass.prototype.isOpen = function() {
  return $(this.gIdObject).hasClass("open");
};
BaseIdClass.prototype.isClose = function() {
  return $(this.gIdObject).hasClass("close");
};
BaseIdClass.prototype.isHide = function() {
  return $(this.gIdObject).hasClass("hide");
};


BaseIdClass.prototype.setThisToOn = function() {
  addClass(this.gIdObject, "on");
  removeClass(this.gIdObject, "off");
  // $(this.gIdObject).find("g[mytype]").each(function() {
  //   addClass(this, "on");
  //   removeClass(this, "off");
  // });
  this.resetOnOff();

  if (this.onURL) {
    this.processURLCommandsForOnURLetc(this.onURL);
  }
  //if designer does not have a custom function here do default, which is show or hide, else run custom function 
  if (!this.onFunction) {
    this.defaultShowHide();
  }
  else {
    callCustomFunction(this.onFunction);
  }
};

BaseIdClass.prototype.defaultSetThisToOn = function() {
  addClass(this.gIdObject, "on");
  removeClass(this.gIdObject, "off");
  // $(this.gIdObject).find("g[mytype]").each(function() {
  //   addClass(this, "on");
  //   removeClass(this, "off");
  // });
  this.resetOnOff();

  if (this.onURL) {
    this.processURLCommandsForOnURLetc(this.onURL);
  }
  this.defaultShowHide();
};


BaseIdClass.prototype.resetOnOff = function() {

  // if (this.isClose()) {
  this.findGIdObjectGMyType.each(function() {
    // if (!$(this).hasClass("lockOnOff")) {
    addClass(this, "on");
    removeClass(this, "off");
    // }
  });
  this.findGIdObjectGMyType.each(function() {
    if ($(this).parent(".off").length) {
      //do not set on for immediate  parent that is in off state
      // if (!$(this).hasClass("lockOnOff")) {
      addClass(this, "off");
      removeClass(this, "on");
      // }
    }

  });

  $(this.gIdObject).find(".vvv.close g[mytype],.vvv.close").each(function() {
    // if (!$(this).hasClass("lockOnOff")) {
    addClass(this, "off");
    removeClass(this, "on");
    // }

  });
  //  }
  //  else {

  $(this.gIdObject).find(".xxx.open g[mytype], .xxx.open").each(function() {
    // if (!$(this).hasClass("lockOnOff")) {
    addClass(this, "off");
    removeClass(this, "on");
    // }
  });
  // }
};

/** 
 * propbably should be called after you have properly set the off/on classes
 **/
BaseIdClass.prototype.defaultShowHide = function() {
  this.isOn() ? this.show() : this.hide();
  //find grabs all descendants that are of type ddd,vvv,ooo,xxx,wrapInDb,wrapNotDb
  this.findGIdObjectGMyType.each(function() {
    if ($(this).hasClass("on")) {
      addClass(this, "lm-show");
      removeClass(this, "hide");
    }
    else {
      addClass(this, "hide");
      removeClass(this, "lm-show");
    }
  });

};

/**
 * From MC
 **/
BaseIdClass.prototype.setThisToOpenOnly = function() {
  if (this.dddGIdObject && /ddd/.test(this.dddGIdObject.mytype)) {
    this.dddGIdObject ? this.dddGIdObject.setThisToOpenOnly() : {};
  }
};

/**
 * From MC
 **/
BaseIdClass.prototype.setThisToCloseOnly = function() {
  if (this.dddGIdObject && /ddd/.test(this.dddGIdObject.mytype)) {
    this.dddGIdObject ? this.dddGIdObject.setThisToCloseOnly() : {};
  }
};


BaseIdClass.prototype.setThisToOpen = function() {
  if (this.dddGIdObject && /ddd/.test(this.dddGIdObject.mytype)) {
    this.dddGIdObject ? this.dddGIdObject.setThisToOpen() : {};
  }
};

BaseIdClass.prototype.setThisToClose = function() {
  //this.dddGIdObject ? this.dddGIdObject.setThisToClose() : {};
  if (this.dddGIdObject && /ddd/.test(this.dddGIdObject.mytype)) {
    this.dddGIdObject.setThisToClose()
  }
  // this.dddGIdObject.setThisToOn(); //turn on the ddd if it is not already. This will go in an fix all the lm-show hide stuff
};
BaseIdClass.prototype.setAllToClose = function() {
  if (/ddd/.test(this.mytype)) {
    this.setThisToClose()
    this.removePermanent();
  }
};

//For MC's idea of not closing uno's that are about to be opened.
BaseIdClass.prototype.setNonHoldToClose = function() {
  if (/ddd/.test(this.mytype)) {
    if (!hasClass(this.gIdObject, "hold")) {
      this.setThisToClose()
      this.removePermanent();
    }
  }
};
/**
 * Called with command all=off
 **/
BaseIdClass.prototype.setAllToOff = function() {
  this.setThisToOff();
  this.removePermanent();
};

//For MC's idea of not offing uno's that are about to be turned on.
BaseIdClass.prototype.setNonHoldToOff = function() {
  if (!hasClass(this.gIdObject, "hold")) {
    this.setThisToOff();
    this.removePermanent();
  }
};


BaseIdClass.prototype.defaultSetThisToOff = function() {
  if (/ddd|wrapInDb|wrapNotDb/.test(this.mytype)) {
    if (this.isOff() == false || this.isOn() == true) {
      // this.isThisGroupOn = false;
      // if (!$(this.gIdObject).hasClass("lockOnOff")) {
      removeClass(this.gIdObject, "on");
      removeClass(this.gIdObject, "lm-show");
      //   removeClass(this.gIdObject, "open");
      //   addClass(this.gIdObject, "close");
      addClass(this.gIdObject, "off");


      //first set everything to on, then set everything under .vvv to close
      this.findGIdObjectGMyType.each(function() {
        // if (!$(this).hasClass("lockOnOff")) {
        addClass(this, "off");
        removeClass(this, "on");
        // }
      });
      this.resetOnOff();
      if (this.offURL) {
        this.processURLCommandsForOnURLetc(this.offURL);
      }

      this.defaultShowHide();

    }
  }
};

/**
 * This is called by a URL to set this object to off.
 */
BaseIdClass.prototype.setThisToOff = function() {
  if (/ddd|wrapInDb|wrapNotDb/.test(this.mytype)) {
    if (this.isOff() == false || this.isOn() == true) {
      // this.isThisGroupOn = false;
      // if (!$(this.gIdObject).hasClass("lockOnOff")) {
      removeClass(this.gIdObject, "on");
      removeClass(this.gIdObject, "lm-show");
      //   removeClass(this.gIdObject, "open");
      //   addClass(this.gIdObject, "close");
      addClass(this.gIdObject, "off");


      //first set everything to on, then set everything under .vvv to close

      this.findGIdObjectGMyType.each(function() {
        // if (!$(this).hasClass("lockOnOff")) {
        addClass(this, "off");
        removeClass(this, "on");
        // }
      });

      this.findGIdObjectGMyType.each(function() {
        // if (!$(this).hasClass("lockOnOff")) {
        addClass(this, "off");
        removeClass(this, "on");
        // }
      });
      this.resetOnOff();
      if (this.offURL) {
        this.processURLCommandsForOnURLetc(this.offURL);
      }
      if (!this.offFunction) {
        this.defaultShowHide();
      }
      else {
        callCustomFunction(this.offFunction);
      }
      // hideGroup(this.gIdObject);
    }
  }
};


BaseIdClass.prototype.removePermanent = function() {
  this.dddGIdObject ? $(this.dddGIdObject.gIdObject).removeClass("permanent") : {};

};


BaseIdClass.prototype.addPermanent = function() {
  this.dddGIdObject ? $(this.dddGIdObject.gIdObject).addClass("permanent") : {};

};

/**
 * Called from a openall=id from the url
 **/
BaseIdClass.prototype.parentOpenAllChildren = function() {
  var unoId;
  var ddd = this.dddGIdObject;
  if (ddd) {
    // ddd.setThisToOn();
    if (/ddd/.test(ddd.mytype)) /* somethines ddd could be a WrapNotDbClass (!!) */ {
      ddd.addPermanent();
      ddd.setThisToOpen();
    }
    $(ddd.gIdObject).find(".ddd").each(function() {
      unoId = $(this).attr("id");
      if (unoId in idGroupObject) {
        idGroupObject[unoId].addPermanent();
        // idGroupObject[unoId].setThisToOn();
        idGroupObject[unoId].setThisToOpen();
      }
    });
  }
  else {
    //console.log("missing ddd: " + $(this).attr("id"))
  }
};

/**
 * Called from a closeall=id from the url
 **/
BaseIdClass.prototype.parentCloseAllChildren = function() {
  var unoId;
  //this.setThisToOn();
  var ddd = this.dddGIdObject;
  if (ddd) {
    if (/ddd/.test(ddd.mytype)) /* somethines ddd could be a WrapNotDbClass (!!) */ {
      // ddd.setThisToClose();
      ddd.removePermanent();


    }
    $(ddd.gIdObject).find(".ddd").each(function() {
      unoId = $(this).attr("id");
      if (unoId in idGroupObject) {

        let gWrap = idGroupObject[unoId];
        gWrap.removePermanent();
        addClass(gWrap.dddGIdObject.gIdObject, "close");
        removeClass(gWrap.dddGIdObject.gIdObject, "open");
        addClass(gWrap.vvvGIdObject.gIdObject, "close");
        removeClass(gWrap.vvvGIdObject.gIdObject, "open");
        addClass(gWrap.xxxGIdObject.gIdObject, "close");
        removeClass(gWrap.xxxGIdObject.gIdObject, "open");
        gWrap.processURLCommandsForOnURLetc(gWrap.closeURL);
      }
    });
    ddd.setThisToClose();
  }
};

/**
 * This is called by a URL to set this object to open.
 */
//BaseIdClass.prototype.setThisToClose = function() {
// callTrigger = callTrigger === undefined ? true : callTrigger;
// if (this.isThisGroupOpen === true) { This is not always open because
// sometimes it is only temporary opened.

// Now dispatch this that this group is set to on
//console.log("dispatching close event for: " + this.thisId);
//callTrigger ? $(this.gIdObject).triggerHandler("close") : {};
// }
//};


BaseIdClass.prototype.removeAllOpen = function() {
  // if (this.isThisGroupOpen === true) { This is not always open because
  // sometimes it is only temporary opened.
  // this.isThisGroupOpen = false;

  // removeClass(this.gIdObject, "close"); // just close everything. see if that fixes the initial state.
  removeClass(this.gIdObject, "open");
  this.removePermanent();
  this.resetOnOff();
  this.defaultShowHide();
  //this.cssOpenClose(this.closeCSS); //do we HAVE to call this for the simple closeall function?
};


BaseIdClass.prototype.setTooltip = function() {
  if (this.alreadySetToolTip === false) {
    this.alreadySetToolTip = true;
    var showTooltip = idiagramSvg.getDatabase(this.uno, "tooltip");
    if (showTooltip === "1") {
      // this will populate this.shortDesc if it hasn't already
      this.getShortDesctription();
      var ttPosition = idiagramSvg.getDatabase(this.uno, "ttPosition");
      var label = idiagramSvg.getDatabase(this.uno, "label");
      ttPosition = (ttPosition.length) ? ttPosition.toLowerCase() : "right";

      var ttStyle = idiagramSvg.getDatabase(this.uno, "ttStyle");
      var trimmed = $.trim(this.shortDesc);
      if (!trimmed.length || trimmed === "<p></p>") {
        addClass(this.gIdObject, "blankTitle");
      }

      ttPosition = ttPosition === 'bottom' ? 'right' : ttPosition.toLowerCase(); //temp fix till we get qtip parameters figured out

      ttPosition = ttPosition === 'top' ? 'right' : ttPosition.toLowerCase(); //temp fix till we get qtip parameters figured out
      var qtipOptions;
      if (ttStyle.length) {
        //TODO:  If we have problems it is good to make this a copy instead of overwriting qtipOptions
        qtipOptions = window[ttStyle]; //the value for  ttStyle is the name of a style object, maybe found in a custom js file like customstuff.js
        if (qtipOptions == undefined) {
          alert("Missing qtip options: " + ttStyle);
          return;
        }
        qtipOptions.id = this.thisId; //gets changed by the qtip library to #qtip-myTooltip.  So dumb
        qtipOptions.content.text = this.shortDesc;
        qtipOptions.content.title = label;
        //var viewport = $(".svg-pan-zoom_viewport")[0];
        var viewport = true; // means we stay in container was this:  $(".svg-pan-zoom_viewport")[0];
        qtipOptions.position.viewport = viewport;
        qtipOptions.position.target = this.gIdObject;
        //qtipOptions.position.at = qtipOptions.position.at + " " + ttPosition;


        this.myTooltip = $(this.gIdObject).qtip(qtipOptions); //set qtip handler to the this.myTooltip for this class instance
        this.tooltipApi = this.myTooltip.qtip('api'); //need this to handle qtip api calls, like lm-show and hide.
      }
      else {
        console.log("no tooltip stuff");
      }
    }
  }
};
// this will populate this.shortDesc if it hasn't already. Called from
// setTooltip()
BaseIdClass.prototype.getShortDesctription = function() {
  if (this.shortDesc === null) {
    this.shortDesc = idiagramSvg.getDatabase(this.uno, "shortDescription");
    // convert markdown to html
    this.shortDesc = idiagramSvg.converter.makeHtml(this.shortDesc);
  }
};
// handle single click in object
BaseIdClass.prototype.single = function(event) {
  // var target = event.target;
  // var result = $(target).parents("g[id^='sss']");
  // if (result.length === 0) {
  // need to figure the wrapper object from the id of this group object that
  // trigggered the click
  var wrapperObject = idGroupObject[$(this).attr("id")];
  //var didIClickOnThisAlready = hasClass(this, "clicked");
  addClass(this, "clicked");
  //if use does an alt-click, then set a trigger to that effect so that openall or closeall
  //can happen
  if (event.altKey === true) {
    //$(wrapperObject.gIdObject).triggerHandler("alt-clickedGroup");
    wrapperObject.altClickedGroup(); //should be calling an ooo group function
  }
  /* else if (event.ctrlKey == true) {
    
   }*/
  else if (idiagramSvg.gClicked === "g") {
    //pressed  g-click
    var urlCommand = "+++&open=" + wrapperObject.uno + "&gotoz=" + wrapperObject.uno;
    $.address.history(true);
    wrapperObject.processURLCommandsForOnURLetc(urlCommand);
  }
  else if (idiagramSvg.gClicked === "c") {
    //pressed  c-click This is for when the normal click is changed to the gotoz command, but we want to still be able to do a normal click
    // $(wrapperObject.gIdObject).triggerHandler("clickedGroup");
    wrapperObject.clickedGroup();
  }
  /**
   * An ‘o’-click will toggle the UNOs lock-on state; togglelock=thisUNO.
   * The ‘k’ key will run unlock=all.
   * An ‘a’-click will run play=thisUNO, if there is no animation with the name ‘thisUNO’ then run play=noAnimation (noAnimation will play a short error sound).
   **/
  else if (idiagramSvg.gClicked === "a") {
    present.callAllAnimations("stop");
    let segmentName = wrapperObject.uno;
    present.segmentCommand(segmentName, "play");

  }

  else if (idiagramSvg.elClicked === "l") {
    //pressed l-click (el)  +++&togglehlt=A   (not: '@A',2,f,0.8 )
    var urlCommand = "+++&togglehlt=" + wrapperObject.uno;
    $.address.history(true);
    idiagramSvg.addCommandToURL("togglehlt", wrapperObject.uno);
    $.address.history(false);
    wrapperObject.processURLCommandsForOnURLetc(urlCommand); //this only runs the command. Does not update the url address
  }


  else if (wrapperObject.clickAction === "gotoz") {
    //pressed click on a uno while json clickAction value is set to gotoz.
    $.address.parameter("gotoz", "");
    $.address.value($.address.value() +  "&gotoz=" + wrapperObject.uno);
    var urlCommand = "+++&gotoz=" + wrapperObject.uno; //we need to do the open so we populate the correct info in the info pane.
    $.address.history(true);
    wrapperObject.processURLCommandsForOnURLetc(urlCommand);

    if (idiagramSvg.getGlobal("dbEditing") === true) {
      mapDbApi.populateMapForm(wrapperObject.uno);
    }
  }

  else if (/function/.test(wrapperObject.clickAction) && wrapperObject.clickFunction) {

    //pressed click on a uno while json clickAction value is set to gotoz
    //callCustomFunction(this.clickFunction);
    wrapperObject.processURLCommandsForOnURLetc(wrapperObject.clickFunction); //url command
  }
  else {
    //populate the map form because dbEditing === true means we have a database editor available
    if (idiagramSvg.getGlobal("dbEditing") === true) {
      mapDbApi.populateMapForm(wrapperObject.uno);
    }
    else {
      //$(wrapperObject.gIdObject).triggerHandler("clickedGroup");
      wrapperObject.clickedGroup();
    }
  }
  // }
};
/**
 * Handle m-click to pull up map db editor form when clicking on a uno
 **/
BaseIdClass.prototype.mClick = function(event) {
  // var target = event.target;
  // var result = $(target).parents("g[id^='sss']");
  // if (result.length === 0) {
  // need to figure the wrapper object from the id of this group object that
  // trigggered the click
  var wrapperObject = idGroupObject[$(this).attr("id")];

  addClass(this, "clicked");

  if (event.altKey === true) {

  }
  else if (idiagramSvg.gClicked === "m" && wrapperObject.hasOwnProperty("uno")) {
    //pressed m-click We want to open  mapform
    event.stopPropagation(); //stop the browser from following
    var urlCommand = "+++&edit=" + wrapperObject.uno;
    $.address.history(true);
    wrapperObject.processURLCommandsForOnURLetc(urlCommand);
  }

  // }
};
BaseIdClass.prototype.doubClkFn = function(e) {
  var wrapperObject = idGroupObject[$(this).attr("id")];
  if (wrapperObject.onDoubleClick !== null) {

    wrapperObject.processURLCommandsForOnURLetc(wrapperObject.onDoubleClick);

  }
  // none of these below worked.
  // window.location.href = "http://stackoverflow.com";
  // $("<a href='http://www2.deloitte.com' target='_blank'></a>").click();
  // $("<a href=" + doubleClick + "></a>").click();
};
// when we need to handle both double and single clicks
BaseIdClass.prototype.setClickAndDoubleClick = function() {
  /**
   * Handle Click and double-click of svg objects here
   */
  if (this.alreadySetClickAndDoubleClick === false) {
    this.alreadySetClickAndDoubleClick = true;
    var thisId = this.uno;
    this.doubleClick = idiagramSvg.getDatabase(thisId, "onDoubleClick");


    /**
     * clickAction replaces onclick and has:  
     *
     * both   hovering will open a closed UNO, and close an open one
     * open   hovering will open a closed UNO
     * close  hovering will close an open UNO
     * none   hovering will not open or close an UNO - but hover will show a tooltip / info-pane if infoPane or tooltip says to.
     * function   run the custom function specified in the new field hoverFunction  
     **/
    var onclick = this.clickAction !== undefined ? "1" : "0";
    onclick = onclick == "1" && this.clickAction == "none" ? "0" : "1"; //if clickAction is none, set onclick to 0 else keep it the same.
    /* if (this.hoverAction && this.hoverAction.length && this.onclick == "0") {
       //console.log("infoPane: " + this.infoPane + "hoverAction: " + this.hoverAction + " onclick: " + this.onclick + " uno: " + this.uno);
     }*/

    var isDoubleClick = (this.doubleClick && this.doubleClick.length && this.doubleClick !== "0") ? true : false;
    var isSingleClick = (onclick.length && onclick == "1") ? true : false;
    if (isDoubleClick && isSingleClick) {
      $(this.gIdObject).single_double_click(this.single, this.doubClkFn);
    }
    else if (isDoubleClick) {
      $(this.gIdObject).dblclick(this.doubClkFn);
    }
    else if (isSingleClick) {
      $(this.gIdObject).click(this.single);
    }
  }
};
BaseIdClass.prototype.setHoverOnOff = function() {
  /**
   * Handle hover logic here
   */
  if (this.alreadySetHoverOnOff === false) {
    this.alreadySetHoverOnOff = true;
    // If hover is zero then do not do hovering. Still do click stuff,
    // though.
    if (this.onhover === null) {
      this.onhover = this.hoverAction ? "1" : "0"; //there is no more on onhover. This line WAS: idiagramSvg.getDatabase(this.uno, "onhover");
    }
    if (this.onhover.length && this.onhover == "1") { // Stop tooltip from
      // showing right when it
      // begins, so nothing
      // shows if it isn't
      // supposed to
      // $(this).on('show.bs.tooltip', function(e) {
      var that = this;
      // this is for the tooltip stuff. If we are not focusing on the
      // group that has the tooltip, turn it off.

      $(this.gIdObject).hover(function(e) {

        if (idiagramSvg.Panning === true) {
          e.stopImmediatePropagation();
          e.preventDefault();
          //console.log("Panning is true in hover on");
          return;
        }
        timer = setTimeout(function(e) {

          if (hasClass(this, "clicked")) {
            removeClass(this, "clicked");
          }
          //with the new hoverAction crap, we need to know what state we were in before hovering,
          //and then if there is a click, then toggle that state.
          var stateBeforeHovering = hasClass(this.dddGIdObject.gIdObject, "open") ? "prev-open" : "prev-close";

          //make sure you remove extra junk. I had situation where they were both in there.
          stateBeforeHovering == "prev-open" ? removeClass(this.gIdObject, "prev-close") : removeClass(this.gIdObject, "prev-open");
          addClass(this.gIdObject, stateBeforeHovering);
          this.savedStateOfWrappedElements = [];
          idiagramSvg.getStatesOfAllWrappedElements(that.savedStateOfWrappedElements);
          this.hoveredOnLogic(); //need to put this here so we don't get wrong tooltip and flashing tooltips
          // $(that.gIdObject).tooltip('lm-show');

          //console.log("this= " + that.thisId + " target= " + $(e.currentTarget).attr("id")  + "in hover on");
        }.bind(that), idiagramSvg.getGlobal("showDelay"));
      }.bind(that), function(e) {
        clearTimeout(timer);

        removeClass($(".ooo"), "prev-open");
        removeClass($(".ooo"), "prev-close");
        if (that !== e.currentTarget) //if you 
        {
          setTimeout(function() {
            if (hasClass(e.currentTarget, "clicked")) {
              // if user clicked on this, then when hover off,
              // do nothing.
              // i can tell if he clicked on this because in
              // the click listener singleClk = function()
              // I add click to this class.
              this.savedStateOfWrappedElements = null; //free up memory
              removeClass(e.currentTarget, "clicked");
              return;
            }
            //  $(that.gIdObject).tooltip('hide');
            // TODO: This logic should be handled in overloaded
            // ooo and ccc hoveredOnLogic() and hoveredOffLogic
            // I am doing this for Safari because the css style,
            // set pointer_events :none did not work; it still
            // was triggered when hovering off ooo or ccc.
            if (this.savedStateOfWrappedElements !== undefined) {
              idiagramSvg.restoreStatesOfAllWrappedElements(this.savedStateOfWrappedElements);
            }
            else {
              //console.log("error restoring state after hover off");
            }
            this.savedStateOfWrappedElements = null; //free up memory
            that.hoveredOffLogic();
            //console.log("this= " + this.thisId + " target= " + $(e.currentTarget).attr("id") + " in hover off");
          }.bind(that), idiagramSvg.getGlobal("hideDelay"));
        }
      }.bind(that));
    }
  }
};


/**
 * Gets called when vvv or uno (ddd) is showing their contents. So with vvv, on an open or temp open state
 * with an uno group, this gets called with an on event. 
 */
BaseIdClass.prototype.processURLCommandsForOnURLetc = function(urlCommand) {
  if (urlCommand !== null) {
    // get a list of parameters and execute them
    //console.log("Custom On/off command: " + urlCommand);
    urlCommand = urlCommand.replace(/^\?/, ""); //replace leading "?" with nothing
    var q = idiagramSvg.getURLParameterList(urlCommand);
    idiagramSvg.processCommandsInURL(q);
  }
};



/**
 * This will tell us if this object is in this state
 */
BaseIdClass.prototype.isStateMatch = function(state) {
  var isHidden;
  switch (state) {
    case "on":
      //isHidden = this.isHide();
      if (this.isOn() === true) {
        return true;
      }
      else {
        return false;
      }
      // break;
    case "open":

      if (this.isOpen() === true) {
        return true;
      }
      else {
        return false;
      }
      // break;
    case "off":
      if (this.isOn() === false) {
        return true;
      }
      else {
        return false;
      }
      //  break;
    case "close":
      if (this.isOpen() === false) {
        return true;
      }
      else {
        return false;
      }
      // break;
    case "+++":
      return true;
      //  break;
    default:
      // default code block
      return false;
      // break;
  }
};

/**
 * reportMyState() is called by getStatesOfAllWrappedElements() which is called by
 * createHoverEventForTaggedWords() to create a copy of current state of all wrapped elements (which are id
 * elements that are wrapped with an object derived from BaseIdClass) This will make a copy of all states and
 * element classes and whatever needs to be retored back to the original value after the user hovers off a
 * linked item in the pane
 */
BaseIdClass.prototype.reportMyState = function() {
  var state = {

    class: this.gIdObject.getAttribute("class")
  };
  return state;
};
/**
 * restore state after hover off
 */
BaseIdClass.prototype.restorMyState = function(state) {


  //TODO:Make sure this works for all browsers:
  this.gIdObject.setAttribute("class", state.class);
};

/**
 * This handles an UNO (used to be called ddd and it still is right now.) svg group object that has prefixed
 * children such as vvv,ooo TODO: Change all ddd to uno, maybe
 */
function DddClass(gIdObject) {
  BaseIdClass.call(this, gIdObject);
  this.className = "DddClass";
}
DddClass.prototype = new BaseIdClass();
DddClass.prototype.constructor = DddClass;
DddClass.prototype.initialize = function() {
  BaseIdClass.prototype.initialize.call(this);
  $(this.gIdObject).addClass("close"); //set everything to close initially so I know what state the ddd is in
};


/**
 * Code from MC
 **/
DddClass.prototype.setThisToOpenOnly = function() {
  if (this.isOpen() == false || this.isOff()) {

    addClass(this.gIdObject, "open");
    addClass(this.vvvGIdObject.gIdObject, "open");
    addClass(this.xxxGIdObject.gIdObject, "open");
    removeClass(this.gIdObject, "close");

    removeClass(this.vvvGIdObject.gIdObject, "close");
    removeClass(this.xxxGIdObject.gIdObject, "close");
    this.processURLCommandsForOnURLetc(this.openURL);
  }
  //this.setThisToOn();
  // if (!$(this.gIdObject).hasClass("lockOnOff")) {
  addClass(this.gIdObject, "on");
  removeClass(this.gIdObject, "off");
  // }
  this.resetOnOff();
};

/**
 * Code from MC
 **/
DddClass.prototype.setThisToCloseOnly = function() {
  if (this.isClose() == false) {
    //this.isThisGroupOpen = false;

    addClass(this.gIdObject, "close");
    removeClass(this.gIdObject, "open");

    addClass(this.vvvGIdObject.gIdObject, "close");
    addClass(this.xxxGIdObject.gIdObject, "close");
    removeClass(this.vvvGIdObject.gIdObject, "open");
    removeClass(this.xxxGIdObject.gIdObject, "open");

    // this.setThisToOn(); why do this?
    this.resetOnOff();

    this.processURLCommandsForOnURLetc(this.closeURL);
  }
};



DddClass.prototype.setOpenState = function() {
  //if (this.isThisGroupOpen === false) {
  // $(this.gIdObject).find("g[mytype]").each(function() {
  //   addClass(this, "on");
  //   removeClass(this, "off");
  // });
  if (this.isOpen() == false || this.isOff()) {
    // this.isThisGroupOpen = true;
    addClass(this.gIdObject, "open");
    addClass(this.vvvGIdObject.gIdObject, "open");
    addClass(this.xxxGIdObject.gIdObject, "open");
    removeClass(this.gIdObject, "close");
    removeClass(this.vvvGIdObject.gIdObject, "close");
    removeClass(this.xxxGIdObject.gIdObject, "close");
    this.processURLCommandsForOnURLetc(this.openURL);
  }
  //this.setThisToOn();
  // if (!$(this.gIdObject).hasClass("lockOnOff")) {
  addClass(this.gIdObject, "on");
  removeClass(this.gIdObject, "off");
  // }
  this.resetOnOff();

  // do default, do NOT run custom function
  this.defaultShowHide();
};

DddClass.prototype.setCloseState = function() {
  if (this.isClose() == false) {
    //this.isThisGroupOpen = false;

    addClass(this.gIdObject, "close");
    addClass(this.vvvGIdObject.gIdObject, "close");
    addClass(this.xxxGIdObject.gIdObject, "close");
    removeClass(this.gIdObject, "open");
    removeClass(this.vvvGIdObject.gIdObject, "open");
    removeClass(this.xxxGIdObject.gIdObject, "open");
    this.processURLCommandsForOnURLetc(this.closeURL);

    this.resetOnOff();

    //  do default, do NOT run custom function
    this.defaultShowHide();
  }
};


/**
 * Note: I WAS giong to close stuff when I turned ddd off, but that would defeat the purpose of saving the
 * state when a parent is turned off then turned on again, though maybe I should only save the state when
 * something is closed.
 */
DddClass.prototype.setThisToOff = function() {
  //if (this.isThisGroupOn === true) {

  this.processURLCommandsForOnURLetc(this.offURL); //I think this should always execute here.

  BaseIdClass.prototype.setThisToOff.call(this);
  // }
};

//took this out for MC's smart command idea
DddClass.prototype.setThisToOpen = function() {
  var isOpen = true;
  if ((this.isOpen() == false) || this.isOff()) {
    isOpen = false;
    addClass(this.gIdObject, "open");
    addClass(this.vvvGIdObject.gIdObject, "open");
    addClass(this.xxxGIdObject.gIdObject, "open");
    removeClass(this.gIdObject, "close");

    removeClass(this.vvvGIdObject.gIdObject, "close");
    removeClass(this.xxxGIdObject.gIdObject, "close");
    this.processURLCommandsForOnURLetc(this.openURL);
  }
  //this.setThisToOn();
  //if (!$(this.gIdObject).hasClass("lockOnOff")) {
  addClass(this.gIdObject, "on");
  removeClass(this.gIdObject, "off");
  //}
  this.resetOnOff();
  if (isOpen == false) {
    //if designer does not have a custom function here do default, which is show or hide, else run custom function
    if (!this.openFunction) {
      this.defaultShowHide();
    }
    else {
      callCustomFunction(this.openFunction);
      //this.processURLCommandsForOnURLetc(this.openFunction); //url command
    }
  }


  //this.resetOnOff(); //turn on the ddd if it is not already, meaning the UNO group, which is the parent of this ooo
  //this.defaultShowHide();
};

DddClass.prototype.setThisToClose = function() {
  if (this.isClose() == false) {
    //this.isThisGroupOpen = false;

    addClass(this.gIdObject, "close");
    removeClass(this.gIdObject, "open");


    addClass(this.vvvGIdObject.gIdObject, "close");
    addClass(this.xxxGIdObject.gIdObject, "close");
    removeClass(this.vvvGIdObject.gIdObject, "open");
    removeClass(this.xxxGIdObject.gIdObject, "open");
    //now set vvv children to off and xxx children to on


    this.resetOnOff();
    //if designer does not have a custom function here do default, which is show or hide, else run custom function
    if (!this.closeFunction) {
      this.defaultShowHide();
    }
    else {
      callCustomFunction(this.closeFunction);
    }

    this.processURLCommandsForOnURLetc(this.closeURL);
  }
};


/** ************************************************************* */
/**
 * This handles a vvv svg group object
 */
function VvvClass(gIdObject) {
  BaseIdClass.call(this, gIdObject);
  this.className = "VvvClass";
}
VvvClass.prototype = new BaseIdClass();
VvvClass.prototype.constructor = VvvClass;
VvvClass.prototype.initialize = function() {
  BaseIdClass.prototype.initialize.call(this);
  $(this.gIdObject).addClass("close"); //set everything to close initially so I know what state the ddd is in

};



/** ************************************************************* */
/**
 * This handles a ooo svg group object
 */
function OooClass(gIdObject) {
  BaseIdClass.call(this, gIdObject);
  this.className = "OooClass";
}
OooClass.prototype = new BaseIdClass();
OooClass.prototype.constructor = OooClass;
OooClass.prototype.initialize = function() {
  BaseIdClass.prototype.initialize.call(this);

  this.setTooltip();
  this.setHoverOnOff();
  this.setClickAndDoubleClick();
  if (!this.oooGIdObject || !this.vvvGIdObject /* || !this.cccGIdObject */ ) {
    // alert("missing an ooo or vvv group in id=" + this.thisId);
    return;
  }
  if (this.unoGIdObject) {

  }
};


/**
 * The only function called when the mouse clicks on an svg object, which must be an ooo group
 **/
OooClass.prototype.clickedGroup = function() {

  //First find out what original open/close state this was in before hovering. We need to toggle that.
  //We need to set this state to "close", for example, now see if it is already in a close state from hovering.
  //If it is, then do nothing except maybe record a new url and set stateBeforeHovering to close (in this example)


  if (hasClass(this.gIdObject, "prev-open")) {
    //you need to close this if not already
    if (this.dddGIdObject.isOpen()) {
      this.dddGIdObject.setThisToClose();
      $(this.dddGIdObject.gIdObject).removeClass("permanent");
    }

    //idiagramSvg.addCommandToURL("open", this.uno) ;

    var val = $.address.queryString();
    if (val.indexOf("open=" + this.uno) > -1) /* if there is a open in the url */ {
      idiagramSvg.removeCommandFromURL("open", this.uno, true);
      val = $.address.queryString();
    }
    if (val.indexOf("close=" + this.uno) === -1) {
      // $.address.parameter("close", this.uno, true);
      $.address.queryString(val + "&" + "close=" + this.uno);
    }
    // set title and history value from label field in db
    // I don't send in an id because I populated page title
    // above.
    idiagramSvg.updateAddress(this.uno, true);
    idiagramSvg.PreviousUrlAddress = $.address.value();
    removeClass(this.gIdObject, "prev-open");
    addClass(this.gIdObject, "prev-close");
  }
  else /* If this was not previously opened, then open it */ {
    if (!this.dddGIdObject.isOpen()) {
      this.dddGIdObject.setThisToOpen();
    }
    if (hasClass(this.gIdObject, "prev-close")) {
      this.oldTitle = $.address.title();
      // setting autoUpdate to false makes it so it doesn't update
      // the URL in the address bar until I set it to true.
      //$.address.autoUpdate(false);

      //idiagramSvg.addCommandToURL("open", this.uno);
      //return;
      // $.address.value("");
      // see if this is already in the URL
      var val = $.address.queryString();
      if (val.indexOf("close=" + this.uno) > -1) /* if there is a close in the url */ {
        idiagramSvg.removeCommandFromURL("close", this.uno, true);
        val = $.address.queryString();
      }
      if (val.indexOf("open=" + this.uno) === -1) {
        // $.address.parameter("close", this.uno, true);
        $.address.queryString(val + "&" + "open=" + this.uno);
      }
      // set title and history value from label field in db
      // I don't send in an id because I populated page title
      // above.
      idiagramSvg.updateAddress(this.uno, true);
      idiagramSvg.PreviousUrlAddress = $.address.value();
    }
    removeClass(this.gIdObject, "prev-close");
    addClass(this.gIdObject, "prev-open");
    $(this.dddGIdObject.gIdObject).addClass("permanent"); //TODO: do we really use this permanent?
  }
  if (this.infoPane && /click/.test(this.infoPane)) {
    idiagramSvg.populateInfoPane(this.unoGIdObject);
  }


};

OooClass.prototype.altClickedGroup = function() {
  var addressHistoryState = $.address.history();
  if ($(this.dddGIdObject.gIdObject).hasClass("permanent") == false) /*In other words, this is closed */ {
    this.parentOpenAllChildren();
    idiagramSvg.addCommandToURL("openall", this.uno); //openall=id
    idiagramSvg.removeDupCommandValFromUrl("openall", this.uno); //remove duplicate of this key/value from url
    idiagramSvg.removeCommandFromURL("closeall", this.uno, true); //do not have openall when we have closeall
    $.address.history(true);
    $.address.update();
    idiagramSvg.PreviousUrlAddress = $.address.value();
  }
  else {
    this.parentCloseAllChildren();
    idiagramSvg.addCommandToURL("closeall", this.uno);
    idiagramSvg.removeDupCommandValFromUrl("closeall", this.uno); //remove duplicate of this key/value from url
    idiagramSvg.removeCommandFromURL("openall", this.uno, true); //do not have openall when we have closeall
    $.address.history(true);
    $.address.update();
    idiagramSvg.PreviousUrlAddress = $.address.value();
  }
  $.address.history(addressHistoryState);
};


OooClass.prototype.hoveredOnLogic = function() {
  // if (/both|open/.test(this.hoverAction)) { 
  //addClass(this.gIdObject, "enabled");
  //addClass(idiagramSvg.svgness, "disabled");
  // }

  //Only open if it is not already
  if (this.dddGIdObject.isClose()) {
    //if ($(this.dddGIdObject.gIdObject).hasClass("permanent") == false) /*In other words, this is closed */ {

    // addClass(this.gIdObject, "enabled"); //we need to do this first so it won't become disabled then enabled again.
    // addClass(this.myViewport, "disabled");

    // console.log("got hoveredOnObject from ooo!: " + this.thisId);
    if (/both|open/.test(this.hoverAction)) {
      this.setThisToOpen();
      //this.setThisToTemporaryOpen();
    }

  }
  else /* in other words, this is opened before hovering, so now close it. */ {
    if (/both|close/.test(this.hoverAction)) {
      this.setThisToClose();
      // console.log("ddd got hoveredOnObject from ooo but isThisGroupOpen is false !: " + this.thisId);
    }
  }
  //handle function call from hoverAction
  if (/function/.test(this.hoverAction) && this.hoverFunction) {
    //must be a function
    this.processURLCommandsForOnURLetc(this.hoverFunction);
  }
  if (this.infoPane && /hover|1/.test(this.infoPane)) {
    idiagramSvg.populateInfoPane(this.unoGIdObject);
  }
};
/**
 * For rule that says that no other groups get mouse events after ooo was clicked on until ooo gets hovered
 * off.
 */
OooClass.prototype.hoveredOffLogic = function() {
  return; //this is restored in setHoverOnOff()

};

// xxx class stuff

function XxxClass(gIdObject) {
  BaseIdClass.call(this, gIdObject);
  this.className = "XxxClass";
}
XxxClass.prototype = new BaseIdClass();
XxxClass.prototype.constructor = XxxClass;
XxxClass.prototype.initialize = function() {
  BaseIdClass.prototype.initialize.call(this);
  $(this.gIdObject).addClass("close"); //set everything to close initially so I know what state the ddd is in
  //$(this.gIdObject).addClass("on");
  // this.oldAddressValueForRRR = "";
  if (this.unoGIdObject !== null) {
    // I was going to comment this turnedOn thing out, but Xxx needs to be
    // on and accept mouse events sometimes.
    // css still turns it off in a closed-state.



  }
};


// end of xxx class stuff

/** ************************************************************* */
/**
 * This handles a wrapper with id in name db svg group object
 */
function WrapInDbClass(gIdObject) {
  BaseIdClass.call(this, gIdObject);
  this.className = "WrapInDbClass";
}
WrapInDbClass.prototype = new BaseIdClass();
WrapInDbClass.prototype.constructor = WrapInDbClass;
WrapInDbClass.prototype.initialize = function() {
  BaseIdClass.prototype.initialize.call(this);

  // $(this.gIdObject).addClass("close");
  /**
   * hover-on ooo-group = open (hide ooo, lm-show vvv and all of vvv’s other siblings, lm-show toolip) hover-off
   * ooo-group = close (hide vvv, lm-show ooo, tooltip off) Note that the UNO can contain other stuff: other
   * objects, sss-groups – but its only the ooo-group that responds to mouse events (only in a really simple
   * object with loose artwork and no other groups would it be right to to talk about hovering on the (whole)
   * UNO.) Hover-on ccc-group = close (hide vvv, lm-show ooo, lm-show toolip) Hover-off ccc-group = open (hide ooo,
   * lm-show vvv, tooltip off)
   */
  this.setTooltip();
  this.setHoverOnOff();
  this.setClickAndDoubleClick();
};

WrapInDbClass.prototype.setThisToOff = function() {
  // if (this.isThisGroupOn === true) {

  this.processURLCommandsForOnURLetc(this.offURL); //I think this should always execute here.

  BaseIdClass.prototype.setThisToOff.call(this);
  // }
};

/**
 * I took this out of the hover-on event because I was using it when we are parsing addresses in the URL and
 * also maybe in future, address that are clicked on in the text panes. I am changing hoveredOnObject to be
 * wrapper for object being hovered on.
 */
WrapInDbClass.prototype.hoveredOnLogic = function() {
  if (this.infoPane && /hover|1/.test(this.infoPane)) {
    idiagramSvg.populateInfoPane(this.unoGIdObject);
  }
};
WrapInDbClass.prototype.hoveredOffLogic = function() {
  // $(this.gIdObject).tooltip('hide');
  //MySmartTooltip.hide(this.gIdObject);

  // EventBus.dispatch("hoveredOffObject", this);
  // $(this.gIdObject).triggerHandler("hoveredOffObject");
};

/** ************************************************************* */
/**
 * This handles a wrapper without id name in db svg group object
 */
function WrapNotDbClass(gIdObject) {
  BaseIdClass.call(this, gIdObject);
  this.className = "WrapNotDbClass";
}
WrapNotDbClass.prototype = new BaseIdClass();
WrapNotDbClass.prototype.constructor = WrapNotDbClass;
WrapNotDbClass.prototype.initialize = function() {
  BaseIdClass.prototype.initialize.call(this);
  //$(this.gIdObject).addClass("close");
  /**
   * hover-on ooo-group = open (hide ooo, lm-show vvv and all of vvv’s other siblings, lm-show toolip) hover-off
   * ooo-group = close (hide vvv, lm-show ooo, tooltip off) Note that the UNO can contain other stuff: other
   * objects, sss-groups – but its only the ooo-group that responds to mouse events (only in a really simple
   * object with loose artwork and no other groups would it be right to to talk about hovering on the (whole)
   * UNO.) Hover-on ccc-group = close (hide vvv, lm-show ooo, lm-show toolip) Hover-off ccc-group = open (hide ooo,
   * lm-show vvv, tooltip off)
   */

};


var baseIdClass = {
  BaseIdClass: BaseIdClass,
  DddClass: DddClass,
  VvvClass: VvvClass,
  OooClass: OooClass,
  XxxClass: XxxClass,
  WrapInDbClass: WrapInDbClass,
  WrapNotDbClass: WrapNotDbClass,
  hasClass: hasClass,
  addClass: addClass,
  removeClass: removeClass,
  callCustomFunction: callCustomFunction,
  defaultShowHide: defaultShowHide,
  showXXX: showXXX,
  showVVV: showVVV,
  hideXXX: hideXXX,
  hideVVV: hideVVV,
  defaultHide: defaultHide,
  defaultShow: defaultShow,
  openOnly: openOnly,
  closeOnly: closeOnly,
  parentOpenAllChildren: parentOpenAllChildren,
  parentCloseAllChildren: parentCloseAllChildren

};
module.exports = baseIdClass;
