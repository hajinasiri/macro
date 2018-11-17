//
//  09/2017         - The sequence/unsequence functions have been renamed trace & untrace.
//  10/06/2017      - Changed the cascade function to the 'openl'
//  11/2/2017       - Added easeing parameter to scaleOpen

// ------------------------------------------ Changing customFunction Functions ---------------------------------------
// Outcomes: Ability to trigger 'custom' custom functions.
// Goal is to iterate over all UNO's in a map and change DB Value, currently testing code
function changeAValueInAllUnoObjects(key, value) {
    var x;
    //idGroupObject is a global containing a list of all uno objects in memory.
    //They are like class objects -- each associated with an Uno in the svg.
    for (x in idiagramSvg.idGroupObject) {
        idiagramSvg.idGroupObject[x][key] = value;
    }
}

// Goal is to iterate over all the decendent's of an UNO and change DB value
function changeAValueInChildrenUnoObjects(dddGIdObject, key, value) {
    var unoId;
    var ddd = dddGIdObject;

    if (ddd) {
        $(ddd.gIdObject).find(".ddd").each(function() {
            unoId = $(this).attr("id");
            // idGroupObject is a global array of objects that are associated with uno objects in the svg
            if (unoId in idiagramSvg.idGroupObject) {
                idiagramSvg.idGroupObject[unoId][key] = value;
                console.log(idiagramSvg.idGroupObject[unoId]);
            }
        });
    }
}


// changeCustom calls changeAValueInAllUnoObjects. Is currenty working as a slideURL as seen in story3 within nestedDrop4.
// value does not input hScale, vScale or numDraws. To include, simply add ,${hscale},${vscale},${numDraws} within backtics of value variable
function changeCustom(p) {
    var params = p.fullParameterString.split(",");
    var key = params[0]
    var newFn = params[1]
    var unoId = params[2]

    var duration = idiagramSvg.tweenDuration;
    if ( params[3] ) {
        duration = params[3]
    }
    var value = `${newFn}=${unoId},${duration}`;
    var hscale = 1.0;           // the default = 1.0
    var vscale = 1.0;
// optional h and v scale parameters - these are proportion of the distance to the parent-ooo the children should move: 1.0 = all the way.
    if( params[4] && params[5] ){
        hscale = params[4];
        vscale = params[5];
    }

    var numDraws = 0;           // the default = 0 - draw the link once.
    if(params[6]) {
        numDraws = params[6];
    }

    changeAValueInAllUnoObjects(key, value)
}

// calls changeAValueInChildrenUnoObjects. Is currenty working as a slideURL as seen in story3 within nestedDrop4.
// value does not input hScale, vScale or numDraws. To include, simply add ,${hscale},${vscale},${numDraws} within backtics of value variable
function changeCustomChildren(p) {
    var params = p.fullParameterString.split(",");
    var key = params[0]
    var newFn = params[1]
    var unoId = params[2]

    var duration = idiagramSvg.tweenDuration;
    if ( params[3] ) {
        duration = params[3]
    }
    var hscale = 1.0;           // the default = 1.0
    var vscale = 1.0;
// optional h and v scale parameters - these are proportion of the distance to the parent-ooo the children should move: 1.0 = all the way.
    if( params[4] && params[5] ){
        hscale = params[4];
        vscale = params[5];
    }

    var numDraws = 0;           // the default = 0 - draw the link once.
    if(params[6]) {
        numDraws = params[6];
    }

    var dddGIdObject = idiagramSvg.idGroupObject[unoId];
    var value = `${newFn}=${unoId} ${duration}`;

    changeAValueInChildrenUnoObjects(dddGIdObject, key, value);
}






//
// ------------------------------------------ Video functions ----------------------------------------------------------
//
// Used to play & pause videos.  Needed as 'autoplay' in the <video> tag doesn't seem to work (?)
// These functions are needed to control videos from within the animation scripts - and to show and hide them using the visibility style
// playvid=videoID
// resetvid=videoID
// pausevid=videoID
//

function playvid(p) {
    var videoFile = p.fullParameterString;
    // this command always plays the specified video source file in the map.html <video> element id='mapVideo'
    var videoElement = document.getElementById('mapVideo');
    videoElement.src = videoFile;
    videoElement.play();
    videoElement.style.visibility = "visible";
    // videoElement.style.zIndex='1';
    // let centerPane = document.querySelector('.preprocessed');
    // centerPane.style.pointerEvents = "none";
    let sMap = document.querySelector('.svgMap');
    sMap.style.pointerEvents = "none";
    // let navBar = document.querySelector('.clickNav');
    // navBar.style.pointerEvents = "all";
}

function resetvid(p) {
    var videoFile = p.fullParameterString;
    // this command always resets the specified video source file in the map.html <video> element id='mapVideo'
    var videoElement = document.getElementById('mapVideo');
    videoElement.src = videoFile;
    videoElement.pause();
    videoElement.currentTime = 0;
    videoElement.style.visibility = "hidden";
}

function pausevid(p) {
    var videoFile = p.fullParameterString;
    // this command always pauses the specified video source file in the map.html <video> element id='mapVideo'
    var videoElement = document.getElementById('mapVideo');
    videoElement.src = videoFile;
    videoElement.pause();
}

function startWebcam(p) {
    var webcamID = p.fullParameterString;
    var webcamElement = document.getElementById(webcamID);
    webcamElement.style.visibility = "visible";

    // Restart the mediastream webcamID in case it's been stop(ed)();
    if( video.srcObject != null){
        function hasGetUserMedia() {
            return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
        }

        if (hasGetUserMedia()) {
            // Good to go!
        } else {
            alert('getUserMedia() is not supported by your browser');
        }

        // get access
        const constraints = {
            video: true
            // video: true , audio: true
        };

        const video = document.getElementById(webcamID);

        function handleSuccess(stream) {
            video.srcObject = stream;
        }

        function handleError(error) {
            console.error('The webcam ' + webcamID + ' could not be found.', error);
        }

        navigator.mediaDevices.getUserMedia(constraints).
        then(handleSuccess).catch(handleError);
    }

}

function stopWebcam(p) {
    var vidFile = p.fullParameterString;
    var vid = document.getElementById(vidFile);
    vid.style.visibility = "hidden";

    // Stop the mediastream (webcam) if there is one
    if (typeof video !== 'undefined') {
        // video is defined
        if( video.srcObject != null){
            var allTracks = video.srcObject.getTracks();
            for (var i=0; i < allTracks.length; i++){
                allTracks[i].stop();
            }
        }
    }
}

// ------------------------------------------ Slide & Narrations functions ----------------------------------------------------------
//
// Used to select slides etc..
// slide=slideID
// speakTT(unoID) - typically called via the hoverFunction


function slide(p) {
    var slideID = p.fullParameterString;
    var theSlide = document.getElementById(slideID);
    theSlide.click();
}


// A few global variables for speech synthesis - typically modified in setting.html
var synth = this.speechSynthesis;
var speakVoice = 0;
var speakRate = 1.5;
var speakPitch = 1;
var speakTTOn = false;

function getSynth() {
    return synth;
}

function turnOnSpeech() {
    speakTTOn = true;
}

function turnOffSpeech(){
    speakTTOn = false;
    speechSynthesis.cancel();
}

function getspeakTTOn(){
    return speakTTOn;
}

function getVoice(){
    return speakVoice;
}

function setVoice(val){
    speakVoice = val;
}

function setSpeakVariables(voice, rate, pitch) {
    speakVoice = voice;
    speakRate  = rate;
    speakPitch = pitch;
}

function speakText(text2speak){
    // Used by the various speech functions

    if(synth){
        // First stop anything that's already playing - even if we just made tooltipsOn = false
        speechSynthesis.cancel();
        var toSpeak = new SpeechSynthesisUtterance();
        var voices = synth.getVoices();
        toSpeak.voice = voices[speakVoice];
        toSpeak.rate  = speakRate;
        toSpeak.pitch = speakPitch;
        toSpeak.text = text2speak;
        /*
        toSpeak.onend = function(e) {
            console.log('Finished in ' + event.elapsedTime + ' seconds.');
        };
        */
        speechSynthesis.speak(toSpeak);
    }
}

function speakTT(p){
    // checks that speakTTOn is true
    var unoID = p.fullParameterString;
    if(speakTTOn){
        var text2speak =  idiagramSvg.getDatabase(unoID, "label") + ". "+ idiagramSvg.getDatabase(unoID, "shortDescription");
        speakText(text2speak);
    }
    $.address.parameter("speakTT", "");
}

function tt2speech(p){
    // dows NOT check that speakTTOn is true
    var unoID = p.fullParameterString;
//        var text2speak =  idiagramSvg.getDatabase(unoID, "label") + ". "+ idiagramSvg.getDatabase(unoID, "shortDescription");
    var text2speak =  idiagramSvg.getDatabase(unoID, "shortDescription");
    speakText(text2speak);
    $.address.parameter("tt2speech", "");
}

function info2speech(p){
    // dows NOT check that speakTTOn is true
    var unoID = p.fullParameterString;
//        var text2speak =  idiagramSvg.getDatabase(unoID, "label") + ". "+ idiagramSvg.getDatabase(unoID, "longDescription");
    var text2speak =  idiagramSvg.getDatabase(unoID, "longDescription");
    speakText(text2speak);
    $.address.parameter("info2speech", "");
}

function file2speech(p) {
    var filename = p.fullParameterString;

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
//            alert(xhr.responseText);
            speakText(xhr.responseText);
        }
    }
    xhr.open('GET', filename);
    xhr.send();
    $.address.parameter("file2speech", "");
}


//
// ------------------------------------- C U S T O M  O P E N / C L O S E  T R A N S I T I O N S -----------------------------------------------
//
// Custom on/off open/close functions to tween UNOs open/closed
//
// The xxxRestore functions reset the opacity of nodes, and/or redraw the links, for things that have opacity set to 0 and/ore been un-drawn
//


//
// Constructor function for the selectorAndResultArray structure used to parse URL commands
//
function SelectorAndResultArray( params, selector, resultArray, relative, fullParameterString ) {
    this.params = params;
    this.selector = selector;
    this.resultArray = resultArray;
    this.relative = relative;
    this.fullParameterString = fullParameterString;
}

//
// ------------------------------------------ fade on/off & open/close functions ----------------------------------------------------------
//
// Fades the UNO on on/off or open/close.
// fadeOn=unoID,duration
// fadeOff=unoID,duration
// fadeOpen=unoID,duration
// fadeClose=unoID,duration
// fadeOpenOn=unoID,duration        - also turns on any unoTo's and the end of the .connections or .links
// fadeCloseOff=unoID,duration      - also turns off any unoTo's and the end of the .connections or .links
//

function fadeOn(p) {
    var params = p.fullParameterString.split(",");
    var unoID = params[0];
    var duration = idiagramSvg.tweenDuration;
    if( params[1] ){
        duration = params[1];
    }

    // first set the UNO's opacity to 0
    var selector = "#" + unoID;
    TweenLite.set(selector, {
        opacity: 0.0
    });

    baseIdClass.defaultShowHide(unoID);

    // then fade the UNO up
    TweenLite.to(selector, duration, {
        opacity: 1.0
    });
}

function fadeOff(p) {
    var params = p.fullParameterString.split(",");
    var unoID = params[0];
    var duration = idiagramSvg.tweenDuration;
    if( params[1] ){
        duration = params[1];
    }

    // fade the UNO down - then reset the defaultShowHide and opacity
    var selector = "#" + unoID;
    TweenLite.to(selector, duration, {
        opacity: 0.0,
        onCompleteParams:[selector, unoID],
        onComplete: fadeRestore
    });
}

