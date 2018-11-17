var svgness, zoomTiger,z;
var panx=0,pany=0,zoom=1;
var ta,tb, sv;

function recordPanZoomState() {
  var s = zoomTiger.getSizes();
  var pan = zoomTiger.getPan();
  panx = s.width / 2 / (pan.x + s.viewBox.width * s.realZoom);
  pany = s.height / 2 / (pan.y + s.viewBox.height * s.realZoom);
  zoom = zoomTiger.getZoom();
}

function setPanZoomStateFromRecorded() {
  var s = zoomTiger.getSizes();
  var p = zoomTiger.getPan();
  var x = panx != 0 ? (s.width / 2 / panx) - s.viewBox.width * s.realZoom : 0;
  var y = pany != 0 ? (s.height / 2 / pany) - s.viewBox.height * s.realZoom : 0;
  zoomTiger.zoomAtPoint(zoom, {x: x, y: y});
  /*
  zoomTiger.zoom(zoom);
  zoomTiger.pan({
    x : x,
    y : y
  }); 
  */
}

$( document ).ready(function() {
   myLayout.close("east");
  recordViewButton.onclick = recordPanZoomState;
  setViewButton.onclick = setPanZoomStateFromRecorded;

  svgness = $("#container svg")[0];
  $(svgness).attr({
    width : "100%",
    height : "100%",
    id : "svgness"
  });

//set up pan and zoom object. This adds some navigation groups and a group with .svg-pan-zoom_viewport
  zoomTiger = svgPanZoom(svgness, {
    zoomEnabled : true,
    maxZoom : 50, // Maximum Zoom level
    //we are using double-click to jump to url defined in db for this object
    dblClickZoomEnabled : false,
    controlIconsEnabled : true,
    fit : true,
    center : true,
    panEnabled : true,
    viewportSelector : '.svg-pan-zoom_viewport',
    // mouseWheelZoomEnabled : true,
    preventMouseEventsDefault : true

  });
  z = zoomTiger;
   ta = $("#thingA > #ooo")[0].getBBox();
  tb = $("#thingB")[0].getBBox();
  sv = $(".svg-pan-zoom_viewport")[0].getBBox();
  //origStyle = $("#theSVG").attr("style");
  console.log("thingA: x" + ta.x + " " + ta.y + " height " + ta.height + " width " + ta.width);
  console.log("thingB: " + tb.x + " " + tb.y + " height " + tb.height + " width " + tb.width);
  
  $(svgness).click(function(evt) {
    if (evt.shiftKey) {
      //want to record the location of mouse here.
      var inversedScreenCTM = svgness.getScreenCTM().inverse();
      var relativeMousePoint = SvgUtils.getEventPoint(evt, svgness).matrixTransform(inversedScreenCTM);
      //relativeMousePoint = {x:ta.x, y:ta.y};
      //TODO: abs is probably not always the right thing here
      var delta = Math.abs(sv.width - ta.width);
      zoom = Math.pow(1 + z.options.zoomScaleSensitivity, (-1) * delta); // multiplying by neg. 1 so as to make zoom in/out behavior match Google maps behavior
      z.zoomAtPoint(zoom, relativeMousePoint);
    }
  });
  
});