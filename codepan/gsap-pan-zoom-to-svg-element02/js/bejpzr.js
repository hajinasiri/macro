/**
 * configuration for jquery-ui screen layout, customized for  svg page
 * Created by Larry Maddocks
 */
var myLayout;

$(document).ready(function() {

    myLayout = $('body').layout(MapWindowlayoutSettings);

});

/*
*#######################
* OUTER LAYOUT SETTINGS
*#######################
*
* This configuration illustrates how extensively the layout can be customized
* ALL SETTINGS ARE OPTIONAL - and there are more available than shown below
*
* These settings are set in 'sub-key format' - ALL data must be in a nested data-structures
* All default settings (applied to all panes) go inside the defaults:{} key
* Pane-specific settings go inside their keys: north:{}, south:{}, center:{}, etc
*/

/**
 *This resizes the svg file when a pane is opened.
 */
var myWidgetResizer = function() {

};



var MapWindowlayoutSettings = {

    // options.defaults apply to ALL PANES - but overridden by pane-specific settings

    defaults : {
        //  west__maskIframesOnResize: "#svgembed"
        //,   east__maskIframesOnResize: "#svgembed",
        size : 320, // controls the initial open-size of the East and West panes
        minSize : 200,
        spacing_closed : 8, // space when closed
        spacing_open : 8, // space when open
        togglerLength_closed : 48, // "100%" OR -1 = full height
        togglerLength_open : 48, // WIDTH of toggler on north/south edges - HEIGHT on east/west edges
        togglerAlign_closed : "center", // align to center of resizer
        fxName : "slide", // none,                   slide, drop, scale
        fxSpeed_open : 400,
        fxSpeed_close : 1400,
        slideTrigger_open : "click", // default
        slideTrigger_close : "click",
        initClosed : false,
        fxSettings_open : {
            easing : "easeInQuint"
        },
        fxSettings_close : {
            easing : "easeOutQuint"
        },
        hideTogglerOnSlide : false, // hide the toggler when pane is 'slid open'
        togglerTip_open : "Close",
        togglerTip_closed : "Open",
        resizerTip : "Resize / Close",
        resizerTip_closed : "Open"
        /*
         ,   paneClass:              "pane"      // default = 'ui-layout-pane'
         ,   resizerClass:           "resizer"   // default = 'ui-layout-resizer'
         ,   togglerClass:           "toggler"   // default = 'ui-layout-toggler'
         ,   buttonClass:            "button"    // default = 'ui-layout-button'
         ,   contentSelector:        ".content"  // inner div to auto-size so only it scrolls, not the entire pane!
         ,   contentIgnoreSelector:  "span"      // 'paneSelector' for content to 'ignore' when measuring room for content
         */
    },

    name : "mapLayout", // NO FUNCTIONAL USE but could be used by custom code to 'identify' a layout
    center__paneSelector : ".map-pane",
    //center__onresize : myWidgetResizer,
    //center__onopen  : myWidgetResizer,
    //center__onclose  : myWidgetResizer,
    //    east__paneSelector : ".settings-pane",

    // This specification of the center__child is what creates the child -
    // We're not using it right now - but commenting it out broke stuff.  We don't create a div for it index.hbs
    center__childOptions : {
        south__paneSelector : ".map-controls", // .map-controls identifies the class for the center child - where we can put additional map controls things
        togglerLength_closed : 0, // the toggler is not resizeble - thus goes all the way across
        togglerLength_open : 0,
        south__size : 50,
        south__minSize : 50,
        south__maxSize : 50,
        initClosed : true,
        slideTrigger_open : "click", // default
        slideTrigger_close : "click"
    },

    east__childOptions : {
        south__paneSelector : ".legend",
        togglerLength_closed : 0, // the toggler is not resizeble - thus goes all the way across
        togglerLength_open : 0,
        south__size : 350, //Changed by Larry Maddocks so we can see some of the Layer Pane
        south__minSize : 100,
        initClosed : false,
        //        spacing_closed : 12,    // space when closed
        //        spacing_open : 12,  // space when open
        slideTrigger_open : "click", // default
        slideTrigger_close : "click"
    },
    north : {
        /*
         spacing_open:           1           // cosmetic spacing
         ,   togglerLength_open:     0           // HIDE the toggler button
         ,   togglerLength_closed:   -1          // "100%" OR -1 = full width of pane
         ,   resizable:              false
         ,   slidable:               false
         //  override default effect
         ,   fxName:                 "none"
         */
    },
    south : {
        maxSize : 50,
        minSize : 50
    },
    west : {
    //onopen  : myWidgetResizer,
    //onclose  : myWidgetResizer,
        size : 250,
        togglerTip_open : "Close Story Pane",
        togglerTip_closed : "Open Story Pane",
        resizerTip_open : "Resize",
        initClosed : false
        //  add 'bounce' option to default 'slide' effect
        //      ,   fxSettings_open:        { easing: "easeOutBounce" }
    },
    east : {
        
    
    //onopen  : myWidgetResizer,
    //onclose  : myWidgetResizer,
        size : 250,
        togglerTip_open : "Close Information Pane",
        togglerTip_closed : "Open Information Pane",
        resizerTip_open : "Resize",
        initClosed : false
    }
    /*
     ,
     center : {
     center__paneSelector : ".map-pane",
     overflow:   hidden,
     minWidth:   200,
     minHeight:  200
     }
     Don't want these to interfere with the named panes above: map-pane and settings-pane

     */

};
