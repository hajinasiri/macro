var svgOriginButton = document.getElementById("svgOrigin"),
    transformOriginButton = document.getElementById("transformOrigin"),
    tweenCode = document.getElementById("tweenCode"),
		boxes = document.querySelectorAll(".box"),
    tween = TweenLite.to({}, 1, {});

function svgOriginRotation() {
  tween.seek(0).kill(); //reset
  tween = TweenLite.to(boxes, 1, {rotation:360, svgOrigin:"300 200"});
  tweenCode.innerHTML = 'TweenLite.to(".box", 1, {rotation:360, svgOrigin:"300 200"});';
}

function transformOriginRotation() {
  tween.seek(0).kill(); //reset
  tween = TweenLite.to(boxes, 1, {rotation:360, transformOrigin:"50% 50%"});
  tweenCode.innerHTML = 'TweenLite.to(".box", 1, {rotation:360, transformOrigin:"50% 50%"});'
}

svgOriginButton.onclick = svgOriginRotation;
transformOriginButton.onclick = transformOriginRotation;