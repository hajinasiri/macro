var svgOriginButton = document.getElementById("svgOrigin"),
    transformOriginButton = document.getElementById("transformOrigin"),
    tweenCode = document.getElementById("tweenCode"),
    svgness = $("#theSVG"),
    $container = $("#container");
//tween = TweenLite.to({}, 1, {});

function gotoThingA() {
    //drag.applyBounds($container);
    //tween.seek(0).kill();
    //reset
    /*
     TweenMax.set(svgness, {
     attr: {
     viewBox: sv.x + " " + sv.y + " " + sv.width + " " + sv.height
     }

     });*/
    
    //drag.update(true);
   $("#theSVG").attr("style",origStyle);
    tl.to(svgness, .75, {
        attr : {
            viewBox : sv.x + " " + sv.y + " " + sv.width + " " + sv.height
        }
    }).to(svgness, 1.2, {
        attr : {
            viewBox : ta.x + " " + ta.y + " " + ta.width + " " + ta.height
        }
    }, "+=.5");

    //drag.vars.bounds = null;

    tweenCode.innerHTML = 'TweenLite.to(svgness, 1.2, {attr : { viewBox : ta.x + " " + ta.y + " " + ta.width + " " + ta.height}});';
}

function gotoThingB() {
   $("#theSVG").attr("style",origStyle);
   // drag.update(true);
     tl.to(svgness, .75, {
        attr : {
            viewBox : sv.x + " " + sv.y + " " + sv.width + " " + sv.height
        }
    }).to(svgness, 1.2, {
        attr : {
            viewBox : tb.x + " " + tb.y + " " + tb.width + " " + tb.height
        }
    }, "+=.5");
}

svgOriginButton.onclick = gotoThingA;
transformOriginButton.onclick = gotoThingB;
//var myLayout = $('body').layout({
//    applyDemoStyles:true
//  });

//myLayout.close("west");
var tl = new TimelineMax({
    delay : .5
}),
    ta,
    tb,    drag;
$(document).ready(function() {
    myLayout.close("east");
    //myLayout.close("south");

    ta = $("#thingA > #ooo")[0].getBBox();
    tb = $("#thingB")[0].getBBox();
    sv = $("#theSVG")[0].getBBox();
    origStyle = $("#theSVG").attr("style");
    console.log("thingA: " + ta.x + " " + ta.y);
    console.log("thingB: " + tb.x + " " + tb.y);

    drag = Draggable.create("svg", {
       // bounds:"#container",
      //  edgeResistance : 1,
        type : "x,y",
        autoScroll : 0

    });
    drag = drag[0];
   

});
