/**
 * present.js This will run a "voiceover" presentation on an svg file in IDiagram Created Feb. 2016, Larry A.
 * Maddocks
 */
/* global $, jQuery,idiagramSvg, processCommandsInURL,  getURLParameterList*/

var presentVer = ".013"; // if press spacebar in form then does not try to handle stopping presentation

var presentFunc = function() {
    // json file which runs presentations
    //var PresentationJson;
    // list of all segment objects in json file.
    var Segments = {};
    var ArrayOfAnimateObjects = []; //list of all objects. Need to call them all in case trigger doesn't work
    //SegmentsMap is a map of key/value pairs -- segment id's /segment objects for 
    //use when designer embeds a segment with in a segment animation presentation.
    var SegmentsMap = {};

    var TimeLineArray = []; //contains a flat list of animate objects that can be used by a "previous/next" command

    // --------------------temporary code from howler example
    // -----------------------------
    /*
     * $(function(){ hljs.initHighlightingOnLoad();
     * 
     * $('#ex1-play').on('click', function(){ sound1.stop().play(); });
     * $('#ex1-pause').on('click', function(){ sound1.pause(); });
     * $('#ex1-stop').on('click', function(){ sound1.stop(); });
     * $('#ex1-loop').on('click', function(){ sound1.loop(true); });
     * 
     * $('#ex2-play').on('click', function(){ sound2.stop().play(); });
     * $('#ex2-pause').on('click', function(){ sound2.pause(); });
     * $('#ex2-fadein').on('click', function(){ sound2.pause().fadeIn(0.5, 2000);
     * }); $('#ex2-fadeout').on('click', function(){ sound2.fadeOut(0, 2000); });
     * 
     * $('#ex3-play1').on('click', function(){ sound3.play('blast'); });
     * $('#ex3-play2').on('click', function(){ sound3.play('laser'); });
     * $('#ex3-play3').on('click', function(){ sound3.play('winner'); }); });
     * 
     * var sound1 = new Howl({ urls: ['/proj/howlerjs/sound.ogg',
     * '/proj/howlerjs/sound.mp3'] }); var sound2 = new Howl({ urls:
     * ['/proj/howlerjs/sound.ogg', '/proj/howlerjs/sound.mp3'], loop: true, volume:
     * 0.5, onend: function() { alert('Finished!'); } }); var sound3 = new Howl({
     * urls: ['/proj/howlerjs/sounds.ogg', '/proj/howlerjs/sounds.mp3'], sprite: {
     * blast: [0, 2000], laser: [3000, 700], winner: [5000, 9000] } });
     */
    // -----------------------------------------------------
    /*
     * this is used to stop all animations. It should be called before calling a new
     * animation, For example, before playing an animation in segmentCommand().
     */

    // iterates through all objects and calls the function in functionName
    function callAllAnimations(functionName, args) {
        var fn, i;
        var len = ArrayOfAnimateObjects.length;
        for (i = 0; i < len; i++) {
            fn = ArrayOfAnimateObjects[i][functionName];
            if (typeof fn === 'function') {
                ArrayOfAnimateObjects[i][functionName](args);
            }
        }
    }

    /**
     * Right now I am using this to send a trigger to all the subclasses of AnimateBaseClass to stop. This could
     * be used for any class that looks to this for events
     * 
     * function TriggerAllClass() { this.type = "TriggerAllClass"; }
     */
    /*
     * If user sends in a command on the url that is stopall or whatever the command
     * ends up being, this will send out a stopAll message to anyone who is
     * listeneing
     * 
     * TriggerAllClass.prototype.stopAll = function() { //
     * $(this).triggerHandler("stopAll"); callAllAnimations("stop");
     *  };
     */

    /**
     * processAnimatePresentate() Called at pre-process time to initialize all objects in the presentation json file.
     * The parent element in a segment must be either an asynchronous or a synchronous type
     */
    function processAnimatePresentate() {
        var segmentObj;
        for (var segment in present.PresentationJson) {
            if (present.PresentationJson.hasOwnProperty(segment)) {
                if (!present.PresentationJson[segment].hasOwnProperty("id")) {
                    present.PresentationJson[segment].id = segment;
                }
                SegmentsMap[present.PresentationJson[segment].id] = present.PresentationJson[segment];
            }
        }
        for (var segment in present.PresentationJson) {
            if (present.PresentationJson.hasOwnProperty(segment)) {
                if (present.PresentationJson[segment].hasOwnProperty("type") && present.PresentationJson[segment].type === "synchronous") {
                    segmentObj = new SynchSegmentClass(present.PresentationJson[segment], null);
                }
                else {
                    segmentObj = new AsynchSegmentClass(present.PresentationJson[segment], null);
                }
                Segments[segmentObj.id] = segmentObj;
            }
        }

    }

    var playSound = (function beep() {
        var snd = new Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");
        return function() {
            snd.play();
        }
    })();

    

    /**
     * This will execute play, pause, or resume on a segment. NOTE: Maybe I should put this as a function in the
     * AsynchSegmentClass, but in the interest of time, it is working, and it's not broke, so I won't fix it.
     * 
     * @param {Object} segmentId
     * @param {Object} command
     */
    function segmentCommand(segmentId, command) {
        var segmentObject = Segments[segmentId];
        if (segmentObject !== undefined) {
            switch (command) {
                case "play":
                    //MyTriggerAllClass.stopAll();
                    // tells this to initialize all objects elements  in this segment
                    segmentObject.initBeforePlaying();
                    segmentObject.playStuff();
                    break;

                    /*   case "stop":
                          
                           segmentObject.stop();
                           break;*/
                case "pause":
                    segmentObject.pauseToggle();
                    break;
                case "resume":
                    segmentObject.resume();
                    break;
                default:
                    // default code block
                    break;
            }
        }
        else {
            console.error("A bad segmentId was sent in: " + segmentId);
            playSound(); // play error beep
        }
    }



    /**
     * This is the base class to handle the animate jason file. It is never instantiated directly.
     * 
     * @param {Object} elementObj -- the object that is getting wrapped by this class The parent of this class, or
     *        null. Segments don't have parents. Later when played they will get some sort of way that will notify
     *        when to start and stop.
     */
    function AnimateBaseClass(elementObj, parentWrapperObj) {

        if (elementObj !== undefined) {
            this.elementObj = elementObj;
            this.parentWrapperObj = null;
            // defult is asynchronous
            this.type = "asynchronous";
            if (elementObj.hasOwnProperty("id")) {
                this.id = elementObj.id;
            }
            if (elementObj.hasOwnProperty("type")) {
                // if this is an object with an id, it is a segment. It could
                // also have a type = synchronous, in which case it plays the stuff
                // in the elements list all at same time.
                this.type = elementObj.type;
            }
            this.listOfElements = []; //list of wrapper object children of this object
            if (this.myAncestorIsSync === undefined) {
                this.myAncestorIsSync = false; //if true then do not create an entry in flattened timeline for this object.

            }
            //each object gets an entry in the timeline. SynchSegmentClass objects and all their descendants are represented
            //only once, even though they may be asynchronous or audioClass, etc. objects. Any time 
            //parentWrapperObj.myAncestorIsSync === false then this object gets inserted into the timeline array
            //Note: I have learned that since AsynchSegmentClass's are not really content, I will not include them in the timeline.
            this.timeLineIndex = 0;
            if ((parentWrapperObj === null || parentWrapperObj.myAncestorIsSync === false) && this.className !== "AsynchSegmentClass") {
                //create an entry in timeLineArray this this object
                this.timeLineIndex = TimeLineArray.length;
                TimeLineArray.push(this);
            }
            else {
                this.timeLineIndex = parentWrapperObj ? parentWrapperObj.timeLineIndex : 0; //defaults to parent's id in timeLineIndex
            }
            // if (parentWrapperObj !== undefined) {
            this.parentWrapperObj = parentWrapperObj;
            //  }
            // delay value is how long to wait before playing stuff. Times by 1000
            // because each second is 1000
            this.delay = elementObj.hasOwnProperty("delay") ? +elementObj.delay * 1000 : null;
            this.delay = elementObj.hasOwnProperty("predelay") ? +elementObj.predelay * 1000 : this.delay;
            //postdelay is how long to wait AFTER playing stuff
            this.postdelay = (elementObj.hasOwnProperty("postdelay")) ? +elementObj.postdelay * 1000 : 1; //we default to 100 miliseconds so the reverse will work.
            // if stopTheTrain == true then stop this animation. We can have a
            // this.isPlaying === false
            // and this.stopTheTrain == true because isPlaying tells us if the audio
            // is paused or not
            this.stopTheTrain = false;
            this.loop = elementObj.hasOwnProperty("loop") ? elementObj.loop : false;

            // isPlaying let's us know to play after user hits spacebar. We don't
            // want every audio to play after user unpauses by toggling play via the
            // space bar. Whether or not this is an audio, lets us know if this is
            // in a playing state, state
            this.isPlaying = false;

            //this gets a list of all setTimeout in an instantiation of this class.

            //this gets a list of all setTimeout in an instantiation of this class, which sometimes
            //needs to be cleared with clearTimeout()initBeforePlaying
            this.arrayOfSetTimeOutEvents = [];

            //haveSentTriggerYet is true after we sent a complete trigger yet for playing this element.
            //This gets reset to false each time we start playing this from beginning. Used for looping so we
            //don't keep triggering complete.
            this.haveSentTriggerYet = false;

            //Let's us know if the pause button is pressed
            this.paused = false;

            //Listens for a stopAll event, then stops stuff.
            /* $(MyTriggerAllClass).on("stopAll", function() {
               this.stop();
             }.bind(this));
             */

            //TODO: Why is this here and not with the other keydown code
            $(document).keydown(function(e) {
                if ($(document.activeElement).is("body")) {
                    if (e.keyCode == '32') {
                        // spacebar
                        this.pauseToggle();
                        return !(e.keyCode == 32); //keep firefox from scrolling pane when user presses space bar.
                    }
                }

            }.bind(this));

            this.initialize();

        }
    }

    AnimateBaseClass.currentIdPlaying = null;
    // Sometimes we don't know the parent wrapper object when instantiating the
    // class, so we inititialize here'
    AnimateBaseClass.prototype.initialize = function() {

        // If we have elements in this, then handle them.
        if (this.elementObj.hasOwnProperty("elements")) {
            var elements = this.elementObj.elements;
            this.elements = this.elementObj.elements;
            var newObject, i;
            for (i = 0; i < elements.length; i++) {
                newObject = null;
                //Need to handle the case where we have an embedded segment. If we have an embedded segment, then
                //just grab the inside object which is really just another element and use it.
                //TODO: We may need to clone another copy of this instead of using the original object multiple times.
                if (elements[i].hasOwnProperty("type")) {
                    //content contains the segment id that we want to flesh out and insert into this jason
                    if (elements[i].type == "segment" && elements[i].hasOwnProperty("content")) {
                        var doTheLoopThing;
                        if (elements[i].hasOwnProperty("loop")) {
                            doTheLoopThing = elements[i].loop;
                        }
                        var segmentObject = SegmentsMap[elements[i].content];
                        if (segmentObject !== undefined) {
                            //make a clone and have elements[i] point to that.  I make a clone because I don't
                            //know if I will be changing anything in that object while it is being used.
                            elements[i] = jQuery.extend({}, segmentObject);
                            if (doTheLoopThing !== undefined) {
                                //if we want to loop this segment, then set the loop here, because it doesn't help
                                //to have it where we have type:"segment" and content:"segment_id"
                                elements[i].loop = doTheLoopThing;
                            }
                        }
                        else {
                            alert("Bad segment id name: " + elements[i].content);
                        }
                    }
                }
                if (!elements[i].hasOwnProperty("type") && elements[i].hasOwnProperty("elements")) {
                    // if this element contains another element, but it does not
                    // have a type, we default the
                    // type to asynchronous
                    elements[i].type = "asynchronous";
                }

                if (elements[i].hasOwnProperty("type")) {
                    switch (elements[i].type) {
                        case "audio":
                            newObject = new AudioClass(elements[i], this);
                            break;
                        case "url":
                            newObject = new UrlClass(elements[i], this);
                            break;
                        case "synchronous":
                            newObject = new SynchSegmentClass(elements[i], this);
                            break;
                        case "asynchronous":
                            newObject = new AsynchSegmentClass(elements[i], this);
                            break;

                            // ***NOTE handle case where an element contains elements.
                        default:
                            // default code block
                            console.log("malformed type: " + elements[i].type);
                            break;
                    }
                }
                if (newObject) {
                    this.listOfElements.push(newObject);
                    newObject.siblingPosition = this.listOfElements.length - 1;
                    ArrayOfAnimateObjects.push(newObject);
                    newObject.ArrayOfAnimateObjectsIndex = ArrayOfAnimateObjects.length - 1;
                }
            }

        }
        $(document).keydown(function(e) {
            //If user presses r command, this will reverse the play head to the previous element.
            //this.playPreviousElement = false;
            if (e.keyCode == '82') {
                // pressed r  meaning forward to the next thing to play.
                if (AnimateBaseClass.currentIdPlaying === this.timeLineIndex) {
                    e.stopImmediatePropagation();
                    callAllAnimations("stop");
                    callAllAnimations("initBeforePlaying");
                    //We want to play the previous element, so get the current element's index value and 
                    //look up the previous index (never less than 0) and play it.
                    var previousPlayHead = 0;
                    switch (AnimateBaseClass.currentIdPlaying) {
                        case 0:
                            // case 1:
                            previousPlayHead = 0;
                            break;

                        default:
                            //found play head was going back to playing url commands and not giving user time to go back further
                            previousPlayHead = AnimateBaseClass.currentIdPlaying - 1;
                            break;
                    }
                    AnimateBaseClass.currentIdPlaying = previousPlayHead;
                    console.log("pressed r. AnimateBaseClass.currentIdPlaying = " + AnimateBaseClass.currentIdPlaying);
                    var previousElementToPlay = TimeLineArray[previousPlayHead];
                    if (previousElementToPlay !== undefined) {
                        previousElementToPlay.playStuff();
                    }
                }
            }
            else if (e.keyCode == '70') {
                // pressed f  meaning forward to the next thing to play.
                if (AnimateBaseClass.currentIdPlaying === this.timeLineIndex) {
                    e.stopImmediatePropagation();
                    callAllAnimations("stop");
                    callAllAnimations("initBeforePlaying");
                    //We want to play the previous element, so get the current element's index value and 
                    //look up the previous index (never less than 0) and play it.
                    var nextPlayHead = 0;
                    if (AnimateBaseClass.currentIdPlaying === (TimeLineArray.length - 1)) {
                        //we don't want to play past the end of the timeline 
                        nextPlayHead = AnimateBaseClass.currentIdPlaying;
                    }
                    else {
                        nextPlayHead = AnimateBaseClass.currentIdPlaying + 1;
                    }

                    AnimateBaseClass.currentIdPlaying = nextPlayHead;
                    console.log("pressed f. AnimateBaseClass.currentIdPlaying = " + AnimateBaseClass.currentIdPlaying);
                    var nextElementToPlay = TimeLineArray[nextPlayHead];
                    if (nextElementToPlay !== undefined) {
                        nextElementToPlay.playStuff();
                    }
                }
            }
        }.bind(this));

    };

    /**
     * called by $(document).keydown(function(e) and segmentCommand() and recursevly
     */
    AnimateBaseClass.prototype.initBeforePlaying = function() {
        this.stopTheTrain = false;
        this.isPlaying = false;
        this.paused = false;
        this.haveSentTriggerYet = false;
        if (this.listOfElements.length) {

            for (var i = 0; i < this.listOfElements.length; i++) {
                this.listOfElements[i].initBeforePlaying();
            }
        }

    };

    AnimateBaseClass.prototype.pauseToggle = function() {
        this.paused = !this.paused; //toggle truthiness
    };

    /**
     * Stop this train or animated presentation
     */
    AnimateBaseClass.prototype.stop = function() {
        this.stopTheTrain = true;
        this.isPlaying = false;
        this.clearAllTimeOuts(); //clear all setTimeout's that were created in this object
    };

    /**
     * clearAllTimeOuts() will clear all setTimeout's that were created in an instantiated object
     * To be used when we stop, or reverse or maybe forward.
     * 
     **/
    AnimateBaseClass.prototype.clearAllTimeOuts = function() {
        for (var i = 0; i < this.arrayOfSetTimeOutEvents.length; i++) {
            clearTimeout(this.arrayOfSetTimeOutEvents[i]);
        }
    };

    /**
     * This is called when AsynchSegmentClass's children are finished playing.
     * This searches out all of these children for any that are looping, and it stops them.
     */
    AnimateBaseClass.prototype.stopLoopingSiblings = function() {
        for (var i = 0; i < this.listOfElements.length; i++) {
            var elementObj = this.listOfElements[i];
            if (elementObj.loop === true && elementObj.type === "audio") {
                elementObj.stop();
            }

        }
    };

    function AsynchSegmentClass(segmentObj, parentWrapperObj) {
        this.myAncestorIsSync = parentWrapperObj ? parentWrapperObj.myAncestorIsSync : false;
        this.className = "AsynchSegmentClass";
        AnimateBaseClass.call(this, segmentObj, parentWrapperObj);
    }

    AsynchSegmentClass.prototype = new AnimateBaseClass();
    AsynchSegmentClass.prototype.constructor = AsynchSegmentClass;

    AsynchSegmentClass.prototype.initialize = function() {
        AnimateBaseClass.prototype.initialize.call(this);
        if (this.elementObj.hasOwnProperty("elements")) {
            var elements = this.elementObj.elements;
            // Now go through and create event listeners/triggers
            //NOTE:  This only goes through this for-loop once when the class is instantiated.  In the future,
            //when this is called, it is event-drived by the "$(elementObj).on("completed"..." lines
            for (var i = 0; i < elements.length; i++) {
                // Create a play next event for when each of these are finished,
                // except for the last one
                // For the last one create a completed event.
                var elementObj = this.listOfElements[i];
                if (i === (elements.length - 1)) {
                    // if we are processing the last item in the list then when it
                    // is done then send out a completed
                    // event trigger
                    $(elementObj).on("completed", function(i, elementObj, event) {
                        //blow the heads off of the looping zombie children of this object
                        this.stopLoopingSiblings();
                        // here is the brains of this whole presents.js -- to know
                        // when something starts and stops
                        if (!this.stopTheTrain) {
                            //if postdelay is set, which means we want to pause at the end of an element before going to next
                            if (this.postdelay) {
                                var s = setTimeout(function() {
                                    if (!this.stopTheTrain) {
                                        if (!this.haveSentTriggerYet) {
                                            $(this).triggerHandler("completed");
                                        }
                                        //if this is a looping element then keep playing
                                        if (this.loop) {
                                            //make sure we don't keep calling completed in case parent is type synchronous, 
                                            //which counts the nuberr of complete events it gets
                                            this.haveSentTriggerYet = true;
                                            this.listOfElements[0].playStuff(); //need to start back at 0
                                        }
                                    }
                                }.bind(this), this.postdelay);
                                this.arrayOfSetTimeOutEvents.push(s); //keep track of all setTimeouts for when we need to clear 'em.
                            }
                            else {
                                $(this).triggerHandler("completed");
                            }

                        }
                    }.bind(this, i, elementObj));

                }
                else {
                    $(elementObj).on("completed", function(i, elementObj, event) {

                        // play the next one
                        if (!this.stopTheTrain) {
                            this.listOfElements[i + 1].playStuff();
                        }
                        else {
                            // if we are supposed to stop, then I will
                            // trigger completed
                            //$(this).triggerHandler("completed");
                        }
                    }.bind(this, i, elementObj));
                }
                // Now listen for a start from myself. If there is one, and this is
                // type synchronous, then
                // go through each element and start it.

            }
        }
    };

    // This will play an animation
    AsynchSegmentClass.prototype.playStuff = function() {

        var that = this;
        var playLogic = function(that) {
            if (that.stopTheTrain == false) {
                console.log("In AsynchSegmentClass.prototype.playStuff");

                //AnimateBaseClass.currentIdPlaying = that.timeLineIndex ? that.timeLineIndex : 0; //keep track of what is currently playing
                //the reason we only do listOfElements[0] is because when that is done & sends a complete event then
                //AnimateBaseClass.prototype.initialize() then calls the next element in listOfElementsp
                that.listOfElements[0].playStuff();
            }
            else {
                //$(that).triggerHandler("completed");
            }
        };
        if (this.delay !== null) {
            var s = setTimeout(function() {
                if (this.stopTheTrain == false) {

                    //AnimateBaseClass.currentIdPlaying = this.timeLineIndex ? this.timeLineIndex : 0; //keep track of what is currently playing
                    playLogic(this);
                }
            }.bind(this), this.delay);
            this.arrayOfSetTimeOutEvents.push(s); //keep track of all setTimeouts for when we need to clear 'em.
        }
        else {
            playLogic(that);
        }
    };
    // This will pause an animation. I think we need this even though it is blank so it won't call the base class stuff.
    AsynchSegmentClass.prototype.pauseToggle = function() {

    };

    function SynchSegmentClass(segmentObj, parentWrapperObj) {
        this.className = "SynchSegmentClass";
        // numberOfElementsCompleted is incremented each time an element is completed.
        // When they are all done then this broadcasts the fact that we are done.
        this.numberOfElementsCompleted = 0;
        this.myAncestorIsSync = true; //don't create a timeline item for this if this object is a descendant of a SynchSegmentClass
        AnimateBaseClass.call(this, segmentObj, parentWrapperObj);

    }

    SynchSegmentClass.prototype = new AnimateBaseClass();
    SynchSegmentClass.prototype.constructor = SynchSegmentClass;
    SynchSegmentClass.prototype.initialize = function() {
        AnimateBaseClass.prototype.initialize.call(this);
        // numberOfElementsCompleted is incremented each time an element is completed.
        // When they are all done then this broadcasts the fact that we are done.
        this.numberOfElementsCompleted = 0;
        if (this.elementObj.hasOwnProperty("elements")) {
            // var elements = this.elementObj.elements;
            // Now go through and create event listeners/triggers
            for (var i = 0; i < this.elements.length; i++) {
                // Create a play next event for when each of these are finished,
                // except for the last one
                // For the last one create a completed event.
                var elementItemFromArray = this.listOfElements[i];

                // if we are processing the last item in the list then when it is
                // done then send out a completed
                // event trigger
                $(elementItemFromArray).on("completed", function(i, elementItemFromArray, event) {
                    this.numberOfElementsCompleted++;
                    // here is the brains of this whole presents.js
                    // -- to know when something starts and stops
                    if (this.numberOfElementsCompleted >= this.elements.length) {
                        //blow the heads off of the looping zombie children of this object
                        this.stopLoopingSiblings();
                        // set this back to zero for the next time
                        // we need this.
                        this.numberOfElementsCompleted = 0;
                        // if we are all done then broadcast that.
                        console.log("SynchSegmentClass completed");
                        if (!this.stopTheTrain) {
                            if (this.postdelay) {
                                var s = setTimeout(function() {
                                    if (!this.stopTheTrain) {
                                        if (!this.haveSentTriggerYet) {
                                            $(this).triggerHandler("completed");
                                        }
                                        //if this is a looping element then keep playing
                                        if (this.loop) {
                                            //make sure we don't keep calling completed in case parent is type synchronous, 
                                            //which counts the nuberr of complete events it gets
                                            this.haveSentTriggerYet = true;
                                            this.playStuff();
                                        }
                                    }
                                }.bind(this), this.postdelay);
                                this.arrayOfSetTimeOutEvents.push(s); //keep track of all setTimeouts for when we need to clear 'em.
                            }
                            else {
                                $(this).triggerHandler("completed");
                            }
                        }
                    }
                }.bind(this, i, elementItemFromArray));

                // Now listen for a start from myself. If there is one, and this is
                // type synchronous, then
                // go through each element and start it.

            }
        }
    };

    SynchSegmentClass.prototype.playStuff = function(initialize) {

        //TODO: move playLogic out of this function to it's own prototype
        var that = this;
        if (initialize !== undefined && initialize === true) {
            this.numberOfElementsCompleted = 0;
        }
        var playLogic = function(that) {
            //this.numberOfElementsCompleted = 0;
            console.log("In SynchSegmentClass.prototype.playStuff");
            // TODO: Maybe this is not synchronous. It plays one thing after
            // the
            // other.
            for (var i = 0; i < that.elements.length; i++) {
                if (that.stopTheTrain === false) {
                    that.listOfElements[i].playStuff();
                }
                else {
                    //$(that).triggerHandler("completed");
                    break;
                }
            }
        };
        if (this.delay !== null) {
            var s = setTimeout(function() {
                if (this.stopTheTrain === false) {
                    playLogic(this);
                }
            }.bind(this), this.delay);
            this.arrayOfSetTimeOutEvents.push(s); //keep track of all setTimeouts for when we need to clear 'em.
        }
        else {
            playLogic(that);
        }
        //}
    };

    //This will stop this
    SynchSegmentClass.prototype.stop = function() {
        AnimateBaseClass.prototype.stop.call(this);

        this.numberOfElementsCompleted = 0;
    };
    SynchSegmentClass.prototype.initBeforePlaying = function() {
        AnimateBaseClass.prototype.initBeforePlaying.call(this);

        this.numberOfElementsCompleted = 0;
    };

    function AudioClass(segmentObj, parentWrapperObj) {
        this.myAncestorIsSync = parentWrapperObj.myAncestorIsSync;
        AnimateBaseClass.call(this, segmentObj, parentWrapperObj);
        this.className = "AudioClass";
        this.audioMissing = false; //is true if the audio file is missing. Let's us know to not play stuff but just call $(this).triggerHandler("completed");
        this.aud = new Audio();
        this.aud.audioClass = this;
        // audioLoaded gets set to true from addEventListener in play. Don't load
        // until ready to.
        this.audioLoaded = false;
        // Checks for error in loading audio file
        this.aud.addEventListener('error', function() {
            console.log('error loading audio');
            this.audioClass.audioMissing = true; //so we know to move on if audio is missing
            this.audioClass.audioLoaded = true; //not really but I don't want to keep trying to load it. This part of being graceful
            $(this.audioClass).triggerHandler("completed"); //we don't really have an audio to play, so just move the animation to the next
        }, false);
        this.aud.addEventListener('ended', function() {

            //if this audio is in a loop. The idea is that if we are looping, then as soon as it starts playing, send a completed
            //event message so nothing is held up while this loops.  Looping stops when all the other siblings are finished.
            if (this.loop && !this.stopTheTrain) {
                if (!isNaN(this.aud.duration)) {
                    this.aud.currentTime = 0;
                    this.aud.play();
                }
                return;
            }
            this.isPlaying = false;
            if (!this.stopTheTrain) {
                if (this.postdelay) {
                    var s = setTimeout(function() {
                        if (!this.stopTheTrain) {
                            $(this).triggerHandler("completed");
                        }
                    }.bind(this), this.postdelay);
                    this.arrayOfSetTimeOutEvents.push(s); //keep track of all setTimeouts for when we need to clear 'em. 
                }
                else {
                    $(this).triggerHandler("completed");
                }
            }
        }.bind(this), false);


    }

    AudioClass.prototype = new AnimateBaseClass();
    AudioClass.prototype.constructor = AudioClass;

    // This will play an animation
    AudioClass.prototype.playStuff = function() {

        var that = this;
        // playLogic actually does the playing
        var playLogic = function(that) {
            console.log("In AudioClass.prototype.playStuff");
            if (that.elementObj.hasOwnProperty("content")) {
                // if audioLoaded == false then set this eventListener and load
                if (that.audioLoaded === false) {
                    that.aud.addEventListener('loadeddata', function() {
                        // audioClass is this AudioClass instance that we are in.
                        this.audioClass.audioLoaded = true;
                        if (this.audioClass.stopTheTrain == false) {
                            AnimateBaseClass.currentIdPlaying = this.audioClass.timeLineIndex ? this.audioClass.timeLineIndex : 0; //put this line BEFORE you play so we know where the playhead is while playing
                            this.play();
                            this.audioClass.isPlaying = true;
                            this.audioClass.loop == true ? $(this.audioClass).triggerHandler("completed") : {}; //if this is a loop, don't hold the show to wait for this to be done.
                        }
                    }, false);
                    that.aud.src = that.elementObj.content;
                }
                else {
                    if (that.stopTheTrain == false) {
                        that.isPlaying = true;
                        AnimateBaseClass.currentIdPlaying = that.timeLineIndex ? that.timeLineIndex : 0; //keep track of what is currently playing
                        if (that.audioMissing === false) {
                            that.aud.play();
                            that.loop == true ? $(that).triggerHandler("completed") : {}; //if this is a loop, don't hold the show to wait for this to be done.
                        }
                        else {
                            $(that).triggerHandler("completed"); //we don't really have an audio to play, so just move the animation to the next
                        }

                    }
                }
            }
            else {
                console.log("Error. audio json missing content element");
            }
        };
        if (this.delay !== null) {
            var s = setTimeout(function() {
                if (this.stopTheTrain == false) {
                    //I had to put additional test because it was still playing after stopall 
                    //command: if (this.stopTheTrain == false)
                    playLogic(this);
                }
            }.bind(this), this.delay);
            this.arrayOfSetTimeOutEvents.push(s); //keep track of all setTimeouts for when we need to clear 'em.
        }
        else {
            playLogic(that);
        }
    };

    // This will stop an animation
    AudioClass.prototype.stop = function() {
        AnimateBaseClass.prototype.stop.call(this);
        if (!isNaN(this.aud.duration)) {
            this.aud.pause();
            this.aud.currentTime = 0;
        }
        this.isPlaying = false;

    };

    // This will pause an animation. 
    AudioClass.prototype.pauseToggle = function() {
        if (this.isPlaying === true) {
            if (this.aud.paused == false) {
                this.aud.pause();
            }
            else {
                if (this.stopTheTrain === false) {
                    this.aud.play();

                }
            }
            //if we have a fake audio file and we are paused and we are not in a stopped state then 
            //trigger completed because we don't really have a real audio file to play.
            //I wasn't going to put this code here because I thought there would not be any time to 
            //click on spacebar before completed was triggered, BUT, if we have a pre/postdelay then we will.
        }
        else if (this.audioMissing === true && this.aud.paused === true && this.stopTheTrain === false) {
            $(this).triggerHandler("completed"); //we don't really have an audio to play, so just move the animation to the next
        }
    };

    AudioClass.prototype.initBeforePlaying = function() {
        AnimateBaseClass.prototype.initBeforePlaying.call(this);
        if (!isNaN(this.aud.duration)) {
            this.aud.pause();
            this.aud.currentTime = 0;
        }
        this.isPlaying = false;

    };

    /**
     * Handles commands in a url
     * 
     * @param {Object} segmentObj
     */
    function UrlClass(segmentObj, parentWrapperObj) {
        this.myAncestorIsSync = parentWrapperObj.myAncestorIsSync;
        AnimateBaseClass.call(this, segmentObj, parentWrapperObj);
        this.className = "UrlClass";
        if (this.elementObj.hasOwnProperty("content")) {
            var s = this.elementObj.content;
            s = s.replace(/\?/g, '');
            this.q = idiagramSvg.getURLParameterList(s);
        }
        else {
            console.log("Error. url json missing content element");
        }

    }

    UrlClass.prototype = new AnimateBaseClass();
    UrlClass.prototype.constructor = UrlClass;
    // This will play an animation
    UrlClass.prototype.playStuff = function() {

        //var that = this;
        var playLogic = function(that) {
            if (that.stopTheTrain == false && !that.paused) {
                console.log("In UrlClass.prototype.playStuff");
                if (that.q !== null) {
                    AnimateBaseClass.currentIdPlaying = that.timeLineIndex ? that.timeLineIndex : 0; //keep track of what is currently playing

                    idiagramSvg.processCommandsInURL(that.q);
                    if (!that.stopTheTrain && !that.paused) {
                        if (that.postdelay) {
                            var s = setTimeout(function() {
                                if (!this.stopTheTrain && !this.paused) {
                                    if (this.loop) {
                                        playLogic(this); //keep looping until head is blown off by stopLoopingSiblings()
                                    }
                                    else {
                                        this.isPlaying = false; //for unpausing to know if we should start playing again
                                        $(this).triggerHandler("completed");
                                    }
                                }
                            }.bind(that), that.postdelay);
                            that.arrayOfSetTimeOutEvents.push(s); //keep track of all setTimeouts for when we need to clear 'em.
                        }
                        else {
                            if (this.loop) {
                                playLogic(this); //I did playLogic instead of playStuff because I was triggering "completed" too many times for the sync class.
                            }
                            else {
                                this.isPlaying = false; //for unpausing to know if we should start playing again
                                $(this).triggerHandler("completed");
                            }
                        }

                    }

                }
            }
        };
        this.isPlaying = true; //for unpausing to know if we should start playing again
        if (this.delay !== null) {
            var s = setTimeout(function() {
                if (this.stopTheTrain == false && !this.paused) {
                    playLogic(this);
                    this.loop == true ? $(this).triggerHandler("completed") : {}; //if this is a loop, don't hold the show to wait for this to be done.
                }
            }.bind(this), this.delay);
            this.arrayOfSetTimeOutEvents.push(s); //keep track of all setTimeouts for when we need to clear 'em.
        }
        else {
            playLogic(this);
            this.loop == true ? $(this).triggerHandler("completed") : {}; //if this is a loop, don't hold the show to wait for this to be done.
        }
    };

    // This will pause an animation. 
    UrlClass.prototype.pauseToggle = function() {
        AnimateBaseClass.prototype.pauseToggle.call(this);
        //if we are now hitting the spacebar to unpause, and this happens to be the thing that was playing when it was paused.
        //BTW, I only start playing again for UrlClass or AudioClass
        if (this.paused === false && this.isPlaying === true) {
            AnimateBaseClass.prototype.initBeforePlaying.call(this);
            this.playStuff();
        }
    };
    var present = {
        PresentationJson: {},
        callAllAnimations: callAllAnimations,
        processAnimatePresentate: processAnimatePresentate,
        segmentCommand: segmentCommand
    };
    return present;
};
module.exports = presentFunc();
