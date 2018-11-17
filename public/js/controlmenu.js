//Navbar Hide On Scroll

var tooltipsOn = false;
$("body").addClass("hideQTip");

//var traceTime = 1.0;

(function($) {
    $(document).ready(function() {

        //   --------------  CONTEXT MENU ------------------------------
        // Context menu button --> function assignments
        $('#toggleHighlight').click( function () {
            toggleHighlightAction();
        });
        $('#unHighlight').click( function () {
            unHighlightAction();
        });
        $('#zoomTo').click( function () {
            zoomToAction();
        });
        $('#zoomAll').click( function () {
            zoomAllAction();
        });
        $('#openAll').click( function () {
            openAllAction();
        });
        $('#closeAll').click( function () {
            closeAllAction();
        });
        $('#traceUNO').click( function () {
            traceAction();
        });
        $('#editUNO').click( function () {
            editUNOAction();
        });
        $('#deleteComment').click( function () {
            deleteComment();
        });


        //   --------------  CONTROL MENU ------------------------------

        // hide .navbar first
        $(".navbar").addClass('hideme');

        // fade in .navbar
        $(function() {
            $(window).scroll(function() {
                // set distance user needs to scroll before we fadeIn navbar
                if ($(this).scrollTop() > 100) {
                    $('.navbar').removeClass('hideme');
                }
                else {
                    $('.navbar').addClass('hideme');
                }
            });

            // The reset button sets the map back to it's initial state, e.g. the "defaultURL" from the JSON file - which will be different for each map.
            $('#btnReset').click(function() {
                // Reset the map to the default URL
                if (idiagramSvg.designerPrefs.defaultURL !== undefined && idiagramSvg.designerPrefs.defaultURL.length) {
                    // First undo any highlighting
                    var q = idiagramSvg.getURLParameterList("+++&unhlt=all");
                    idiagramSvg.processCommandsInURL(q);
                    // var result = idiagramSvg.verifyQuestionMarkInURL(idiagramSvg.designerPrefs.defaultURL);
                    var q = idiagramSvg.getURLParameterList(idiagramSvg.designerPrefs.defaultURL);
                    idiagramSvg.processCommandsInURL(q);
                }
            });

            // Go back and reload the introduction page
            $('#btnIntro').click(function() {
                window.location.href = homeLink;
            });

            // Toggle full screen mode
            $('#btnFullscreen').click(function() {
                if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
                    launchIntoFullscreen(document.documentElement);
                }
                else {
                    exitFullscreen();
                }
            });

            // Open the default help page
            $('#helpButton').click(function() {
                idiagramSvg.showHelp();
            });

            // Open the user settings in the info-pane
            $('#btnSettings').click(function() {
                // Load settings.html into the info-pane
                var q = idiagramSvg.getURLParameterList("+++&fileInfo=/docs/settings.html");
                idiagramSvg.processCommandsInURL(q);
            });

            // Toggle tooltips off/on
            $('#btnTooltips').click(function() {
                if (tooltipsOn == true) {
                    $("body").addClass("hideQTip");
                    tooltipsOn = false;
                }
                else {
                    $("body").removeClass("hideQTip");
                    tooltipsOn = true;
                }
            });

            // Open a new printable window
            $('#btnPrint').click(function() {
                idiagramSvg.printSvg();
            });

            // Zoom + - All controls
            $('#btnZoomIn').click(function() {
                idiagramSvg.zoomTiger.zoomBy(1.2);
            });
            $('#btnZoomAll').click(function() {
                if (idiagramSvg.options && idiagramSvg.options.onResetClick) {
                    idiagramSvg.options.onResetClick();
                }
                else idiagramSvg.onResetClick();
            });
            $('#btnZoomOut').click(function(e) {
                idiagramSvg.zoomTiger.zoomBy(0.833333);
            });

            $('#btnBackwardSlide').click(function() {
                let e = jQuery.Event("keydown", { keyCode: 33, which: 33});
                $(document).trigger(e);
            });
            $('#btnForwardSlide').click(function() {
                let e = jQuery.Event("keydown", { keyCode: 34, which: 34});
                $(document).trigger(e);
            });
            $('#btnToggleWest').click(function() {
                let e = jQuery.Event("keydown", { keyCode: 87, which: 87});
                $(document).trigger(e);
            });
            $('#btnToggleEast').click(function() {
                let e = jQuery.Event("keydown", { keyCode: 69, which: 69});
                $(document).trigger(e);
            });

        });
    });
}(jQuery));