function fadeOpen(p) {
    var params = p.fullParameterString.split(",");
    var unoID = params[0];
    var duration = idiagramSvg.tweenDuration;
    if( params[1] ){
        duration = params[1];
    }

    // first make sure the vvv is faded to 0
    var selector = "#" + "vvv" + unoID;
    TweenLite.set(selector, {
        opacity: 0.0
    });

    // We can't use the default function to turn it on - as that will immediately close the xxx  (instead of fading it closed)
    //baseIdClass.defaultShowHide(unoID);
    // baseIdClass.showVVV(unoID);
    baseIdClass.defaultShow(unoID);

    // And now fade the vvv up and the xxx down
    TweenLite.to(selector, duration, {
        opacity: 1.0
    });

    selector = "#" + "xxx" + unoID;
    TweenLite.to(selector, duration, {
        opacity: 0.0,
        onCompleteParams:[selector, unoID],
        onComplete: fadeRestore
    });
}

function fadeClose(p) {
    var params = p.fullParameterString.split(",");
    var unoID = params[0];
    var duration = idiagramSvg.tweenDuration;
    if( params[1] ){
        duration = params[1];
    }

    // We can assume that the xxx has been faded to 0, as everything starts closed
    // We can't use the default function to turn it on - as that will immediately close the vvv  (instead of fading it closed)
    baseIdClass.showXXX(unoID);

    // And now fade the xxx up and the vvv down
    var selector = "#" + "xxx" + unoID;
    TweenLite.to(selector, duration, {
        opacity: 1.0
    });

    selector = "#" + "vvv" + unoID;
    TweenLite.to(selector, duration, {
        opacity: 0.0,
        onCompleteParams:[selector, unoID],
        onComplete: fadeRestore
    });
}

function fadeRestore(selector, unoID) {
    // reset UNO's opacity to 1.0 - so children can still be shown (because of the non-overridable opacity issue
    TweenLite.set(selector, {
        opacity: 1.0
    });
    // and now that we're finished with our tweening, we can run to default on/off
    baseIdClass.defaultShowHide(unoID);
}



//
// ------------------------------------------ Draw open/close functions ----------------------------------------------------------
// draws-in any links with the class '.connection' or .partof, and fades-in everything else
// for the links to be draw, they must be in an UNO with the class .connection or .partof
// drawOpen=unoID,duration,numDraws,drawKind
// drawClose=unoID,duration
//
// numDraws is the number of times we should draw the links
// drawKind is the name of an optional special drawing tween
//
// Note that to close, we could just use the plain fadeClose function, if we know the xxx-group has no links to draw
// drawSVG's-in any .connection/.partof objects, and fades the other UNO objects on open/close.
// TODO - create 2 versions of these functions: with and without checking to see if the UNO has .connection/.partof elements
// TIMING: the tween timing should be adjusted so that the total tween time = duration
// TODO - add fadeDrawOn/off - which would draw immediate children connection UNOs

function drawOpen(p) {
    var params = p.fullParameterString.split(",");
    var unoID = params[0];
    var duration = idiagramSvg.tweenDuration;
    if( params[1] ){
        duration = params[1];
    }
    var numDraws = 0;           // the default = 0 - draw the link once.
    if(params[2]) {
        numDraws = params[2];
    }
    var drawKind = "default";
    if(params[3]) {
        drawKind = params[3];
    }


    // We can't use the default function to turn it on - as that will immediately close the xxx  (instead of fading it closed)
    // Note that we need to show the vvv at the start of this function - so that the getBBox() functions can see the vvv.
    // using baseIdClass.showVVV(unoID); doesn't work properly here.
    baseIdClass.showVVV(unoID);
    // baseIdClass.defaultShow(unoID);

    // Check to see if this is a connection UNO (rather than an UNO with connection UNOs in it's xxx or vvv, if so draw it differently
    // Always drawing the UNO-sss is causing repeated-drawing with the casecade function - I commented out 09/16/2017 - dont' know if that will cause problems with sequencing
    /*
        var uno = document.getElementById(unoID);
        if( $(uno).hasClass("connection") ){
            fadeDrawSSS(uno, duration);
        }
        else{
    */
    // draw fade the the xxx, vvv as needed
    fadeDrawPart(unoID, "vvv", duration, numDraws, drawKind);
    fadeUndrawPart(unoID, "xxx", duration, numDraws, drawKind);
}

function drawClose(p) {
    var params = p.fullParameterString.split(",");
    var unoID = params[0];
    var duration = idiagramSvg.tweenDuration;
    if( params[1] ){
        duration = params[1];
    }
    var numDraws = 0;           // the default = 0 - draw the link once.
    var drawKind = "default";
    if(params[2]) {
        drawKind = params[2];
    }
    // We can assume that the xxx has been faded to 0, as everything starts closed

    // We can't use the default function to turn it on - as that will immediately close the vvv  (instead of fading it closed)
    // using baseIdClass.defaultHide(unoID); doesn't work properly here.
    baseIdClass.showXXX(unoID);

    // TODO - add fadeUndrawSSS for connection UNOs
    // TODO - add fadeUndrawSSS for connection UNOs

    // draw fade the the xxx, vvv as needed
    fadeDrawPart(unoID, "xxx", duration, numDraws, drawKind);
    fadeUndrawPart(unoID, "vvv", duration);
}

function drawOpenOn(p) {
    var params = p.fullParameterString.split(",");
    var unoID = params[0];
    var duration = idiagramSvg.tweenDuration;
    if( params[1] ){
        duration = params[1];
    }
    var numDraws = 0;           // the default = 0 - draw the link once.
    if(params[2]) {
        numDraws = params[2];
    }
    var drawKind = "default";
    if(params[3]) {
        drawKind = params[3];
    }

    // We can't use the default function to turn it on - as that will immediately close the xxx  (instead of fading it closed)
    // Note that we need to show the vvv at the start of this function - so that the getBBox() functions can see the vvv.
    // using baseIdClass.showVVV(unoID); doesn't work properly here.

    baseIdClass.defaultShow(unoID);

    // Check to see if this is a connection UNO (rather than an UNO with connection UNOs in it's xxx or vvv, if so draw it differently
    // draw fade the the xxx, vvv as needed
    fadeDrawPartOn(unoID, "vvv", duration, numDraws, drawKind);
    fadeUndrawPartOff(unoID, "xxx", duration, drawKind);
}

function drawCloseOff(p) {
    var params = p.fullParameterString.split(",");
    var unoID = params[0];
    var duration = idiagramSvg.tweenDuration;
    if( params[1] ){
        duration = params[1];
    }
    var numDraws = 0;           // the default = 0 - draw the link once.
    var drawKind = "default";
    if(params[2]) {
        drawKind = params[2];
    }

    // We can assume that the xxx has been faded to 0, as everything starts closed

    // We can't use the default function to turn it on - as that will immediately close the vvv  (instead of fading it closed)
    // using baseIdClass.defaultHide(unoID); doesn't work properly here.
    baseIdClass.showXXX(unoID);

    // TODO - add fadeUndrawSSS for connection UNOs

    // draw fade the the xxx, vvv as needed
    fadeDrawPartOn(unoID, "xxx", duration, numDraws, drawKind);
    fadeUndrawPartOff(unoID, "vvv", duration, drawKind);
}

//
// We use the same function: fadeDrawParts - for both opening and closing - just by swapping the vvv/xxx as the open/close parts
//
function fadeDrawPart(unoID, openPart, duration, nDraw, drawKind)
{
    var selector = openPart + unoID;
    var openObj = document.getElementById(selector);

    if( openObj != null ) {
        // We fist test to see if there are indeed any connections/partofs to draw.
        // This is a tad slower - but more robust if the designer assigns this function to an UNO with no connections/partof
        // todo add a loop thought the part.children array to see if there are any .connections/.partof in the UNO
        // if( part.classList.children[i].contains('connection')) {

        // first make sure the open part is faded to 0
        // must do each child element of the UNO individually to avoid the non-overridable opacity issue
        TweenLite.set(openObj.children, {
            opacity: 0.0
        });

        // Do the link drawing/un-drawing
        drawLinks(selector, duration, 0, nDraw, drawKind);

        // fade-on the other non-link elements - and descendants that might be on.
        // Delaying for a bit - giving the links some time to draw-in
        TweenLite.to(openObj.children, duration/4, {
            opacity: 1.0,
            delay: duration*0.75
        });
    }
}

function fadeUndrawPart(unoID, closePart, duration)
{
    var selector = closePart + unoID;
    var closeObj = document.getElementById(selector);

    if( closeObj != null ) {
        // We fist test to see if there are indeed any links to draw.
        // This is a tad slower - but more robust if the designer assigns this function to an UNO with no links
        // todo add a loop thought the part.children array to see if there are any links in the UNO
        // if( part.classList.children[i].contains('connection')) {

        // for the duration of tweening we need both the vvv and xxx to be visible, so here we force the closed bit be visible
        // this is needed here to fix the case where URL command turns on/off something that already on/off - and thus part of the UNO is hidden
        $(closeObj).removeClass("hide");
        $(closeObj).addClass("lm-show");

        undrawLinks(selector, duration, 0, 0);

        // fade-down the closing part - then restore the opacity
        TweenLite.to(closeObj.children, duration, {
            opacity: 0.0,
            onCompleteParams:[closeObj.children, unoID],
            onComplete: fadeRestore
        });
    }
}

function fadeDrawPartOn(unoID, openPart, duration, nDraw, drawKind)
{
    var selector = openPart + unoID;
    var openObj = document.getElementById(selector);

    if( openObj != null ) {
        // We fist test to see if there are indeed any connections/partofs to draw.
        // This is a tad slower - but more robust if the designer assigns this function to an UNO with no connections/partof
        // todo add a loop thought the part.children array to see if there are any .connections/.partof in the UNO
        // if( part.classList.children[i].contains('connection')) {

        // first make sure the open part is faded to 0
        // must do each child element of the UNO individually to avoid the non-overridable opacity issue
        TweenLite.set(openObj.children, {
            opacity: 0.0
        });

        // Do the link drawing/un-drawing
        drawLinks(selector, duration, 0, nDraw, drawKind);

        // fade-on the other non-link elements - and descendants that might be on.
        // Delaying for a bit - giving the links some time to draw-in
        TweenLite.to(openObj.children, duration/4, {
            opacity: 1.0,
            delay: duration*0.75
        });

        // Fade-on any To UNO's
        for(var i=0; i < openObj.children.length; i++ ){
            var unoTo = idiagramSvg.getDatabase(openObj.children[i].id, "unoTo");

            if( unoTo != "") {
                // first set the UNO's opacity to 0
                var selector = "#" + unoTo;
                TweenLite.set(selector, {
                    opacity: 0.0
                });
                idiagramSvg.idGroupObject[unoTo].defaultSetThisToOn();
                // Delaying for a bit - giving the links some time to draw-in
                TweenLite.to(selector, duration/4, {
                    opacity: 1.0,
                    delay: duration*0.75
                });
            }
        }
    }
}

function fadeUndrawPartOff(unoID, closePart, duration)
{
    var selector = closePart + unoID;
    var closeObj = document.getElementById(selector);

    if( closeObj != null ) {
        // We fist test to see if there are indeed any links to draw.
        // This is a tad slower - but more robust if the designer assigns this function to an UNO with no links
        // todo add a loop thought the part.children array to see if there are any links in the UNO
        // if( part.classList.children[i].contains('connection')) {

        // for the duration of tweening we need both the vvv and xxx to be visible, so here we force the closed bit be visible
        // this is needed here to fix the case where URL command turns on/off something that already on/off - and thus part of the UNO is hidden
        $(closeObj).removeClass("hide");
        $(closeObj).addClass("lm-show");

        // for off-things we assume nDraw is always 0
        undrawLinks(selector, duration, 0, 0);

        // fade-down the closing part - then restore the opacity
        TweenLite.to(closeObj.children, duration, {
            opacity: 0.0,
            onCompleteParams:[closeObj.children, unoID],
            onComplete: fadeRestore
        });

        // Fade-off any To UNO's
        for(var i=0; i < closeObj.children.length; i++ ){
            var unoTo = idiagramSvg.getDatabase(closeObj.children[i].id, "unoTo");

            if( unoTo != "") {
                idiagramSvg.idGroupObject[unoTo].defaultSetThisToOff();
            }
        }
    }
}


