
function rotateStep(time,relative,amount) {
 
  var q = idiagramSvg.getURLParameterList("+++&rotate=Step0,"+time+","+relative+","+amount);
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
        adjust: {
            x: 40,
            y: -10
        }
    },
    show: {
        delay: 200,
        solo: true
    },
    hide: {
        event: false,
        delay: 400,
        inactive: false
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