/* global $, 
    jQuery,TweenLite, idiagramSvg */


function move(selectorAndResultArray) {

    // make sure syntax is correct. Can have zero or more spaces before
    // and after the comma: foo,play
    //var resultArray = shiftParams.match(/(\w+)(?:\s)*(?:%20)*,(?:\s)*(?:%20)*(\w+)/);

    if (selectorAndResultArray !== undefined && selectorAndResultArray !== null) {
        var selector = selectorAndResultArray.selector;
        var resultArray = selectorAndResultArray.resultArray;
        var relative = selectorAndResultArray.relative;
        idiagramSvg.addZeroOpacity(); //change stuff from display: none; to opacity:0.0 by setting one class & making css rules do the rest
        TweenLite.to(selector[1], resultArray[1], {
            x: relative + resultArray[3],
            y: relative + resultArray[4],
            onComplete: idiagramSvg.removeZeroOpacity
        }); //groupId,duration,x,y
    }
}

function rotate(selectorAndResultArray) {
    //rotate=unoid  | class,duration,relative,angle 
  
      if (selectorAndResultArray !== undefined && selectorAndResultArray !== null) {
        var selector = selectorAndResultArray.selector;
        var resultArray = selectorAndResultArray.resultArray;
        var relative = selectorAndResultArray.relative;
        idiagramSvg.addZeroOpacity(); //change stuff from display: none; to opacity:0.0 by setting one class & making css rules do the rest
        TweenLite.to(selector[1], resultArray[1], {
            transformOrigin: "50% 50%",
            rotation: relative + resultArray[3],
            onComplete: idiagramSvg.removeZeroOpacity
        });
    }
    else {
        alert("Bad selector: " + selector);
    }
}

function scale(selectorAndResultArray) {
    //So we could issue commands with a space between the classes, in order to tween multiple things at once.  Such as:
    // &scale=.step3 .step4,1,f,1.5,1.5
    //scale=unoid or .class,duration,relative(t or f),scaleX, scaleY
  
      if (selectorAndResultArray !== undefined && selectorAndResultArray !== null) {
        var selector = selectorAndResultArray.selector;
        var resultArray = selectorAndResultArray.resultArray;
        var relative = selectorAndResultArray.relative;
        idiagramSvg.addZeroOpacity(); //change stuff from display: none; to opacity:0.0 by setting one class & making css rules do the rest
        TweenLite.to(selector[1], resultArray[1], {
            transformOrigin: "50% 50%",
            scaleX: relative + resultArray[3],
            scaleY: relative + resultArray[4],
            onComplete: idiagramSvg.removeZeroOpacity
        });
    }

}


function fade(selectorAndResultArray) {
    //fade=unoid or .class,duration,relative,opacity i.e. fade='.myClass',1,f,0
   
      if (selectorAndResultArray !== undefined && selectorAndResultArray !== null) {
        var selector = selectorAndResultArray.selector;
        var resultArray = selectorAndResultArray.resultArray;
        var relative = selectorAndResultArray.relative;
        idiagramSvg.addZeroOpacity(); //change stuff from display: none; to opacity:0.0 by setting one class & making css rules do the rest
        TweenLite.to(selector[1], resultArray[1], {
            opacity: relative + resultArray[3],
            onComplete:  idiagramSvg.removeZeroOpacity
        });
    }
}


//fade everything exept the id that is sent in. Setting the opacity like this may screw future opacity
//settings.  At some point we need to remove these in-line opcity settings after calling this function.
//id could be a class
//TODO: Fix this up so that it works with the new interface to the run= api
function highlight(id) {
    var q;
    //var q = idiagramSvg.getURLParameterList("all=off"); //do I need to do this to find only art that has opacity set?
    // idiagramSvg.processCommandsInURL(q);
    /* $(".svg-pan-zoom_viewport").find("*").each(function() {
         $(this).css("opacity", "");
     });*/
    var stuffToFade = $(".svg-pan-zoom_viewport").find("*:not([uno-id])").filter(function() {
        //return $(this).css('opacity') == '0';
        var attr = $(this).css('opacity');


        if (attr !== undefined && attr !== false) {
            return true;
        }
        else return false;

    });
    //now fade everything off
    TweenLite.to(stuffToFade, 0, {
        opacity: 0
    });
    //now turn everything on (would be nice to not have to run code when stuff is turned on)
    // q = idiagramSvg.getURLParameterList("all=on");
    // idiagramSvg.processCommandsInURL(q);
    //now fade stuff to a dim opacity

    // $(stuffToFade).fadeIn("slow", function() {
    //$(stuffToFade).css("opacity", "");
    // });

    // $(stuffToFade).css("opacity","");
    TweenLite.to(stuffToFade, 0, {
        opacity: .15
    });
    //now highlight the art children of the id sent into this function
    var maybeAddPound = idiagramSvg.isClass(id) ? "" : "#"; //if this is a class, don't add "#"" to jquery
    var children = $(maybeAddPound + id).find("*:not([uno-id])");

    TweenLite.to(children, .5, {
        opacity: 1
    });

}

//TODO: Fix this up so that it works with the new interface to the run= api
//this must be called sometime after highlighting, else we are left in a state of having opacity styles all over the svg
function noHighlight() {
    $(".svg-pan-zoom_viewport").find("*").each(function() {
        $(this).css("opacity", "");
    });
}

//TODO: Fix this up so that it works with the new interface to the run= api
function rotateStep(time, relative, amount) {

    var q = idiagramSvg.getURLParameterList("+++&rotate=Step0," + time + "," + relative + "," + amount);
    idiagramSvg.processCommandsInURL(q);

}


var myQtipStyle = {
    content: {
        title: true,
        text: "If the text comes from the shortDesc field in the database I will use that."
    },
    position: {
        my: 'bottom center',
        at: 'top left',
        container: $('div.map-pane'),
//        viewport: true,

        //        target: 'mouse',  // mouse tracking still shifts with zoom
        adjust: {
//            mouse: true,  // Can be omitted (e.g. default behaviour) - why doesn't mouse tracking work?
            x: 50,
            y: 0
//            method: 'shift shift'
        }
    },
    show: {
        event: 'mouseenter',
        delay: 0,
        solo: true,
        effect: false
    },
    hide: {
        fixed: true,
        event: 'mouseleave',
        delay: 0,
        inactive: false,
        effect: false
    },
    style: {
        classes: 'qtip-light qtip-rounded qtip-shadow',
        width: 300, // No set width
        height: false, // No set height
        tip: {
            corner: true, // Use position.my by default
            mimic: false, // Don't mimic a particular corner
            width: 8,
            height: 1,
            border: true, // Detect border from tooltip style
            offset: 0 // Do not apply an offset from corner
        }
    }

};