function drawLinks( part, drawDuration, delay, nDraw, drawKind ){
    var sp = 50; // line percentage to show (1-99)
    var tl = new TimelineMax();
    var overlapDuration = sp/100 * drawDuration; // allocate the proper percentage of the duration to the overlap
    var mainDuration = drawDuration - overlapDuration; // remainder of duration for main animation
    var drawTurn = "0% " + sp + "%";

    // We need to handle (parent) link UNOs non-link (parent) UNOs
    var thePart = document.getElementById(part);
    if( $(thePart.parentNode).hasClass('connection') || $(thePart.parentNode).hasClass('partof')) {
        // Becuase the parent is a link UNO, we will draw all lines and paths, and fade-up the circle and rect elements

        // Make all the elements visible
        TweenLite.set(thePart.children, {
            opacity: 1.0
        });

        // we've about to do the draw, so decrement nDraw
        nDraw -= 1;

        switch (drawKind) {
            case "default":
                // draw the .connection .partof line and path elements - the line & path selectors are needed to pick up the type of svg <g>'s to draw
                selector = "#" + part + " line, #" + part + " path, #" + part + " line, #" + part + " path";
                TweenLite.fromTo( selector, drawDuration,
                    {drawSVG:"0%"},
                    {   drawSVG:"100%",
                        delay: delay,
                        onCompleteParams:[part, drawDuration, delay, nDraw, drawKind ],
                        onComplete: doNextUndraw } );

                // Fade up the non-line elements - e.g. the polygon arrowheads, and or highlighting circles/rects - after the lines/paths are 7/8 drawn-in
                selector = "#" + part + " polygon, #" + part + " circle, #" + part + " rect";
                TweenLite.fromTo(selector, drawDuration/8,
                    { opacity: 0.0 },
                    { opacity: 1.0,
                        delay: delay + (drawDuration * 0.875)} );
                break;
            case "segment20":
                sp = 20; // line percentage to show (1-99)
                overlapDuration = sp/100 * drawDuration; // allocate the proper percentage of the duration to the overlap
                mainDuration = drawDuration - overlapDuration; // remainder of duration for main animation
                drawTurn = "0% " + sp + "%";

                // draw the .connection .partof line and path elements - the line & path selectors are needed to pick up the type of svg <g>'s to draw
                selector = "#" + part + " line, #" + part + " path, #" + part + " line, #" + part + " path";
                TweenLite.defaultEase = Linear.easeNone; // needed for seamless loops
                TweenMax.set(selector, {drawSVG:0}); // start lines at 0
                tl.repeat(nDraw);
                tl.to(selector, overlapDuration, {drawSVG:drawTurn });
                tl.to(selector, mainDuration,    {drawSVG:100-sp + "%" + " 100%" });
                tl.to(selector, overlapDuration, {drawSVG:"100% 100%"});
                break;
            case "segment80":
                sp = 80; // line percentage to show (1-99)
                overlapDuration = sp/100 * drawDuration; // allocate the proper percentage of the duration to the overlap
                mainDuration = drawDuration - overlapDuration; // remainder of duration for main animation
                drawTurn = "0% " + sp + "%";

                // draw the .connection .partof line and path elements - the line & path selectors are needed to pick up the type of svg <g>'s to draw
                selector = "#" + part + " line, #" + part + " path, #" + part + " line, #" + part + " path";
                TweenLite.defaultEase = Linear.easeNone; // needed for seamless loops
                TweenMax.set(selector, {drawSVG:0}); // start lines at 0
                tl.repeat(nDraw);
                tl.to(selector, overlapDuration, {drawSVG:drawTurn });
                tl.to(selector, mainDuration,    {drawSVG:100-sp + "%" + " 100%" });
                tl.to(selector, overlapDuration, {drawSVG:"100% 100%"});
                break;
        }
    }
    else {
        // Because the parent is a NOT link UNO, we will draw ONLY the all lines and paths that have a .connection or .partof class

        // Make the .connection .partof elements visible
        var selector = "#" + part + " .connection, #" + part + " .partof";
        TweenLite.set(selector, {
            opacity: 1.0
        });

        // we've about to do the draw, so decrement nDraw
        nDraw -= 1;

        // draw the .connection .partof line and path elements - the line & path selectors are needed to pick up the type of svg <g>'s to draw
        selector = "#" + part + " .connection line, #" + part + " .connection path, #" + part + " .partof line, #" + part + " .partof path";
        TweenLite.fromTo( selector, drawDuration,
            {drawSVG:"0%"},
            {   drawSVG:"100%",
                delay: delay,
                onCompleteParams:[part, drawDuration, delay, nDraw, drawKind ],
                onComplete: doNextUndraw } );

        // Fade up .connection polygon elements - i.e. the arrowheads - after the lines/paths are 7/8 drawn-in
        selector = "#" + part + " .connection polygon, #" + part + " .partof polygon";
        TweenLite.fromTo(selector, drawDuration/8,
            { opacity: 0.0 },
            { opacity: 1.0,
                delay: delay + (drawDuration * 0.875)} );
    }
}

function undrawLinks( part, drawDuration, delay, nDraw, drawKind ) {
    // We need to handle (parent) link UNOs non-link (parent) UNOs
    var thePart = document.getElementById(part);
    if( $(thePart.parentNode).hasClass('connection') || $(thePart.parentNode).hasClass('partof')) {
        // the parent is a link uno - so draw everything
        var selector = "#" + part + " polygon" + ", #" + part + " polygon";
        TweenLite.set(selector,
            { opacity: 0.0 }
        );

        // we're about to undraw, so decrement nDraw
        nDraw -= 1;

        selector = "#" + part + " line, #" + part + " path" + ", #" + part + " line, #" + part + " path";
        TweenLite.fromTo( selector , drawDuration,
            {drawSVG:"100%"},
            {drawSVG:"0%",
                delay: delay,
                onCompleteParams:[part, drawDuration, delay, 0, drawKind ],
                onComplete: doNextDraw } );
    }
    else {
        var selector = "#" + part + " .connection polygon" + ", #" + part + " .partof polygon";
        TweenLite.set(selector,
            { opacity: 0.0 }
        );

        // we're about to undraw, so decrement nDraw
        nDraw -= 1;

        selector = "#" + part + " .connection line, #" + part + " .connection path" + ", #" + part + " .partof line, #" + part + " .partof path";
        TweenLite.fromTo( selector , drawDuration,
            {drawSVG:"100%"},
            {drawSVG:"0%",
                delay: delay,
                onCompleteParams:[part, drawDuration, delay, 0, drawKind ],
                onComplete: doNextDraw } );
    }
}

function eraseLinks( part, drawDuration, delay, nDraw, drawKind ){
    var selector = "#" + part + " .connection polygon" + ", #" + part + " .partof polygon";
    TweenLite.set(selector,
        { opacity: 0.0 }
    );

    // we're about to undraw, so decrement nDraw
    nDraw -= 1;

    // TODO implement better tail-chasing ?  Can you run multiple simultaneous tweens on the same object?  Or whould you tween a line-gap?

    // Erase faster than drawing - we keep the delay so we can see the full line for a bit
    var eraseSpeed = 2.0;

    selector = "#" + part + " .connection line, #" + part + " .connection path" + ", #" + part + " .partof line, #" + part + " .partof path";
    TweenLite.fromTo( selector , drawDuration / eraseSpeed,
        {drawSVG:"0% 100%"}, {drawSVG:"100% 100%",
            delay: delay ,
            onCompleteParams:[part, drawDuration, delay, nDraw, drawKind ],
            onComplete: doNextDraw } );

    // Fade down .connection polygon elements - i.e. the arrowheads - after the lines/paths are 7/8 drawn-in
    selector = "#" + part + " .connection polygon, #" + part + " .partof polygon";
    TweenLite.fromTo(selector, drawDuration/8,
        { opacity: 1.0 },
        { opacity: 0.0,
            delay: delay + ((drawDuration * 0.875) / eraseSpeed)}
    );
}

// drawRestore ensures that the links have their opacity set back to 1.0, and links redrawn, so an on=thisUNO function will still work properly
function drawRestore( part ) {
    // Reset the drawing and fading of the closeParts
    var selector = "#" + part + " .connection polygon" + ", #" + part + " .partof polygon";
    TweenLite.set(selector,
        { opacity: 1.0 }
    );
    selector = "#" + part + " .connection line, #" + part + " .connection path" + ", #" + part + " .partof line, #" + part + " .partof path";
    TweenLite.set( selector,
        {drawSVG:"100%"}
    );
}

function doNextDraw( part, drawDuration, delay, nDraw, drawKind ) {
    // Reset the drawing and fading of the closeParts
    /*
        var selector = "#" + part + " .connection polygon" + ", #" + part + " .partof polygon";
        TweenLite.set(selector,
            { opacity: 1.0 }
        );
        selector = "#" + part + " .connection line, #" + part + " .connection path" + ", #" + part + " .partof line, #" + part + " .partof path";
        TweenLite.set( selector,
            {drawSVG:"100%"}
        );
    */

    if(nDraw >= 0) {
        drawLinks( part, drawDuration, delay, nDraw, drawKind )
    }
}

function doNextUndraw(part, drawDuration, delay, nDraw, drawKind ) {
    if(nDraw >= 0) {
        eraseLinks( part, drawDuration, delay, nDraw, drawKind );
    }
}



//
// ------------------------------------------ Scale open/close functions ----------------------------------------------------------
//
// Scales and fades UNO objects on open/close - using the center of the UNO's ooo as the transformOrigin
// scaleOpen=unoID,duration,hscale,vscale,toParent,numDraws,easeKind
// scaleClose=unoID,duration,hscale,vscale,toParent,easeKind
// unoID        The UNO to open/close
// duration     The total tween time
// toParent     Optional – boolean, default = 0.  If 0, the scale origin is the children's ooo, if 1 the scale origin is the unoID's ooo,
// numDraws     Optional – how many times to draw / un-draw the links. And even number will leave the link drawn, and odd number will leave the link un-drawn.
// hscale       Optional (if present there must be an hscale value) - the horizontal scale starting value: 0.0 to 1.0 (default 0.2)
// vscale       Optional - the vertical scale starting value: 0.0 to 1.0 (default 0.2)
// easeKind     Optional – The easing effect to use
//
// NOTE that this will likely blowup if the ooo's center point is not within the vvv's bounding box
// Eases:   opening:    ease: Elastic.easeOut.config(1, 0.4)
//          closing:    ease: Power2.easeOut,
// TODO - update these functions based on the lessons from drawOpen/close - still some bugs in the implemenation - objects getting lost to getbbox
// TODO add the numdraws functionality

function scaleOpen(p) {
    var params = p.fullParameterString.split(",");
    var unoID = params[0];
    var duration = idiagramSvg.tweenDuration;
    if( params[1] ){
        duration = params[1];
    }
    // Specify the default starting/ending scale for the tweens
    var hscale = 0.2;
    var vscale = 0.2;
    // optional h and v parameters
    if (params[2] && params[3]) {
        hscale = params[2];
        vscale = params[3];
    }

    var toParent = 0;
    var numDraws = 0;           // the default = 0 - draw the link once.
    if(params[4]) {
        toParent = params[4];
    }

    if(params[5]) {
        numDraws = params[5];
    }

    var easeKind = "default";  // The defult ease kind.
    if (params[6]) {
        easeKind = params[6];
    }

    // We can't use the default function to turn it on - as that will immediately close the xxx  (instead of fading it closed)
    // Note that we need to show the vvv at the start of this function - so that the getBBox() functions can see the vvv.
    baseIdClass.defaultShow(unoID);

    // scale and fade the the xxx, vvv as needed
    fadeScaleParts(unoID, "vvv", "xxx",  duration, toParent, hscale, vscale, numDraws, easeKind);
}

