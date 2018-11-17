var svgOriginButton = document.getElementById("svgOrigin"),
tweenCode = document.getElementById("tweenCode"), $container = $("#container");


function gotoThingA() {
  var ta = $("#thingA")[0].getBBox();

  zoomTiger.clear().to(

      svgness,
      .75,
      { parseTransform : true, attr : { viewBox : ta.x + " " + (ta.y) + " " + ta.width + " " + ta.height }});
      Drag.update();

  tweenCode.innerHTML = 'zoomTiger.clear().to(svgness, .75,{ parseTransform : true, attr : { viewBox : ta.x + " " + (ta.y) + " " + ta.width + " " + ta.height },onUpdate : tweenLiteCallback, onUpdateParams : [ ta.x, ta.y, ta ] });';
}

svgOriginButton.onclick = gotoThingA;

var ta, zoomTiger, drag;
$(document).ready(function() {
  myLayout.close("east");
  svgness = $("#container svg")[0];
  $(svgness).attr({ width : "100%", height : "100%", id : "svgness" });
  zoomTiger = new TimelineMax({ delay : .5 });
  Drag = Draggable.create(svgness, {
  //bounds : "#container", edgeResistance : 1,
  type : "x,y", autoScroll : 0 });
  Drag = Drag[0];
  //OrigStyle = $(svgness).attr("style");
  //SvgViewbox = $(svgness)[0].getBBox();

});

