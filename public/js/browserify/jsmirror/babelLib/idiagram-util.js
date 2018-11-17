"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _marked = [getDb].map(_regenerator2.default.mark);

/**
 * idiagram-util.js class for for new utilities. Initially set up to move standardized functions from
 * customstuff.js
 */
/* global $, 
    TweenLite,   
    Window,  myLayoutObj, present, showdown,  MouseEvent, myClientSocket, Handlebars, mapDbApi,
    idiagramSvg */
// --------------------------------  H I G H L I G H T I N G --------------------------------
// Marsahll Clemens - 11/28/2016
//

// -------------------------------- H I G H L I G H T I N G --------------------------------
// The togglehlt functions accept a single UNO ID as a selector, e.g. hlt=unoA
//  Global durations and opacity variable used by all highlighting functions
//  Defaults set here, and they can be changed with the sethlt command.
var hltDuration = 1.0;
var hltOpacity = 0.80;
var bw = 1;

// Setup the highlighting variables: duration, opacity, high or low light (1=white or 0=black)
function sethlt(selectorAndResultArray) {
    var selector = selectorAndResultArray.selector;

    var params = selector.split(",");

    hltDuration = Number(params[0].trim());
    hltOpacity = Number(params[1].trim());
    bw = Number(params[2].trim());

    // If there is an existing dimming layer, remove it - so the new values can take effect
    var dimmingGroup = document.getElementById("dimmingLayer");
    if (dimmingGroup != null) {
        dimmingGroup.parentNode.removeChild(dimmingGroup);
    }
}

// hlt sets the UNO highlighing on - if it's already on, delete the current copy and make a new one (in case you want to highlight the current open/closed state)
function hlt(selectorAndResultArray) {
    var selector = selectorAndResultArray.selector;
    var theMap = $("g.svg-pan-zoom_viewport")[0];

    // Create a highlight for the selector (UNO)

    var unoID = selector;
    var uno1 = document.getElementById(unoID);
    if (uno1 != null) {
        // Add the dimming layer (if it's not already there) - first, so the highlighted UNO will come after / on-top
        createDimming();
        var placeHolder = document.createElement("div");
        var pNode = uno1.parentElement;
        var insertedNode = pNode.insertBefore(placeHolder, uno1);
        insertedNode.id = unoID + "placeholder";
        // If this is the first UNO to be highlighted, else just bring it to the front without fading,
        var highlighted = theMap.querySelectorAll(".highlighted");
        if (highlighted.length == 0) {
            $("#" + unoID).appendTo(theMap);
            uno1.classList.add("highlighted");
        } else {
            var start = 1.0 - hltOpacity;
            TweenLite.to("#" + unoID, 0, {
                opacity: start
            });
            $("#" + unoID).appendTo(theMap);
            uno1.classList.add("highlighted");
            TweenLite.to("#" + unoID, hltDuration, {
                opacity: 1.0
            });
        }
    }

    $.address.parameter("hlt", ""); //remove all these commands from url
}

// togglehlt toggles the UNOs highlighing on/off - WORKS ONLY WITH ONE SELECTOR / UNO

function togglehlt(selectorAndResultArray) {
    var selector = selectorAndResultArray.selector;
    var theMap = $("g.svg-pan-zoom_viewport")[0];

    // Add the dimming layer (if it's not already there) - first, so the highlighted UNO will come after / on-top
    createDimming();
    TweenLite.to("#dimmingLayer", hltDuration, {
        opacity: hltOpacity
    });

    // Toggle a highlight for a single selector (UNO)

    var unoID = selector;

    // If the UNO is already highlighted - because there's a placeholder for this UNO
    var unoCopy = document.getElementById(unoID + "placeholder");
    if (unoCopy != null) {
        unhlt(selectorAndResultArray);
        $.address.parameter("togglehlt", ""); //remove all these commands from url
        return;
    }

    // Create the placeholder
    var uno1 = document.getElementById(unoID);
    if (uno1 != null) {
        var pNode = uno1.parentElement;
        var placeHolder = document.createElement("div");
        var insertedNode = pNode.insertBefore(placeHolder, uno1);
        insertedNode.id = unoID + "placeholder";

        // If this is the first UNO to be highlighted, else just bring it to the front without fading,
        var highlighted = theMap.querySelectorAll(".highlighted");
        if (highlighted.length == 0) {
            $("#" + unoID).appendTo(theMap);
            uno1.classList.add("highlighted");
        } else {
            // fade on the highlighted UNO nicely
            var start = 1.0 - hltOpacity;
            TweenLite.to("#" + unoID, 0, {
                opacity: start
            });
            $("#" + unoID).appendTo(theMap);
            uno1.classList.add("highlighted");
            TweenLite.to("#" + unoID, hltDuration, {
                opacity: 1.0
            });
        }
    }

    $.address.parameter("togglehlt", ""); //remove all these commands from url
}