function scaleClose(p) {
    var params = p.fullParameterString.split(",");
    var unoID = params[0];
    var duration = idiagramSvg.tweenDuration;
    if( params[1] ){
        duration = params[1];
    }

    var hscale = 0.2;
    var vscale = 0.2;
    // optional h and v parameters
    if (params[2] && params[3]) {
        hscale = params[2];
        vscale = params[3];
    }

    var toParent = 0;
    if(params[4]) {
        toParent = params[4];
    }

    var easeKind = "default";  // The defult ease kind.
    if (params[5]) {
        easeKind = params[5];
    }

    // Find the center to grow/rotate around - the center of the ooo should be the center of the UNO
    // Since the vvv may be off-axis from the parent ooo, we need to adjust the origin %
    baseIdClass.showXXX(unoID);

    // scale and fade the the xxx, vvv as needed
    fadeScaleParts(unoID, "xxx", "vvv",  duration, toParent, hscale, vscale, 0, easeKind);
}

function fadeScaleParts(unoID, openPart, closePart, duration, toParent, hscale, vscale, nDraws, easeKind) {
    var i;
    var scaleBox;
    var scaleThing;
    var svgOrigin;

    // get the DOM objects for the parts and their bbox's
    var selector = "ooo" + unoID;
    var ooo = document.getElementById(selector);
    if (typeof ooo.getBBox  === "function") {
        // safe to use the function
        var oooBox = ooo.getBBox();
    }
    else {
//        alert("Could not find valid ooo-group in " + unoID);
        return;
    }
    var openSelector = openPart + unoID;
    var openThing = document.getElementById(openSelector);
    if (typeof openThing.getBBox  === "function") {
        var openBox = openThing.getBBox();
    }
    else {
//        alert("Could not find valid " + openPart + "-group in " + unoID);
//        return;
    }
    var closeSelector = closePart + unoID;
    var closeThing = document.getElementById(closeSelector);
    if (typeof closeThing.getBBox  === "function") {
        var closeBox = closeThing.getBBox();
    }
    else {
//        alert("Could not find valid " + closePart + "-group in " + unoID);
//        return;
    }
    // for the duration of tweening we need both the vvv and xxx to be visible, so here we force the closed bit be visible
    // this is needed here to fix the case where URL command turns on/off something that already on/off - and thus part of the UNO is hidden
    // Todo are these needed?
    // $(xxx).removeClass("hide");
    // $(xxx).addClass("lm-show");


    // We fist test to see if there are indeed any connections to draw.
    // This is a tad slower - but more robust if the designer assigns this function to an UNO with no connections
    // todo add a loop thought the part.children array to see if there are any .connections in the UNO
    // if( part.classList.children[i].contains('connection')) {
    // for the duration of tweening we need both the vvv and xxx to be visible, so here we force the closed bit be visible
    // this is needed here to fix the case where URL command turns on/off something that already on/off - and thus part of the UNO is hidden
    $(closeThing).removeClass("hide");
    $(closeThing).addClass("lm-show");

    // Do the connection drawing/undrawing - drawDuration can be used to delay the link drawing - so the nodes move first, then the links follow them, or visa-versa.
    var drawDuration = duration * 0.75;
    drawLinks(openSelector, drawDuration, duration * 0.25, nDraws, "default");
    // undrawLinks() does not restore the links, so moveRestore needs to do that.
    undrawLinks(closeSelector, duration, 0, 0);

    // scale and fade-in the non-link children of the open part
    for (i = 0; i < openThing.children.length; i++) {
        if (!( $(openThing.children[i]).hasClass('connection') || $(openThing.children[i]).hasClass('partof'))) {
            // Set the center point for the scaling
            if (toParent == 1) {
                svgOrigin = (oooBox.x + (oooBox.width / 2)) + " " + (oooBox.y + (oooBox.height / 2));
            }
            else {
                // See if the UNO has an ooo group
                selector = "ooo" + openThing.children[i].id;
                if (scaleThing = document.getElementById(selector)) {
                }
                else {
                    scaleThing = openThing.children[i];
                }
                scaleBox = scaleThing.getBBox();
                svgOrigin = (scaleBox.x + (scaleBox.width / 2)) + " " + (scaleBox.y + (scaleBox.height / 2));
            }

            // first make sure the vvv is scaled down and faded to 0
            TweenLite.set(openThing.children[i], {
                opacity: 0.0,
                svgOrigin: svgOrigin,
                scaleX: hscale,
                scaleY: vscale
            });

            // And now fade 'n scale the vvv up from the ooo center point,
            // draw the contents of the vvv
            // Setup the easing - you can name and setup different scale effects here
            switch (easeKind){
                case "default":
                    TweenLite.to(openThing.children[i], duration, {
                        ease: Power1.easeOut,
                        opacity: 1.0,
                        svgOrigin: svgOrigin,
                        scaleX: 1.0,
                        scaleY: 1.0
                    });
                    break;
                case "Elastic1":
                    TweenLite.to(openThing.children[i], duration, {
                        ease: Elastic.easeOut.config(1.2, 0.9),
                        opacity: 1.0,
                        svgOrigin: svgOrigin,
                        scaleX: 1.0,
                        scaleY: 1.0
                    });
                    break;
            }
        }
    }

    // Scale and fade off each non-link child of the close parts - restoring the position and opacity when the tween finishes
    for (i = 0; i < closeThing.children.length; i++) {
        if (!( $(closeThing.children[i]).hasClass('connection') || $(closeThing.children[i]).hasClass('partof'))) {

            // Set the center point for the scaling
            if (toParent == 1) {
                svgOrigin = (oooBox.x + (oooBox.width / 2)) + " " + (oooBox.y + (oooBox.height / 2));
            }
            else {
                // See if the UNO has an ooo group
                selector = "ooo" + closeThing.children[i].id;
                if (scaleThing = document.getElementById(selector)) {
                }
                else {
                    scaleThing = closeThing.children[i];
                }
                scaleBox = scaleThing.getBBox();
                svgOrigin = (scaleBox.x + (scaleBox.width / 2)) + " " + (scaleBox.y + (scaleBox.height / 2));
            }

            // Now tween the xxx down to the center point - check first to make sure the closeThing isn't empty
            TweenLite.to(closeThing.children[i], duration, {
                opacity: 0.0,
                svgOrigin: svgOrigin,
                scaleX: hscale,
                scaleY: vscale,
                onCompleteParams: [unoID, closeThing.children[i]],
                onComplete: scaleRestore
            });
        }
        else {
            // don't move the link, just fade fade off, then restore it
            TweenLite.to(closeThing.children[i], duration,
                {
                    opacity: 0.0,
                    onCompleteParams:[closeThing.children[i], closeSelector, closeThing],
                    onComplete: moveRestore
                });
        }
    }
}

// DefaultRestore ensures that the UNO's state is properly set, and that the the UNO's parts
// have their opacity set back to 1.0, so an on=thisUNO function will still work properly
function scaleRestore(unoID, closeObj) {
    // Set the children's opacity back to 1.0 to the UNO's on function will still work.
    TweenLite.set( closeObj, {
        scale: 1.0,
        opacity: 1.0
    });

    baseIdClass.defaultShowHide(unoID);
}



//
// ------------------------------------------ moveOpen/Close functions ----------------------------------------------------------
// Moves and fades the children into place, starting at the parent ooo.  Draws-in lines with the class 'connection'
// moveOpen=unoID,duration,hscale,vscale,numDraws
// moveClose=unoID,duration,hscale,vscale
// moveOpenOn=unoID,duration,hscale,vscale,numDraws         - will also turn on any unoTo's at the end of connections
// moveOpenOpen=unoID,duration,hscale,vscale                DO NOT USE - will also open on any unoTo's at the end of connections - causing a cascade - SHOULD PROBABLY NEVER BE USED!
// numDraws - (optional) how many times to draw / un-draw the links. And even number will leave the link drawn, and odd number will leave the link un-drawn.
// hscale, vscale (optional, both must be present) the horizontal and vertical proportion of the distance to the parent-ooo the children should move: 1.0 = all the way.
//
//


function moveOpen(p) {
    var params = p.fullParameterString.split(",");
    var unoID = params[0];
    var duration = idiagramSvg.tweenDuration;
    if( params[1] ){
        duration = params[1];
    }

    var hscale = 1.0;           // the default = 1.0
    var vscale = 1.0;
    // optional h and v scale parameters - these are proportion of the distance to the parent-ooo the children should move: 1.0 = all the way.
    if( params[2] && params[3] ){
        hscale = params[2];
        vscale = params[3];
    }

    var numDraws = 0;           // the default = 0 - draw the link once.
    if(params[4]) {
        numDraws = params[4];
    }

    var on = 0;     // 0 = do nothing with unoTO, 1 = on unoTo, 2 = open unoTo
    var off = 0;    // 0 = do nothing with unoTO, 1 = on unoTo, 2 = open unoTo

    // We can't use the default function to turn it on - as that will immediately close the xxx  (instead of fading it closed)
    // Note that we need to show the vvv at the start of this function - so that the getBBox() functions can see the vvv.
    // using baseIdClass.showVVV(unoID); doesn't work properly here.

    baseIdClass.defaultShow(unoID);

    // this opens closes the xxx/vvv or vvv/xxx as needed
    fadeMoveParts(unoID, "vvv", "xxx", duration, hscale, vscale, on, off, numDraws);
}

function moveOpenOn(p) {
    var params = p.fullParameterString.split(",");
    var unoID = params[0];
    var duration = idiagramSvg.tweenDuration;
    if( params[1] ){
        duration = params[1];
    }

    var hscale = 1.0;           // the default = 1.0
    var vscale = 1.0;
    // optional h and v scale parameters - these are proportion of the distance to the parent-ooo the children should move: 1.0 = all the way.
    if( params[2] && params[3] ){
        hscale = params[2];
        vscale = params[3];
    }

    var numDraws = 0;           // the default = 0 - draw the link once.
    if(params[4]) {
        numDraws = params[4];
    }
    var on = 1;     // 0 = do nothing with unoTO, 1 = on unoTo, 2 = open unoTo
    var off = 0;    // 0 = do nothing with unoTO, 1 = on unoTo, 2 = open unoTo

    // We can't use the default function to turn it on - as that will immediately close the xxx  (instead of fading it closed)
    // Note that we need to show the vvv at the start of this function - so that the getBBox() functions can see the vvv.
    // using baseIdClass.showVVV(unoID); doesn't work properly here.
    baseIdClass.defaultShow(unoID);

    // this opens closes the xxx/vvv or vvv/xxx as needed
    fadeMoveParts(unoID, "vvv", "xxx", duration, hscale, vscale, on, off, numDraws);
}


function moveOpenOpen(p) {
    var params = p.fullParameterString.split(",");
    var unoID = params[0];
    var duration = idiagramSvg.tweenDuration;
    if( params[1] ){
        duration = params[1];
    }
    var hscale = 1.0;           // the default = 1.0
    var vscale = 1.0;
    // optional h and v scale parameters - these are proportion of the distance to the parent-ooo the children should move: 1.0 = all the way.
    if( params[2] && params[3] ){
        hscale = params[2];
        vscale = params[3];
    }

    var numDraws = 0;           // the default = 0 - draw the link once.
    if(params[4]) {
        numDraws = params[4];
    }
    var on = 2;     // 0 = do nothing with unoTO, 1 = on unoTo, 2 = open unoTo
    var off = 0;    // 0 = do nothing with unoTO, 1 = on unoTo, 2 = open unoTo

    // We can't use the default function to turn it on - as that will immediately close the xxx  (instead of fading it closed)
    // Note that we need to show the vvv at the start of this function - so that the getBBox() functions can see the vvv.
    // using baseIdClass.showVVV(unoID); doesn't work properly here.
    baseIdClass.defaultShow(unoID);

    // this opens closes the xxx/vvv or vvv/xxx as needed
    fadeMoveParts(unoID, "vvv", "xxx", duration, hscale, vscale, on, off, numDraws);
}