/* Show navbar */

$(function() {
    $('#shownav').hover(function() {
        $('.navbar').removeClass('hideme');
    });
});


/* show navbar on click */
var clickedOn = false;


$(function() {
    $('#shownav').click(function() {
        if (clickedOn == false) {
            clickedOn = true;
        }
        else {
            $('.navbar').addClass('hideme');
            clickedOn = false;
        }
    });
});


/* when navbar is hovered over it will override previous */

$(function() {
    $('.navbar').hover(function() {
        $('.navbar').removeClass('hideme');
    }, function() {
        if (clickedOn == false) {
            $('.navbar').addClass('hideme');
        }
    });
});

//
// -------------------------------- F U L L  S C R E E N --------------------------------
//

// Find the right method, call on correct element
function launchIntoFullscreen(element) {
    if(element.requestFullscreen) {
        element.requestFullscreen();
    } else if(element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
    } else if(element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
    } else if(element.msRequestFullscreen) {
        element.msRequestFullscreen();
    }
}

// Whack fullscreen
function exitFullscreen() {
    if(document.exitFullscreen) {
        document.exitFullscreen();
    } else if(document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    } else if(document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    }
}

//
// -------------------------------- C O N T E X T - M E N U   F U N C T I O N S --------------------------------
//
//

var objectID;
var objectLabel;

function toggleHighlightAction() {
    if( objectID != "") {
        var command = "+++&togglehlt=" + objectID;
        var q = idiagramSvg.getURLParameterList(command);
        idiagramSvg.processCommandsInURL(q);
    }
}

function unHighlightAction() {
    if( objectID != "") {
        var command = "+++&unhlt=all";
        var q = idiagramSvg.getURLParameterList(command);
        idiagramSvg.processCommandsInURL(q);
    }
}

function zoomToAction() {
    if( objectID != "") {
        var command = "+++&gotoz=" + objectID;
        var q = idiagramSvg.getURLParameterList(command);
        idiagramSvg.processCommandsInURL(q);
    }
}

function zoomAllAction() {
    if (idiagramSvg.options && idiagramSvg.options.onResetClick) {
        idiagramSvg.options.onResetClick();
    }
    else idiagramSvg.onResetClick();
}

function openAllAction() {
    if( objectID != "") {
        // var command = "+++&openall=" + objectID;
        // var q = idiagramSvg.getURLParameterList(command);
        // idiagramSvg.processCommandsInURL(q);
        idiagramSvg.processCommandsAndAddToURL("openall",objectID);
    }
}

function closeAllAction() {
    if( objectID != "") {
        // var command = "+++&closeall=" + objectID;
        // var q = idiagramSvg.getURLParameterList(command);
        // idiagramSvg.processCommandsInURL(q);
        idiagramSvg.processCommandsAndAddToURL("closeall",objectID);
    }
}

function traceAction() {
    if( objectID != "") {
        var command = "+++&trace=" + objectID + "," + idiagramSvg.traceTime + ",100";
        var q = idiagramSvg.getURLParameterList(command);
        idiagramSvg.processCommandsInURL(q);
    }
}

function editUNOAction() {
    if( objectID != "") {
        var command = "+++&edit=" + objectID;
        var q = idiagramSvg.getURLParameterList(command);
        idiagramSvg.processCommandsInURL(q);
    }
}

    function deleteComment() {
        if (objectID != "") {
            let uno = idiagramSvg.idGroupObject[`${objectID}`];

            if (!uno.gIdObject.classList.contains('comment')) {
                return;
            } else {
                uno.label = null;
                uno.shortdescription = null;
                uno.longdescription = null;
                uno.onURL = null;
                uno.gIdObject.classList.remove("inuse");
                uno.gIdObject.classList.add("unused");

                setDatabase(objectID, "classes", "comment unused");
                setDatabase(objectID, "label", null);
                setDatabase(objectID, "shortDescription", null);
                setDatabase(objectID, "longDescription", null);
                setDatabase(objectID, "onURL", null);
                uno.setThisToOff();
                console.log("Comment Removed")
                }
        } else {
            return;
        }
    }