// unhlt unhighlights the specified UNOs - and fades off the dimming layer if the .highlight class is empty
function unhlt(selectorAndResultArray) {
    // If the UNO is highlighted fade it off and remove it.  If there are no other highligthed UNOs fade out and turn off the dimming layer
    // Create a highlight for each selector (UNO)
    var i;
    var selector = selectorAndResultArray.selector;
    var theMap = $("g.svg-pan-zoom_viewport")[0];
    var placeHolder;
    var start;

    $.address.parameter("unhlt", ""); //remove all these commands from url

    if (selector == "all") {
        var highlighted = theMap.querySelectorAll(".highlighted");
        for (i = 0; i < highlighted.length; i++) {
            unoID = highlighted[i].id;
            uno1 = highlighted[i];
            if (uno1 != null) {
                placeHolder = document.getElementById(unoID + "placeholder");
                if (placeHolder != null) {
                    // fade off the highlighted UNO nicely
                    start = 1.0 - hltOpacity;
                    TweenLite.to("#" + unoID, hltDuration, {
                        opacity: start,
                        onCompleteParams: [unoID, placeHolder],
                        onComplete: moveUNO
                    });
                }
            }
        }
        return;
    }

    // Remove the highlight for each selector (UNO)
    var unoID = selector;
    var uno1 = document.getElementById(unoID);
    if (uno1 != null) {
        placeHolder = document.getElementById(unoID + "placeholder");
        if (placeHolder != null) {
            // fade off the highlighted UNO nicely
            start = 1.0 - hltOpacity;
            TweenLite.to("#" + unoID, hltDuration, {
                opacity: start,
                onCompleteParams: [unoID, placeHolder],
                onComplete: moveUNO
            });
        }
    }
}

function moveUNO(unoID, placeHolder) {
    var pNode = placeHolder.parentElement;
    var uno1 = document.getElementById(unoID);
    var theMap = $("g.svg-pan-zoom_viewport")[0];

    // move the UNO to before the placeholder, then remove the placeholder
    var insertedNode = pNode.insertBefore(uno1, placeHolder);

    TweenLite.to("#" + unoID, 0, {
        opacity: 1.0
    });

    uno1.classList.remove("highlighted");
    // this line of code allows a node to delete itself
    placeHolder.parentNode.removeChild(placeHolder);

    // If nothing else is highlighed, fade the dimming layer to 0 opacity, but do not remove it.
    var highlighted = theMap.querySelectorAll(".highlighted");
    if (highlighted.length == 0) {
        TweenLite.to("#dimmingLayer", hltDuration, {
            opacity: 0
        });
    }
}