function moveClose(p) {
    var params = p.fullParameterString.split(",");
    var unoID = params[0];
    var duration = idiagramSvg.tweenDuration;
    if( params[1] ){
        duration = params[1];
    }
    var hscale = 1.0;
    var vscale = 1.0;
    // optional h and v parameters - these are proportion of the distance to the parent-ooo the children should move: 1.0 = all the way.
    if( params[2] && params[3] ){
        hscale = params[2];
        vscale = params[3];
    }
    var on = 0;     // 0 = do nothing with unoTO, 1 = on unoTo, 2 = open unoTo
    var off = 0;    // 0 = do nothing with unoTO, 1 = on unoTo, 2 = open unoTo

    // We can assume that the xxx has been faded to 0, as everything starts closed
    // We can't use the default function to turn it on - as that will immediately close the vvv  (instead of fading it closed)
    // using baseIdClass.defaultHide(unoID); doesn't work properly here.
    baseIdClass.showXXX(unoID);

    // this opens closes the xxx/vvv or vvv/xxx as needed
    fadeMoveParts(unoID, "xxx", "vvv", duration, hscale, vscale, on, off);
}

//
// We use the same function: fadeMoveParts - for both opening and closing - just by swapping the vvv/xxx as the open/close parts
// The on boolean controls whether we turn toUno's on
//
function fadeMoveParts(unoID, openPart, closePart, duration, hscale, vscale, on, off, nDraws)
{
    // get the DOM objects for the parts and their bbox's
    var selector = "ooo" + unoID;
    var ooo = document.getElementById(selector);
    if (typeof ooo.getBBox  === "function") {
        // safe to use the function
        var oooBox = ooo.getBBox();
    }
    else {
//        alert("Could not find valid ooo-group in " + unoID);
        return;
    }
    var openSelector = openPart + unoID;
    var openThing = document.getElementById(openSelector);
    if (typeof openThing.getBBox  === "function") {
        var openBox = openThing.getBBox();
    }
    else {
//        alert("Could not find valid " + openPart + "-group in " + unoID);
        return;
    }
    var closeSelector = closePart + unoID;
    var closeThing = document.getElementById(closeSelector);
    if (typeof closeThing.getBBox  === "function") {
        var closeBox = closeThing.getBBox();
    }
    else {
//        alert("Could not find valid " + closePart + "-group in " + unoID);
        return;
    }

    // We fist test to see if there are indeed any connections to draw.
    // This is a tad slower - but more robust if the designer assigns this function to an UNO with no connections
    // todo add a loop thought the part.children array to see if there are any .connections in the UNO
    // if( part.classList.children[i].contains('connection')) {
    // for the duration of tweening we need both the vvv and xxx to be visible, so here we force the closed bit be visible
    // this is needed here to fix the case where URL command turns on/off something that already on/off - and thus part of the UNO is hidden
    $(closeThing).removeClass("hide");
    $(closeThing).addClass("lm-show");

    // Do the connection drawing/undrawing - drawDuration can be used to delay the link drawing - so the nodes move first, then the links follow them, or visa-versa.
    var drawDuration = duration * 0.75;
    drawLinks(openSelector, drawDuration, duration * 0.25, nDraws, "default");
    // undrawLinks() does not restore the links, so moveRestore needs to do that.
    undrawLinks(closeSelector, duration, 0, 0);

    // Calculate where the center of the ooo is relative to the open & close things
    // Absolute center point of the parent UNO's ooo
    var oooCX = oooBox.x + (oooBox.width / 2);
    var oooCY = oooBox.y + (oooBox.height / 2);
    var i;
    var deltaX;
    var deltaY;
    var moveBox;
    var moveOOO;

    // move and fade-in the non-link children of the open part
    for (i = 0; i < openThing.children.length; i++) {

        // move to oooUNO and fade off each child of the open parts - restoring the position and opacity when the tween finishes
        if ( !( $(openThing.children[i]).hasClass('connection') || $(openThing.children[i]).hasClass('partof'))) {
            // See if it's an UNO (it has and ID) - AND has an ooo group - then use that ooo, otherwise, use the object's full bounding box
            if(openThing.children[i].id != ""){
                selector = "ooo" + openThing.children[i].id;
                if( moveOOO = openThing.children[i] ){
                    moveBox = moveOOO.getBBox();
                }
                else{
                    moveBox = openThing.children[i].getBBox();
                }
            }
            else{
                moveBox = openThing.children[i].getBBox();
            }

            deltaX = (oooCX - (moveBox.x + (moveBox.width  / 2))) * hscale;
            deltaY = (oooCY - (moveBox.y + (moveBox.height / 2))) * vscale;
            TweenLite.fromTo(openThing.children[i], duration,
                {x: deltaX, y: deltaY, opacity: 0.0},
                {x: 0, y: 0, opacity: 1.0} );
        }
    }

    // move to oooUNO and fade off each child of the close parts - restoring the position and opacity when the tween finishes
    for (i = 0; i < closeThing.children.length; i++) {
        // check to make sure we don't move any link UNOs
        if ( !( $(closeThing.children[i]).hasClass('connection') || $(closeThing.children[i]).hasClass('partof'))) {
            // See if it's an UNO (it has and ID) - AND has an ooo group - then use that ooo, otherwise, use the object's full bounding box
            if(closeThing.children[i].id != ""){
                selector = "ooo" + closeThing.children[i].id;
                if( moveOOO = closeThing.children[i] ){
                    moveBox = moveOOO.getBBox();
                }
                else{
                    moveBox = closeThing.children[i].getBBox();
                }
            }
            else{
                moveBox = closeThing.children[i].getBBox();
            }

            deltaX = (oooCX - (moveBox.x + (moveBox.width / 2))) * hscale;
            deltaY = (oooCY - (moveBox.y + (moveBox.height / 2))) * vscale;
            TweenLite.to(closeThing.children[i], duration,
                {
                    x: deltaX, y: deltaY, opacity: 0.0,
                    onCompleteParams:[closeThing.children[i], closeSelector, closeThing],
                    onComplete: moveRestore
                });
        }
        else {
            // don't move the link, just fade fade off, then restore it
            TweenLite.to(closeThing.children[i], duration,
                {
                    opacity: 0.0,
                    onCompleteParams:[closeThing.children[i], closeSelector, closeThing],
                    onComplete: moveRestore
                });
        }
    }


    if(on > 0) {
        // Fade-on any To UNO's - if they're not already on
        for (i = 0; i < openThing.children.length; i++) {
            var unoTo = idiagramSvg.getDatabase(openThing.children[i].id, "unoTo");

            if (unoTo != "") {
                if (on == 1) {
                    if (!idiagramSvg.idGroupObject[unoTo].isOn()) {
                        // first set the UNO's opacity to 0
                        var selector = "#" + unoTo;
                        TweenLite.set(selector, {
                            opacity: 0.0
                        });
                        idiagramSvg.idGroupObject[unoTo].defaultSetThisToOn();
                        // Delaying for a bit - giving the links some time to draw-in
                        TweenLite.to(selector, duration / 4, {
                            opacity: 1.0,
                            delay: duration * 0.75
                        });
                    }
                }
                else if (on == 2) {
                    if (!idiagramSvg.idGroupObject[unoTo].isOpen()) {
                        // first set the UNO's opacity to 0
                        var selector = "#" + unoTo;
                        TweenLite.set(selector, {
                            opacity: 0.0
                        });
                        idiagramSvg.idGroupObject[unoTo].setThisToOpen();
                        // Delaying for a bit - giving the links some time to draw-in
                        TweenLite.to(selector, duration / 4, {
                            opacity: 1.0,
                            delay: duration * 0.75
                        });
                    }
                }
            }
        }
    }

    if (off > 0) {
        // Turn off or close any To UNO's
        for (var i = 0; i < closeThing.children.length; i++) {
            var unoTo = idiagramSvg.getDatabase(closeThing.children[i].id, "unoTo");

            if (unoTo != "") {
                if(off==1){ idiagramSvg.idGroupObject[unoTo].defaultSetThisToOff(); }
                if(off==2){ idiagramSvg.idGroupObject[unoTo].setThisToClose(); }
                idiagramSvg.idGroupObject[unoTo].defaultSetThisToOff();
            }
        }
    }
}



function moveRestore(uno, part, closeObj){
    // Restore the position and opacity
    TweenLite.set(uno, {x: 0, y: 0, opacity: 1.0});
    // Redraw the links
    drawRestore( part );
    // TODO Restoring the classes gets done when each child tween finishes i.e. many more time than necessary.
    $(closeObj).removeClass("lm-show");
    $(closeObj).addClass("hide");
    // Check to make sure this isn't an sss group - that has no id
    if(uno.id != "") {
        baseIdClass.defaultShowHide(uno.id);
    }
}

//
// ------------------------------------- H I E R A R C H Y  &  S E Q U E N C E   T W E E N S -----------------------------------------------
//
// This set of functions provides control of UNOs that are related by the UNO hierarchy or by .connection classed links i.e. (causal) traces of connected UNOs.
//

//
// ------------------------------------------ openl & closel functions ----------------------------------------------------------
//
// The openl tween works it's way down the descendant chain, opening each level with the DB-specified custom tween function
// the levels parameter gives the number of levels to openl - a value of 1 would be be a 'normal' single-level non-cascading open function.
// onl=unoID,levels,levelDelay,vvvDelay
// openl=unoID,levels,levelDelay,vvvDelay
// closel=unoID,vvvDelay
//
// levels = the number of levels to open
// levelDelay = the delay, in seconds, between the levels
// vvvDealy = the dealing, in seconds, between the individual child UNOs within a level
//

function onl(p) {
    var action = "on";
    doAction(p, action);
}

function openl(p) {
    var action = "open";
    doAction(p, action);
}

function doAction(p, action) {
    var params = p.fullParameterString.split(",");

    // TODO error handling for missing parameters
    var unoID = params[0];
    var levels = params[1];
    var levelDelay = 0;
    var vvvDelay= 0;
    if(params[2]) { levelDelay = params[2]; }
    if(params[3]) { vvvDelay = params[3]; }

    // We use the standard open function - which will in turn use the custom open function, if there is one.
    // setTimeout( function(){ baseIdClass.open(unoID); }, delay );
    switch (action){
        case "on":
            baseIdClass.on(unoID);
            break;
        case "open":
            baseIdClass.open(unoID);
            break;
    }

    // Decrement the levels as we've just done one
    levels -= 1;

    // Go through the UNOs and their vvv-children, with delays
    selector = "vvv" + unoID;
    var vvv = document.getElementById(selector);
    if(vvv !== null) {
        setTimeout( function() { doVVV(vvv, levels, levelDelay, vvvDelay, action); }, levelDelay * 1000 );
    }

    //remove all these commands from url
    // or not   $.address.parameter("openl", "");
}

// doNext ensures that the UNO's state is properly set, and that the the UNO's parts
// have their opacity set back to 1.0 so an on=thisUNO function will still work properly
// AND it does the next level of the openl.

function doVVV(vvv, levels, levelDelay, vvvDelay, action) {
    var i = 0;

    while ( i < vvv.children.length ) {
        if ($(vvv.children[i]).hasClass('uno')) {
            switch (action){
                case "on":
                    baseIdClass.on(vvv.children[i].id);
                    break;
                case "open":
                    baseIdClass.open(vvv.children[i].id);
                    break;
            }

            setTimeout( function() {doNextChild(vvv, levels, levelDelay, vvvDelay, i, action)}, vvvDelay * 1000);
            return;
        }
        else { i++ }
    }
}

function doNextChild(vvv, levels, levelDelay, vvvDelay, i, action) {
    i++;
    while ( i < vvv.children.length ) {
        if ($(vvv.children[i]).hasClass('uno')) {
            switch (action) {
                case "on":
                    baseIdClass.on(vvv.children[i].id);
                    break;
                case "open":
                    baseIdClass.open(vvv.children[i].id);
                    break;
            }

            setTimeout( function() {doNextChild(vvv, levels, levelDelay, vvvDelay, i, action)}, vvvDelay * 1000);
            return;
        }
        else { i++ }
    }

    // If we get to here we've run through all the children and should then go to the next level
    doNextLevel(vvv, levels, levelDelay, vvvDelay, action);
}