(function() {

    "use strict";


//
/////////    H E L P E R    F U N C T I O N S    /////////////////////////////////////////////
//

    /**
     * Function to check if we clicked inside an element with a particular class
     * name.
     *
     * @param {Object} e The event
     * @param {String} className The class name to check against
     * @return {Boolean}
     */
    function clickInsideElement( e, className ) {
        var el = e.srcElement || e.target;

        if ( el.classList.contains(className) ) {
            return el;
        } else {
            while ( el = el.parentNode ) {
                if ( el.classList && el.classList.contains(className) ) {
                    return el;
                }
            }
        }

        return false;
    }

    /**
     * Get's exact position of event.
     *
     * @param {Object} e The event passed in
     * @return {Object} Returns the x and y position
     */
    function getPosition(e) {
        var posx = 0;
        var posy = 0;

        if (!e) var e = window.event;

        if (e.pageX || e.pageY) {
            posx = e.pageX;
            posy = e.pageY;
        } else if (e.clientX || e.clientY) {
            posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }

        return {
            x: posx,
            y: posy
        }
    }





//
/////////// C O R E    F U N C T I O N S  //////////////////////////////////////////////
//


    /**
     * Variables.
     */
    var contextMenuClassName = "context-menu";
    var contextMenuItemClassName = "context-menu__item";
    var contextMenuLinkClassName = "context-menu__link";
    var contextMenuActive = "context-menu--active";

    // taskItemClassName sets what picks up the special right-click menu
    // var taskItemClassName = "task";
    var taskItemClassName = "svgMap";
    var taskItemInContext;

    var clickCoords;
    var clickCoordsX;
    var clickCoordsY;

    var menu = document.querySelector("#context-menu");
    var menuItems = menu.querySelectorAll(".context-menu__item");
    var menuState = 0;
    var menuWidth;
    var menuHeight;
    var windowWidth;
    var windowHeight;

    let commentModalClassName="comment-modal"
    let modal = document.querySelector(".comment-modal");
    let closeCommentBtn = document.getElementById("close-comment-modal");
    let modalState = 0;
    let modalHeight;
    let modalWidth;

    /**
     * Initialise our application's code.
     */
    function init() {
        contextListener();
        clickListener();
        keyupListener();
        resizeListener();
        commentListener();
    }

    /**
     * Listens for contextmenu events.
     */
    function contextListener() {
        document.addEventListener( "contextmenu", function(e) {
            taskItemInContext = clickInsideElement( e, taskItemClassName );

            // Get the object ID of thing clicked on
            clickCoords = getPosition(e);
            let contextMenu = document.querySelector('#context-menu');
            // Calculate the click position in native map coordinates (in points - from the upper left corner)
            var s = idiagramSvg.zoomTiger.getSizes();
            var pan = idiagramSvg.zoomTiger.getPan();

            // We need to adjust the x value for the width of the West pane and the pane-sizer
            var pane = document.getElementById("story-pane");
            var westpaneWidth = pane.clientWidth;

            var paneSizerWidth = 4;
            window.pointx = (clickCoords.x - westpaneWidth - paneSizerWidth - pan.x) / s.realZoom;
            window.pointy = (clickCoords.y - pan.y) / s.realZoom;
            console.log("x y in points:   : " + pointx + "  " + pointy);

            var clickObject = document.elementFromPoint(clickCoords.x, clickCoords.y);
            objectID = clickObject.parentElement.parentElement.id;
            // If the ooo object is a 'circle' then this works, if it's a 'path' then there's another level of embeddedness
            var clickedThing = document.getElementById(objectID);
            if ($(clickedThing).hasClass("uno") != true) {
                // When clicking empty space, clickedThing === null and throws error. If statement prevents error.
                if (clickedThing !== null) {
                    objectID = clickedThing.parentNode.id;
                }
            }



            if ($(clickedThing).hasClass("uno")) {
                contextMenu.style.PointerEvents = "auto";
            }

            if (clickedThing === null) {
                contextMenu.style.pointerEvents = "none";
            } else {
                contextMenu.style.PointerEvents = "auto";
            }




            // clicking anywhere now brings up the menu
            e.preventDefault();
            toggleMenuOn();
            positionMenu(e);

            //Removing the logic below which only brought up the menu depending on what was clicked
            // if ( taskItemInContext ) {
            //  let contextMenu = document.getElementById('#context-menu');
            //  contextMenu.style.pointerEvents = "none";
            // e.preventDefault();
            // toggleMenuOn();
            // positionMenu(e);

            // } else {
            //     taskItemInContext = null;
            //     toggleMenuOff();
            //  }
        });
    }


    // Click function for clicking add Comment in context menu, toggles and positions modal.
    function commentListener() {
    document.getElementById("addComment").addEventListener("click", function(e) {
        e.preventDefault();
        toggleCommentModalOn();
        positionModal(e);
        });

}



    /**
     * Listens for click events.
     */
    function clickListener() {
        document.addEventListener( "click", function(e) {
            var clickeElIsLink = clickInsideElement( e, contextMenuLinkClassName );

            if ( clickeElIsLink ) {
                e.preventDefault();
                menuItemListener( clickeElIsLink );
            } else {
                var button = e.which || e.button;
                if ( button === 1 ) {
                    toggleMenuOff();
                }
            }
        });
    }

    /**
     * Listens for keyup events.
     */

    function keyupListener() {
        window.onkeyup = function(e) {
            if ( e.keyCode === 27 ) {
                toggleMenuOff();
            }
        }
    }

    /**
     * Window resize event listener
     */
    function resizeListener() {
        window.onresize = function(e) {
            toggleMenuOff();
        };
    }

    /**
     * Turns the custom context menu on.
     */
    function toggleMenuOn() {
        if ( menuState !== 1 ) {

            // Set the label of the thing right-clicked on
            if (objectID != null){
                objectLabel = idiagramSvg.getDatabase(objectID, "label");

                // Insert the label of the thing right-clicked on at the top of the right menu - and in the edit menu.
                document.getElementById("unoLabel").innerHTML = objectLabel;

                // Insert the URL link from the DB, if there is one into urlLink
                var url = idiagramSvg.getDatabase(objectID, 'url');
                if(url != ""){
                    var link = document.createElement("a");
                    link.setAttribute("href", url);
                    link.setAttribute("target", "_blank");
                    var str = String.fromCharCode(0xf08e) + " " + idiagramSvg.getDatabase(objectID, 'urlText');
                    link.appendChild(document.createTextNode( str ));
                    document.getElementById("urlLink").appendChild(link);
                }
            }

            menuState = 1;
            menu.classList.add( contextMenuActive );
        }
    }

    /**
     * Turns the custom context menu off.
     */
    function toggleMenuOff() {
        if ( menuState !== 0 ) {

            // Clear the urlLink
            document.getElementById("urlLink").innerHTML = "";

            menuState = 0;
            menu.classList.remove( contextMenuActive );
        }
    }

    /**
     * Positions the menu properly.
     *
     * @param {Object} e The event
     */
    function positionMenu(e) {
        var menuoffset = 6;
        clickCoords = getPosition(e);
        clickCoordsX = clickCoords.x;
        clickCoordsY = clickCoords.y;

        // We need to adjust the width values for the size fo the West and East panes
        var pane = document.getElementById("story-pane");
        var westpaneWidth = pane.clientWidth;
        pane = document.getElementById("info-pane");
        var eastpaneWidth = pane.clientWidth;

        clickCoordsX -= westpaneWidth;
        windowWidth = window.innerWidth - westpaneWidth - eastpaneWidth;
        windowHeight = window.innerHeight;

        menuWidth = menu.offsetWidth + menuoffset;
        menuHeight = menu.offsetHeight + menuoffset;


        if ( (windowWidth - clickCoordsX) < menuWidth ) {
            menu.style.left = windowWidth - menuWidth - (3 * menuoffset) + "px";
        } else {
            menu.style.left = clickCoordsX + menuoffset + "px";
        }

        if ( (windowHeight - clickCoordsY) < menuHeight ) {
            menu.style.top = windowHeight - menuHeight - menuoffset + "px";
        } else {
            menu.style.top = clickCoordsY + menuoffset + "px";
        }
    }

    // Open Comment Modal
    function toggleCommentModalOn() {
        if ( modalState !== 1 ) {
            modal.style.display="block";

            closeCommentBtn.onclick = function() {
                toggleCommentModalOff()
            };
            // clicking out of modal hides modal
            window.onclick = function(event) {
                if (event.target == commentModal) {
                    toggleCommentModalOff()
                }
            };
           modalState = 1;
        }
    }

    function toggleCommentModalOff() {
        if ( modalState !== 0 ) {
            modal.style.display = "none";

            modalState = 0;
        }
    }


    // Saving data from comment modal to database
    $('#commentModalBtn').click( function (e) {

        // Select the first unused uno - in the correct order
        let commentUnos = document.querySelectorAll(".comment.unused");
        let uno = commentUnos[commentUnos.length - 1];
         console.log('STRING', `'#${uno.id}'`);

        // Get the form data
        let annotationLabel = document.getElementById("annotationLabel").value;
        let commentLongDesc = document.getElementById("commentLongDescription").value;

        //Set the Form Data - first in the UNO object, then in the local DB, then in the server DB
        $(uno).removeClass("unused").addClass("inuse");
        idiagramSvg.idGroupObject[uno.id].onURL = `+++&move='@${uno.id}',0.8,f,${pointx}, ${pointy}`;
        idiagramSvg.idGroupObject[uno.id].shortDesc = commentLongDesc;
        idiagramSvg.idGroupObject[uno.id].infopane = commentLongDesc;

        setDatabase(uno.id, "classes", "comment inuse");
        setDatabase(uno.id, "label", annotationLabel);
        setDatabase(uno.id, "shortDescription", commentLongDesc);
        setDatabase(uno.id, "longDescription", commentLongDesc);
        setDatabase(uno.id, "onURL", `+++&move='@${uno.id}',0.8,f,${pointx}, ${pointy}`);
        // Now that we've updated the DB, still need to reload the tooltip info.
        idiagramSvg.idGroupObject[uno.id].alreadySetToolTip = false;
        idiagramSvg.idGroupObject[uno.id].setTooltip();

        // Now that we've set it up, turn on the UNO so we can see it.
        idiagramSvg.idGroupObject[uno.id].setThisToOn();

        // clear the Form Data
        $('#annotationLabel').val('');
        $('#commentLongDescription').val('');
        toggleCommentModalOff();
    })

    $('#close-comment-modal').click( function (e) {
        toggleCommentModalOff()
    });


    function positionModal(e) {
        let modaloffset = 6;
        clickCoords = getPosition(e);
        clickCoordsX = clickCoords.x;
        clickCoordsY = clickCoords.y;

        let pane = document.getElementById("story-pane");
        let westpaneWidth = pane.clientWidth;
        pane = document.getElementById("info-pane");
        let eastpaneWidth = pane.clientWidth;

        clickCoordsX -= westpaneWidth;
        windowWidth = window.innerWidth - westpaneWidth - eastpaneWidth;
        windowHeight = window.innerHeight;

        modalWidth = modal.offsetWidth + modaloffset;
        modalHeight = modal.offsetHeight + modaloffset;

        if ( (windowWidth - clickCoordsX) < modalWidth ) {
            modal.style.left = windowWidth - modalWidth - (3 * modaloffset) + "px";
        } else {
            modal.style.left = clickCoordsX + modaloffset + "px";
        }

        // Adjust the y postition for where the click on the 'Add Comment' happened.
        clickCoordsY -= modalHeight * 0.7;
        if ( (windowHeight - clickCoordsY) < modalHeight ) {
            modal.style.top = windowHeight - modalHeight + "px";
        } else {
            modal.style.top = clickCoordsY + modaloffset + "px";
        }
    }




    /**
     * Dummy action function that logs an action when a menu item link is clicked
     *
     * @param {HTMLElement} link The link that was clicked
     */
    function menuItemListener( link ) {
        console.log( "Task ID - " + taskItemInContext.getAttribute("data-id") + ", Task action - " + link.getAttribute("data-action"));
        toggleMenuOff();
    }


    /**
     * Run the app.
     */
    init();

})();