function createDimming() {
    // Check to see if the dimming object exists
    if (document.getElementById("dimmingLayer") == null) {
        var theMap = $("g.svg-pan-zoom_viewport")[0];

        // whiteLayer was not initialized yet; we will do so now
        window.whiteLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");

        // 'http://www.w3.org/2000/svg' allows JQuery to handle window svg
        // namespace
        // setAttributeNS(null, 'transform', s); //example found in
        // svg_pan_zoom
        $(window.whiteLayer).attr({
            id: "dimmingLayer",
            "class": "dimmingLayer",
            style: "opacity: 0; pointer-events: none" //this will be tweened in below.
        });

        //        var mySVG = $("#svgness")[0];
        //        var svgRect = mySVG.getAttribute("viewBox");
        //        var svgRect = this.myViewport.getBBox();

        // Use the mandatory MapSize UNO to get the size for the dimming layer - which must be on to get the right size
        // Make the dimming rectangle 4X MapSize
        var q = idiagramSvg.getURLParameterList("+++&on=MapSize");
        idiagramSvg.processCommandsInURL(q);
        var mapSize = document.getElementById("MapSize");
        var svgRect = mapSize.getBBox();
        var x = svgRect.x - 2 * svgRect.width + svgRect.width / 2;
        var y = svgRect.y - 2 * svgRect.height + svgRect.height / 2;
        var w = 4 * svgRect.width;
        var h = 4 * svgRect.height;

        // Set the dimming layer to be white (default) or black.
        var fillcolor = "#FFFFFF";
        if (bw == 0) {
            fillcolor = "#000000";
        }

        var myRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        $(myRect).attr({
            height: h,
            width: w,
            y: y,
            x: x,
            "stroke-width": "0",
            fill: fillcolor
        });

        $(window.whiteLayer).append(myRect);
        $(window.whiteLayer).appendTo(theMap);
    }

    // Finally tween it visible
    TweenLite.to("#dimmingLayer", hltDuration, {
        opacity: hltOpacity
    });
}

//These functions are code that is moved from idiagram-svg.js to here to handle generators to handle
//asynchronous code because of the database .then stuff. This is so we don't execute a loop until we are
//ready.
var addClass = function addClass(el, className) {
    $(el).addClass(className);
    return;
};

function getValue(someKey) {
    return new Promise(function (resolve, reject) {
        idiagramSvg.masterForage.getItem(someKey).then(function (err, value) {
            if (!err) {
                console.log('we just read ' + value);
                resolve(value);
            } else {
                //
                resolve("");
            }
        });
    });
}

function getDatabaseCoRoutine() {
    this.result = null;
    this.field = null;
}

getDatabaseCoRoutine.prototype.getDatabase = function (thisId, key) {
    var _this = this;

    var scrubbedId = idiagramSvg.stripId(thisId);
    this.field = key;

    // Now loose the ddd or vvv. Do we really need  this?
    //truncatedId = stripVvvOrDdd(truncatedId);
    var row;
    //TODO: sometime handle the merged db of master and override.
    var newKey = scrubbedId; //"db_" + idiagramSvg.designerPrefs.masterDB + "_" + scrubbedId;
    // getValue(newKey).delay(5000).then(function(value) {
    //     console.log("value: " + value);
    //     return value;
    // });

    idiagramSvg.masterForage.getItem(newKey, function (row) {
        if (row !== undefined && row) {
            console.log('we just read ' + row);
            //var truncatedId = idiagramSvg.stripId(scrubbedId)
            if (row.id !== undefined && row.id === scrubbedId && row[_this.field] !== undefined) {
                //callBack(err, row[field]);

                var classesFromDBForThisId = row[_this.field];
                if (classesFromDBForThisId != undefined && classesFromDBForThisId.length) {
                    $("#" + scrubbedId).addClass(classesFromDBForThisId);
                }
            }

            _this.result = row;
        } else {
            _this.result = "";
        }
        $(_this).triggerHandler("getItemDone", [row]);
    }).catch(function (err) {
        // This code runs if there were any errors
        console.log(err);
    });
};

function getDb(thisId, field) {
    var truncatedId, row, newKey;
    return _regenerator2.default.wrap(function getDb$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    truncatedId = idiagramSvg.stripId(thisId);

                    // Now loose the ddd or vvv. Do we really need this?
                    //truncatedId = stripVvvOrDdd(truncatedId);

                    //TODO: sometime handle the merged db of master and override.
                    newKey = "db_" + idiagramSvg.designerPrefs.masterDB + "_" + truncatedId;
                    _context.next = 4;
                    return getValue(newKey).then(function (value) {
                        console.log("value: " + value);
                        return value;
                    });

                case 4:
                case "end":
                    return _context.stop();
            }
        }
    }, _marked[0], this);
}

var idiagramUtil = {
    togglehlt: togglehlt,
    unhlt: unhlt,
    getDatabaseCoRoutine: getDatabaseCoRoutine,
    getDb: getDb,
    hlt: hlt
};
module.exports = idiagramUtil;