function doNextLevel( vvv, levels, levelDelay, vvvDelay, action ) {
    var i;

    // now do the next level of children - using recursively the openl function
    if(levels > 0) {
        for (i = 0; i < vvv.children.length; i++) {
            if ($(vvv.children[i]).hasClass('uno')) {
                var fullParameterString = String(vvv.children[i].id) + "," + String(levels) + "," + String(levelDelay) + "," + vvvDelay;
                var params = new SelectorAndResultArray("", "", "", "", fullParameterString);
                doAction(params, action);
                // delay between children - doesn't work....
                // setTimeout( function() {openl(params);}, 0 * delay );
            }
        }
    }
}

function closel(p) {
    var params = p.fullParameterString.split(",");
    var unoID = params[0];

    // TODO implement this propoerly - working BACKWARD through the child hierarchy to the parent - instead of the closeall equivalent that we do now

    // We use the standard open function - which will in turn use the custom open function, if there is one.
    baseIdClass.close(unoID);

    // Now set all the children to close - this function was designed to work off the ooo-group when clicked
    // We have to close the children so they're in the proper closed state to be opened up again by a cascade on.
    unoID = "ooo"+unoID;
    baseIdClass.parentCloseAllChildren(unoID);
    //remove all these commands from url
    // or not    $.address.parameter("cascadeClose", "");
}


//
// ------------------------------------------ trace open/close functions ----------------------------------------------------------
//
// The trace tween works it's way across the child chain, looking for UNOs linked by .connection classed links,
// and UNOs that have entries for unoFrom and unoTo
// levels variable gives the number of connections to trace - the global keepGoing is used to stop all traces.
// traceWhat specifies what links to trace: if '1' then trace only one link - the 'first' one, bottom most in the stacking order.
//           If 'classname' then trance only links that have that clasee
// trace=unoID,duration,levels,panzoomTrace,traceWhat
// untrace=unoID,duration
//
// panzoomTrace is an optional control for how the trace should run:
//      0	no pan or zoom (default).
//      1 	goto=unoID		        before line is drawn
//      2	goto=unoID  	        after line is drawn
//      3	gotoz=unoID  	        before line is drawn
//      4	gotoz=unoID  	        after line is drawn
//      5	pan=unoID,traceTime  	before line is drawn
//      6	pan=unoID,traceTime  	after line is drawn
//

var keepGoing = false;
var panzoomTrace = 0;

function stoptrace() {
    keepGoing = false;
}

function trace(p) {
    var params = p.fullParameterString.split(",");
    var unoID = params[0];
    var duration = params[1];
    var levels = params[2];
    var panzoomTrace = 0;  // the defualt
    var traceWhat = 0;     // the default 0 = trace all links. Needs to passed through the functions as it loops back to this function
    var traceOneLink = 0;  // the default 0 = trace all links.
    var traceLink = "connection";

    // check for the optional global panzoom value - used in doStep()
    if(params[3]) {
        panzoomTrace = Number(params[3]);
    }
    if(params[4]) {
        traceWhat = params[4];
        if(traceWhat == '1') {
            traceOneLink = true;
        }
        else if (traceWhat != '0'){
            traceLink = "connection" + " " + traceWhat;
        }

    }

    keepGoing = true;

    //remove all these commands from url
    $.address.parameter("trace", "");

    // mimic a click-on – for UNOs that might be closed - for URL commands, or in the case where this function is called from the onComplete function
    // Force the uno on, if it's not already on, before proceeding
    if( ! idiagramSvg.idGroupObject[unoID].isOn()) {
        idiagramSvg.idGroupObject[unoID].defaultSetThisToOn(); }

    // As this function gets iterated, check to see if we've run through all the levels
    if( levels == 0) { return; }

    var uno = document.getElementById(unoID);

    // If the UNO is highlighted, all the steps should get highlighted as well
    var isHlt = $(uno).hasClass("highlighted");

    if ( ! $(uno).hasClass("connection") ) {     // the trace command was run on a thing uno
        // find all .connection class unos that are immediate children of the unoID or it's xxx or vvv
        // turn them on even if there in a closed xxx or vvv group
        var child;
        for(child=0; child < uno.childElementCount; child++ ) {
            if(keepGoing != true) return;
            if ($(uno.children[child]).hasClass(traceLink)) {
                doStep(uno.children[child], duration, levels, isHlt, traceWhat );
                if(traceOneLink){ break; }
            }
        }
        uno = document.getElementById( "xxx" + unoID );
        for(child=0; child < uno.childElementCount; child++ ) {
            if(keepGoing != true) return;
            if ($(uno.children[child]).hasClass(traceLink)) {
                doStep(uno.children[child], duration, levels, isHlt, traceWhat );
                if(traceOneLink){ break; }
            }
        }
        uno = document.getElementById( "vvv" + unoID );
        for(child=0; child < uno.childElementCount; child++ ) {
            if(keepGoing != true) return;
            if ($(uno.children[child]).hasClass(traceLink)) {
                doStep(uno.children[child], duration, levels, isHlt, traceWhat );
                if(traceOneLink){ break; }
            }
        }
    }
    else {                                      // it's a connection uno
        doStep ( uno, duration, levels, isHlt, traceWhat );
    }
}

function doStep(uno, duration, levels, isHlt, traceWhat) {
    var toDuration = duration * 0.4;
    var delay = duration - toDuration;
    var selector;

    // note that uno must be a connection uno
    // Force the uno on, if it's not already on, before opening
    idiagramSvg.idGroupObject[uno.id].defaultSetThisToOn();

    // But also draw the sss, in case it's a simple connection UNO with only an sss
    fadeDrawSSS(uno, duration);

    // Fade-on the To uno, and then do the next step (this is essentially the fadeOn function) - if it's not already on.
    var unoTo = idiagramSvg.getDatabase(uno.id, "unoTo");

    if (unoTo != "") {
        selector = "#" + unoTo;
        if( ! idiagramSvg.idGroupObject[unoTo].isOn()) {
            // first set the UNO's opacity to 0
            TweenLite.set(selector, {
                opacity: 0.0
            });

            // turn on, then open and draw the connection uno
            idiagramSvg.idGroupObject[unoTo].defaultSetThisToOn();

            // If the previous UNO - the from UNO - was highlighted, highlight this one too
            if (isHlt) {
                var thisHlt = $(selector).hasClass("highlighted");
                if (!thisHlt) {
                    var command = "+++&togglehlt=" + unoTo;
                    var q = idiagramSvg.getURLParameterList(command);
                    idiagramSvg.processCommandsInURL(q);
                }
            }
            // then fade the UNO up - in the last x% of the tween
            levels -= 1;
            TweenLite.to(selector, toDuration, {
                opacity: 1.0,
                delay: delay,
                onCompleteParams: [unoTo, duration, levels, traceWhat],
                onComplete: doNextTrace
            });
        }
        else{
            // the UNO is already on - so I'm just using the tween here as a timing/delay function for the next trace
            levels -= 1;
            TweenLite.to(selector, toDuration, {
                opacity: 1.0,
                delay: delay,
                onCompleteParams: [unoTo, duration, levels, traceWhat],
                onComplete: doNextTrace
            });
        }

        // do the before panzoom'ings ------------------------------------------
        switch (panzoomTrace) {
            case 1:
                // Parameters of the command: runPanZoomCommands(zoom, panx, pany, doPanning, doZoom, gotoId, panzoomDuration)
                idiagramSvg.runPanZoomCommands(undefined, undefined, undefined, false, true, unoTo, idiagramSvg.tweenDuration);
                break;
            case 3:
                idiagramSvg.runPanZoomCommands(undefined, undefined, undefined, false, false, unoTo, idiagramSvg.tweenDuration);
                break;
            case 5:
                idiagramSvg.runPanZoomCommands(undefined, undefined, undefined, false, true, unoTo, duration);
                break;
        }
    }
}

function doNextTrace(unoID, duration, levels, traceWhat) {
    // do the after panzoom'ings ------------------------------------------
    switch (panzoomTrace) {
        case 2:
            // Parameters of the command: runPanZoomCommands(zoom, panx, pany, doPanning, doZoom, gotoId, panzoomDuration)
            idiagramSvg.runPanZoomCommands(undefined, undefined, undefined, false, true, unoID, idiagramSvg.tweenDuration);
            break;
        case 4:
            idiagramSvg.runPanZoomCommands(undefined, undefined, undefined, false, false, unoID, idiagramSvg.tweenDuration);
            break;
    }

    var fullParameterString = unoID + "," + String(duration) + "," + String(levels) + "," + panzoomTrace + "," + traceWhat;
    var params = new SelectorAndResultArray("", "", "", "", fullParameterString);
    if(keepGoing != true) return;
    trace(params);
}

function fadeDrawSSS(uno, duration)
{
    if( uno != null ) {
        // We fist test to see if there are indeed any connections to draw.
        // This is a tad slower - but more robust if the designer assigns this function to an UNO with no connections
        // todo add a loop thought the part.children array to see if there are any .connections in the UNO
        // if( part.classList.children[i].contains('connection')) {

        // draw the .connection line and path elements - the line & path selectors are needed to pick up the type of svg <g>'s to draw
        var selector = "#" + uno.id + " .sss line, #" + uno.id + " .sss path";
        TweenLite.fromTo( selector, duration,
            {drawSVG:"0%"},
            {drawSVG:"100%"}
        );

        // Fade up .connection polygon elements - i.e. the arrowheads - after the lines/paths are 7/8 drawn-in
        selector = "#" + uno.id + " .sss polygon";
        TweenLite.fromTo(selector, duration/8,
            { opacity: 0.0 },
            { opacity: 1.0,
                delay: duration * 0.875 }
        );
    }
}

// TODO - implement the panzoom functionality for untrace - needed??

function untrace(p) {
    var params = p.fullParameterString.split(",");
    var unoID = params[0];
    var duration = params[1];
    var levels = params[2];

    // As this function gets iterated, check to see if we've run through all the levels
    if( levels == 0) { return; }

    // mimic a click-on – for UNOs that might be closed - for URL commands, or in the case where this function is called from the onComplete function
    // baseIdClass.openOnly(unoID);

    var uno = document.getElementById(unoID);

    if ( ! $(uno).hasClass("connection") ) {     // the trace command was run on a thing uno
        // find all .connection class unos that are immediate children of the unoID or it's xxx or vvv
        // turn them on even if there in a closed xxx or vvv group
        var child;
        for(child=0; child < uno.childElementCount - 1; child++ ) {
            if ($(uno.children[child]).hasClass("connection")) {
                undoStep(uno.children[child], duration, levels);
            }
        }
        uno = document.getElementById( "xxx" + unoID );
        for(child=0; child < uno.childElementCount - 1; child++ ) {
            if ($(uno.children[child]).hasClass("connection")) {
                undoStep(uno.children[child], duration, levels);
            }
        }
        uno = document.getElementById( "vvv" + unoID );
        for(child=0; child < uno.childElementCount - 1; child++ ) {
            if ($(uno.children[child]).hasClass("connection")) {
                undoStep(uno.children[child], duration, levels);
            }
        }
    }
    else {                                      // it's a connection uno
        undoStep ( uno, duration, levels );
    }
    //remove all these commands from url
    $.address.parameter("untrace", "");
}

