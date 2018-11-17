var ta, tb, drag;
//$(document).ready(function() {

ta = $("#thingA")[0].getBBox();
tb = $("#thingB")[0].getBBox();
console.log("thingA: " + ta.x + " " + ta.y);
console.log("thingB: " + tb.x + " " + tb.y);

var tl = new TimelineMax({
    delay: .5
  }),
  svgRoot = $("svg");
drag = Draggable.create(svgRoot, {

  edgeResistance: 0,
  type: "x,y",
  autoScroll: 0

});
drag = drag[0];
TweenMax.set(svgRoot, {
  attr: {
    viewBox: "250 0 250 250"
  }
});
tl.to(svgRoot, 1.5, {
    attr: {
      viewBox: "0 0 1000 1000"
    }
  })
  .to(svgRoot, 1.2, {
    attr: {
      viewBox: tb.x + " " + tb.y + " " + tb.height + " " + tb.width
    }

  }, "+=.5").to(svgRoot, 1, {
    x: 0,
    y: 0,
    attr: {
      viewBox: "0 0 1000 1000"
    }
  }, "+=.5")
  .to(svgRoot, 1, {
    attr: {
      viewBox: "750 500 250 250"
    }
  //,  ease: Power2.easeInOut
  }, "+=.5")
  .to(svgRoot, 1, {
    attr: {
      viewBox: "0 0 1000 1000"
    },
    ease: Power1.easeOut
  }, "+=.5");

function resetStuff() {
  console.log("in resetStuff()");
  drag.update(false);
}

//});