function undoStep(uno, duration, levels) {

    // note that uno must be a connection uno
    // But also draw the sss, in case it's a simple connection UNO with only an sss
    fadeUndrawSSS(uno, duration);

    // Fade-off the From uno - if there is one - and that we have to find, and then do the next step
    var fromID = idiagramSvg.getDatabase(uno.id, "unoFrom");
    var unoFrom = document.getElementById( fromID );
    if( unoFrom  != null ) {
        // then fade the thing From UNO down - in the last x% of the tween
        var selector = "#" +  fromID;
        var toDuration = duration * 0.20;
        var delay = duration - toDuration;
        levels -= 1;
        // If it's the last, thing leave it on - do not fade-off and close the last thing UNO in the trace
        if(levels > 0) {
            TweenLite.to(selector, toDuration, {
                opacity: 0.0,
                delay: delay,
                onCompleteParams: [fromID, duration, levels],
                onComplete: doNextUntrace
            });
        }
    }
}

function doNextUntrace(unoFrom, duration, levels) {

    // Restore the opacity
    var selector = "#" +  unoFrom;
    TweenLite.set(selector, { opacity: 1.0 });

    // turn the from uno off
    idiagramSvg.idGroupObject[unoFrom].defaultSetThisToOff();

    // Find all the connections uno coming into the from UNO - this could be SLOW!
    var mapPane = document.getElementById("map-pane");
    var allConnections = mapPane.getElementsByClassName("uno connection");
    for(var i = 0; i < allConnections.length; i++){
        var unoTo = idiagramSvg.getDatabase(allConnections[i].id, "unoTo");
        if( unoTo === unoFrom) {
            // We have a match!
            var fullParameterString = allConnections[i].id + "," + String(duration) + "," + String(levels);
            var params = new SelectorAndResultArray("", "", "", "", fullParameterString);
            untrace(params);
        }
    }
}


function fadeUndrawSSS(uno, duration)
{
    if( uno != null ) {
        // We fist test to see if there are indeed any connections to draw.
        // This is a tad slower - but more robust if the designer assigns this function to an UNO with no connections
        // todo add a loop thought the part.children array to see if there are any .connections in the UNO
        // if( part.classList.children[i].contains('connection')) {

        // undraw the .connection line and path elements - the line & path selectors are needed to pick up the type of svg <g>'s to draw
        var selector = "#" + uno.id + " .sss line, #" + uno.id + " .sss path";
        TweenLite.fromTo( selector, duration,
            {drawSVG:"100%"},
            {drawSVG:"0%",
                onCompleteParams: [uno.id],
                onComplete: restoreUndraw
            }
        );

        // Fade down .connection polygon elements - i.e. the arrowheads - after the lines/paths are 7/8 drawn-in
        selector = "#" + uno.id + " .sss polygon";
        TweenLite.fromTo(selector, duration/15,
            { opacity: 1.0 },
            { opacity: 0.0 }
        );
    }
}

function restoreUndraw(unoID){
    // redraw the connections, then turn the connection uno off
    var selector = "#" + unoID + " .sss line, #" + unoID + " .sss path";
    TweenLite.set( selector,
        {  drawSVG:"100%" }
    );
    idiagramSvg.idGroupObject[unoID].defaultSetThisToOff();
}



//
// ------------------------------------------  staggerOn/Open/Off/Close functions ----------------------------------------------------------
//
// stagger=functionKind1,uno1,delay1,functionKind2,uno2,delay2 ...
// staggerKind=functionKind,uno1,delay1,uno2,delay2 ...
//
// The following functions take a parent UNO as the parameter and then stagger the children.  The stagger iteration starts with things lower in the SVG stacking order.
// The stagger tween turns the children object on/open/off/close in a delayed stagger
// The optional start, end parameters (must give both) specifies where in the trace of children to start/end.
// staggerOn=unoID,delay,start,end  - start,end are optional
// staggerOff=unoID,delay,start,end  - start,end are optional
// staggerOpen=unoID,delay,start,end  - start,end are optional
// staggerClose=unoID,delay,start,end  - start,end are optional
// TODO - perhaps a better/different way to handle the start/end of the offPart as well
// TODO - how is stagger obsoleted by onl and openl ?


function stagger(p) {
    var i;
    var params = p.fullParameterString.split(",");

    // parameters come in sets of 3: functionKind (on, off, open, or close), unoID, delay
    for (i = 0; i < params.length; i += 3) {
        switch (params[i]) {
            case "on":
                setTimeout(setUnoOn,   1000 * params[i + 2] * i / 3, params[i + 1]);
                break;
            case "off":
                setTimeout(setUnoOff,  1000 * params[i + 2] * i / 3, params[i + 1]);
                break;
            case "open":
                setTimeout(setUnoOpen, 1000 * params[i + 2] * i / 3, params[i + 1]);
                break;
            case "close":
                setTimeout(setUnoClose,1000 * params[i + 2] * i / 3, params[i + 1]);
                break;
        }
    }
    //remove all these commands from url
    $.address.parameter("stagger", "");
}


function staggerKind(p) {
    var i;
    var params = p.fullParameterString.split(",");
    // The first parameter is the functionKind: on, off, open, or close
    var functionKind = params[0];

    // The rest of the parameters come in sets of 2: unoID, delay
    switch (functionKind) {
        case "on":
            for( i=1; i < params.length; i+=2 ) {
                setTimeout( setUnoOn, 1000 * params[i+1] * (i-1)/2, params[i] );
            }
            break;
        case "off":
            for( i=1; i < params.length; i+=2 ) {
                setTimeout( setUnoOff, 1000 * params[i+1] * (i-1)/2, params[i] );
            }
            break;
        case "open":
            for( i=1; i < params.length; i+=2 ) {
                setTimeout( setUnoOpen, 1000 * params[i+1] * (i-1)/2, params[i] );
            }
            break;
        case "close":
            for( i=1; i < params.length; i+=2 ) {
                setTimeout( setUnoClose, 1000 * params[i+1] * (i-1)/2, params[i] );
            }
            break;
    }
    //remove all these commands from url
    $.address.parameter("staggerKind", "");
}

function staggerOn(p) {
    var params = p.fullParameterString.split(",");
    var unoID = params[0];
    var delay = params[1] * 1000;
    if (params[2] && params[3]) {
        var start = params[2];
        var end = params[3];
    }
    else {
        start = 0;
        end = 10000;
    }

    // mimic a click-on – for UNOs that might be closed - for URL commands
    // Force the uno on, if it's not already on, before proceeding
    idiagramSvg.idGroupObject[unoID].setThisToOpenOnly();
    // on/off the parts
    staggerOnParts("vvv" + unoID, "xxx" + unoID, delay, start, end);

    //remove all these commands from url
    $.address.parameter("staggerOn", "");
}

function staggerOff(p) {
    var params = p.fullParameterString.split(",");
    var unoID = params[0];
    var delay = params[1] * 1000;
    if (params[2] && params[3]) {
        var start = params[2];
        var end = params[3];
    }
    else {
        start = 0;
        end = 10000;
    }

    // mimic a click-on – for UNOs that might be closed - for URL commands
    // Force the uno on, if it's not already on, before proceeding
    idiagramSvg.idGroupObject[unoID].setThisToOpenOnly();
    // on/off the parts
    staggerOnParts("xxx" + unoID, "vvv" + unoID, delay, start, end);

    //remove all these commands from url
    $.address.parameter("staggerOff", "");
}

function staggerOnParts( onPart, offPart, delay, start, end) {
    var onThing = document.getElementById(onPart);

    if (start > onThing.childElementCount) {
        start = onThing.childElementCount
    }

    if (end > onThing.childElementCount) {
        end = onThing.childElementCount
    }

    else {
        start = 0;
        end = vvv.childElementCount;
    }

    var i;
    for(i=start; i < end; i++ ) {
        if ($(onThing.children[i]).hasClass("uno")) {
            setTimeout(  setUnoOn, delay * (i-start), onThing.children[i].id);
        }
    }

    var offThing = document.getElementById(offPart);

    for(i=0; i < offThing.childElementCount; i++ ) {
        if ($(offThing.children[i]).hasClass("uno")) {
            setTimeout(  setUnoOff, delay * (i-start), offThing.children[i].id);
        }
    }
}

function setUnoOn(unoID) {
    idiagramSvg.idGroupObject[unoID].setThisToOn();
}

function setUnoOff(unoID) {
    idiagramSvg.idGroupObject[unoID].setThisToOff();
}


function staggerOpen(p) {
    var params = p.fullParameterString.split(",");
    var unoID = params[0];
    var delay = params[1] * 1000;
    if (params[2] && params[3]) {
        var start = params[2];
        var end = params[3];
    }
    else {
        start = 0;
        end = 10000;
    }

    // mimic a click-on – for UNOs that might be closed - for URL commands
    // Force the uno on, if it's not already on, before proceeding
    idiagramSvg.idGroupObject[unoID].setThisToOpenOnly();
    // on/off the parts
    staggerOpenParts("vvv" + unoID, "xxx" + unoID, delay, start, end);

    //remove all these commands from url
    $.address.parameter("staggerOpen", "");
}

function staggerClose(p) {
    var params = p.fullParameterString.split(",");
    var unoID = params[0];
    var delay = params[1] * 1000;
    if (params[2] && params[3]) {
        var start = params[2];
        var end = params[3];
    }
    else {
        start = 0;
        end = 10000;
    }

    // mimic a click-on – for UNOs that might be closed - for URL commands
    // Force the uno on, if it's not already on, before proceeding
    idiagramSvg.idGroupObject[unoID].setThisToOpenOnly();
    // on/off the parts
    staggerOpenParts("xxx" + unoID, "vvv" + unoID, delay, start, end);

    //remove all these commands from url
    $.address.parameter("staggerClose", "");
}

function staggerOpenParts( onPart, offPart, delay, start, end) {
    var onThing = document.getElementById(onPart);

    if (start > onThing.childElementCount) {
        start = onThing.childElementCount
    }

    if (end > onThing.childElementCount) {
        end = onThing.childElementCount
    }

    else {
        start = 0;
        end = vvv.childElementCount;
    }

    var i;
    for(i=start; i < end; i++ ) {
        if ($(onThing.children[i]).hasClass("uno")) {
            setTimeout(  setUnoOpen, delay * (i-start), onThing.children[i].id);
        }
    }

    var offThing = document.getElementById(offPart);

    for(i=0; i < offThing.childElementCount; i++ ) {
        if ($(offThing.children[i]).hasClass("uno")) {
            setTimeout(  setUnolose, delay * (i-start), offThing.children[i].id);
        }
    }
}

function setUnoOpen(unoID) {
    idiagramSvg.idGroupObject[unoID].setThisToOn();
    idiagramSvg.idGroupObject[unoID].setThisToOpen();
}

function setUnoClose(unoID) {
    idiagramSvg.idGroupObject[unoID].setThisToClose();
}
// --------------------------------------------- DATABASE FUNCTIONS --------------------------------------------------------------------------
//
// Various functions that give control over classes
// setDatabase(unoID, field, value)           - the setting version of the getDatabase function in idiagram-svg.js
//

function setDatabase(unoID, field, value) {
    var row = idiagramSvg.database.get(unoID);
    if (row !== undefined && row.id !== undefined && row[field] !== undefined) {
        row[field] = value;
    }
    console.log(row);
}



// --------------------------------------------- C L A S S   C O N T R O L S --------------------------------------------------------------------------
//
// Various functions that give control over classes
// classOn=class            - where class is a single class name without the dot
// classOff=class
// classOpen=class
// classClose=class
//

function classHlt(p) {
    var theClass = "." + p.fullParameterString;
    var theThings = $( document ).find( theClass );

    for(var i=theThings.length - 1; i >= 0; i--){
        var unoID = theThings[i].id;
        idiagramUtil.hlt(unoID);
    }
}

function classOn(p) {
    // Be careful with the selector syntax
    //
    var theClasses = "";
    var classes = p.fullParameterString.split(" ")
    for(var i =0; i < classes.length; i++) {
        theClasses += "." + classes[i];
    }

    var theThings = $(document).find(theClasses);

    for(i =0; i < theThings.length; i++){
        var unoID = theThings[i].id;
        idiagramSvg.idGroupObject[unoID].setThisToOn();
    }
}

function classOff(p) {
    var theClass = "." + p.fullParameterString;
    var theThings = $( document ).find( theClass );

    for(var i =0; i < theThings.length; i++){
        var unoID = theThings[i].id;
        idiagramSvg.idGroupObject[unoID].setThisToOff();
    }
}

function classOpen(p) {
    var theClass = "." + p.fullParameterString;
    var theThings = $( document ).find( theClass );

    for(var i =0; i < theThings.length; i++){
        var unoID = theThings[i].id;
        idiagramSvg.idGroupObject[unoID].setThisToOpen();
    }
}

function classClose(p) {
    var theClass = "." + p.fullParameterString;
    var theThings = $( document ).find( theClass );

    for(var i =0; i < theThings.length; i++){
        var unoID = theThings[i].id;
        idiagramSvg.idGroupObject[unoID].setThisToClose();
    }
}

//
// --------------------------------------------- P O I N T E R S  --------------------------------------------------------------------------
//
// Various functions used to point-out UNOs
//
//  circle=unoID,offset         - draw an ellipse around the UNO
//  flashCircle=unoID,offset    - flash an ellipse around the UNO
//  box=unoID,offset            - draw a rounded rectangle around the UNO
//
// TODO: add the ability to take optional parameters e.g. drawDuration, strokeWidth, strokeColor, fillColor, persistDuration, etc.
//

function circle(p){
    var params = p.fullParameterString.split(",");
    var unoID = params[0];
    var offset = Number(params[1]);
    var drawDuration = 1.2;
    var strokeWidth = 3;
    var strokeColor = "#A00";               //  Will get an opacity of 0.80
    var fillColor = "#FF0";                 //  Will get an opacity of 0.10
    // var fillColor = "transparent";
    var persistDuration = drawDuration * 2;

    //remove all these commands from url
    $.address.parameter("circle", "");

    // Find the size of the UNO - and add the offset
    var uno = document.getElementById(unoID);
    var unoBox = uno.getBBox();
    var w = unoBox.width + (2 * offset);
    var h = unoBox.height + (2 * offset);

    // Initialize the svg.js drawing object -
    // in the svgpanzoom viewport - which will then draw the pointers ON TOP of the map
    // or in the MapSize object - which will then draw the pointers UNDERNEATH of the map
    var svgViewport = $( ".svg-pan-zoom_viewport" );
    var viewportID = svgViewport[0].id;
    var draw = SVG( viewportID );
    // var draw = SVG( "MapSize" );

    // Draw the shape around the UNO, make it invisible to pointer events, set its attributes
    var drawPath = draw.ellipse(w, h);
    drawPath.node.style.pointerEvents = "none";
    drawPath.attr({
        cx: unoBox.x + (unoBox.width / 2),
        cy: unoBox.y + (unoBox.height / 2),
        fill: fillColor,
        'fill-opacity': 0.0,
        stroke: strokeColor,
        'stroke-opacity': 0.8,
        'stroke-width': strokeWidth
    });


    // Now fadein the fill and draw the stroke
    TweenLite.to( drawPath.node, drawDuration, {
            delay: drawDuration / 3,
            attr: {"fill-opacity": 0.10}
        }
    );
    TweenLite.fromTo( drawPath.node, drawDuration,
        {drawSVG:"0%"},
        {drawSVG:"100%"}
    );

    // persist for bit, then fade out and delete itself
    TweenLite.to(drawPath.node, drawDuration, {
        delay: persistDuration,
        opacity: 0.0,
        onCompleteParams:[draw.node],
        onComplete: removeDraw
    });
}

function flashCircle(p){
    var params = p.fullParameterString.split(",");
    var unoID = params[0];
    var offset = Number(params[1]);
    var drawDuration = 1.0;                 // the fade out time - after flashing is finished
    var flashTime = 0.3;
    var repeatNum = 3;
    var strokeWidth = 0;
    var strokeColor = "#000";               //  Will get an opacity of 0.80
    var fillColor = "#FF0";                 //  Will get an opacity of 0.20
    // var fillColor = "transparent";

    //remove all these commands from url
    $.address.parameter("flashCircle", "");

    // Find the size of the UNO - and add the offset
    var uno = document.getElementById(unoID);
    var unoBox = uno.getBBox();
    var w = unoBox.width + (2 * offset);
    var h = unoBox.height + (2 * offset);

    // Initialize the svg.js drawing object -
    // in the svgpanzoom viewport - which will then draw the pointers ON TOP of the map
    // or in the MapSize object - which will then draw the pointers UNDERNEATH of the map
    var svgViewport = $( ".svg-pan-zoom_viewport" );
    var viewportID = svgViewport[0].id;
    // var draw = SVG( viewportID );
    var draw = SVG( "MapSize" );

    // Draw the shape around the UNO, make it invisible to pointer events, set its attributes
    var drawPath = draw.ellipse(w, h);
    drawPath.node.style.pointerEvents = "none";
    drawPath.attr({
        cx: unoBox.x + (unoBox.width / 2),
        cy: unoBox.y + (unoBox.height / 2),
        fill: fillColor,
        'fill-opacity': 0.2,
        stroke: strokeColor,
        'stroke-opacity': 0.8,
        'stroke-width': strokeWidth
    });


    // Now 'flash' the fill by fadeing it in and out
    var tl = new TimelineMax({repeat: repeatNum, repeatDelay:0});
    tl.add( TweenLite.to(drawPath.node, flashTime/2, {opacity: 0.0}) );
    tl.add( TweenLite.to(drawPath.node, flashTime/2, {opacity: 1.0}) );
    tl.play();

    // persist for bit, then fade out and delete itself
    TweenLite.to(drawPath.node, drawDuration, {
        delay: drawDuration + (flashTime * repeatNum),
        opacity: 0.0,
        onCompleteParams:[draw.node],
        onComplete: removeDraw
    });
}


function box(p){
    var params = p.fullParameterString.split(",");
    var unoID = params[0];
    var offset = Number(params[1]);
    var drawDuration = 1.2;
    var strokeWidth = 3;
    var strokeColor = "#A00";               //  Will get an opacity of 0.80
    var fillColor = "#FF0";                 //  Will get an opacity of 0.10
    // var fillColor = "transparent";
    var persistDuration = drawDuration * 2;

    //remove all these commands from url
    $.address.parameter("box", "");

    // Find the size of the UNO - and add the offset
    var uno = document.getElementById(unoID);
    var unoBox = uno.getBBox();
    var w = unoBox.width + (2 * offset);
    var h = unoBox.height + (2 * offset);

    // Initialize the svg.js drawing object -
    // in the svgpanzoom viewport - which will then draw the pointers ON TOP of the map
    // or in the MapSize object - which will then draw the pointers UNDERNEATH of the map
    var svgViewport = $( ".svg-pan-zoom_viewport" );
    var viewportID = svgViewport[0].id;
    var draw = SVG( viewportID );
    // var draw = SVG( "MapSize" );

    // Draw the shape around the UNO, make it invisible to pointer events, set its attributes
    var drawPath = draw.rect(w, h);
    drawPath.radius(20);
    drawPath.node.style.pointerEvents = "none";
    drawPath.attr({
        x: unoBox.x - offset,
        y: unoBox.y - offset,
        fill: fillColor,
        'fill-opacity': 0.0,
        stroke: strokeColor,
        'stroke-opacity': 0.8,
        'stroke-width': strokeWidth
    });


    // Now fadein the fill and draw the stroke
    TweenLite.to( drawPath.node, drawDuration, {
            delay: drawDuration / 3,
            attr: {"fill-opacity": 0.10}
        }
    );
    TweenLite.fromTo( drawPath.node, drawDuration,
        {drawSVG:"0%"},
        {drawSVG:"100%"}
    );

    // persist for bit, then fade out and delete itself
    TweenLite.to(drawPath.node, drawDuration, {
        delay: persistDuration,
        opacity: 0.0,
        onCompleteParams:[draw.node],
        onComplete: removeDraw
    });
}

function removeDraw(thing){
    // Delete the svg.js drawing object
    var parent = thing.parentElement;
    parent.removeChild(thing);
}



//
// ---------------------------------------- Q U A N T I T A T I V E  F U N C T I O N S ------------------------------------------------------------
//
// size=unoID,duration,xSize,ySize,xOrigin,yOrigin  - where xSize and ySize are the scaling values with 1.0 = 100% of original size
// and the optional values of xOrigin,yOrigin set the transformOrigin - which default to 50 50.
// Only the non .label sss groups that are in the uno, xxx, and vvv.
//

function size(p) {
    var params = p.fullParameterString.split(",");
    var unoID = "#" + params[0];
    var duration = params[1];
    var xSize = params[2];
    var ySize = params[3];
    var xOrigin = 50;
    var yOrigin = 50;

    if (params[4] && params[5]) {
        xOrigin = params[4];
        yOrigin = params[5];
    }

    //  var selector = "#sss" + unoID;
    var transOrg =  xOrigin + "% " + yOrigin + "%";

    var selector = $(unoID).children(".sss:not(.label)");

    TweenLite.to(selector, duration, {
        transformOrigin: transOrg,
        scaleX: xSize,
        scaleY: ySize
    });

    var selector = $(unoID).children().children(".sss:not(.label)");

    TweenLite.to(selector, duration, {
        transformOrigin: transOrg,
        scaleX: xSize,
        scaleY: ySize
    });
}


// ------------------------------------------  W E B  L I N K S -------------------------------------------------------
//  To open and external link e.g. via onDoubleClick

function openLink(p) {
    var url = p.fullParameterString;

    window.open(url,'_blank');

    $.address.parameter("openLink", ""); //remove this command from url

}

//
// ---------------------------------------- T O O L T I P S ------------------------------------------------------------
//
//

var myQtipStyle = {
    content: {
        title: true,
        text: "The title should come from the shortDescription field in the database."
    },
    position: {
        my: 'bottom center',
        at: 'center center',
        container: $('div.map-pane'),
        viewport: true,

        //        target: 'mouse',  // mouse tracking still shifts with zoom
        adjust: {
            //            mouse: true,  // Can be omitted (e.g. default behaviour) - why doesn't mouse tracking work?
            // x: (zoomVal * 15) -30,
            x: 0,
            y: -60,
            method: 'shift shift'
        }

    },
    show: {
        event: 'mouseenter',
        delay: 90,
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
        classes: 'qtip-light qtip-rounded qtip-shadow ttTitle',     // formats the title according to .ttTitle from mapWindow.css
        width: 300,         // Set width
        height: false,      // Set height
        tip: {
            corner: true,   // Use position.my by default
            mimic: false,   // Don't mimic a particular corner
            width: 10,
            height: 1,
            border: true,   // Detect border from tooltip style
            offset: 0       // Do not apply an offset from corner
        }
    }
};

var noTitle = {
    content: {
        title: false,
        text: "The title should come from the shortDescription field in the database."
    },
    position: {
        my: 'bottom center',
        at: 'center center',
        container: $('div.map-pane'),
        viewport: true,

        //        target: 'mouse',  // mouse tracking still shifts with zoom
        adjust: {
            //            mouse: true,  // Can be omitted (e.g. default behaviour) - why doesn't mouse tracking work?
            // x: (zoomVal * 15) -30,
            x: 0,
            y: -80,
            method: 'shift shift',
            scroll: false
        }
    },
    show: {
        event: 'mouseenter',
        delay: 90,
        solo: true,
        effect: false
    },
    hide: {
        fixed: true,
        event: 'mouseleave',
        delay: 200,
        inactive: false,
        effect: false
    },
    style: {
        classes: 'qtip-light qtip-rounded qtip-shadow ttTitle',     // formats the title according to .ttTitle from mapWindow.css
        width: 300,       // Set width
        height: false,    // Set height - 'false' means the height will auto-fit to the text - unless overridden by .qtip-content { height:  in jquery.qtip.css.
        tip: {
            corner: true, // Use position.my by default
            mimic: false, // Don't mimic a particular corner
            width: 10,
            height: 1,
            border: true, // Detect border from tooltip style
            offset: 0 // Do not apply an offset from corner
        }
    }
};