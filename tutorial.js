//Create the renderer
var renderer = PIXI.autoDetectRenderer(256, 256, {antialias: true});

//Add the canvas to the HTML document
document.body.appendChild(renderer.view);

//Create a container object called the `stage`
var stage = new PIXI.Container();

renderer.view.style.position = "absolute";
renderer.view.style.display = "block";
renderer.autoResize = true;
renderer.resize(window.innerWidth, window.innerHeight);

var counter = 0,
    cycleDuration = 60,
    tri = {
        original: [
            [0, 0],
            [-50, 50],
            [50, 50]
        ],
        target: [
            [0, 0],
            [-50, 50],
            [50, 50]
        ]
    },
    triangle = new PIXI.Graphics();

stage.addChild(triangle);

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function linearTweening(t, b, c, d) {
    // t = current time
    // b = start value
    // c = change in value
    // d = duration
    return ((c * t) / d) + b;
}

function easeOutBounce(t, b, c, d) {
	if ((t/=d) < (1/2.75)) {
		return c*(7.5625*t*t) + b;
	} else if (t < (2/2.75)) {
		return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
	} else if (t < (2.5/2.75)) {
		return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
	} else {
		return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
	}
}

function easeInOutExpo(t, b, c, d) {
	if (t==0) return b;
	if (t==d) return b+c;
	if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
	return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
}

function drawLine(x1, y1, x2, y2) {
    var line = new PIXI.Graphics();
    line.lineStyle(1, 0xFFFFFF, 1);
    line.moveTo(x1, y1);
    line.lineTo(x2, y2);
    line.x = x1;
    line.y = y1;
    stage.addChild(line);
}

function drawShiftingTriangle(triangle, originalPoints, targetPoints, counter, easingFn) {
    var i = 0;
    if (counter === 0) {
        // Given originalPoints, randomly shifts them by some amount, draws it, and returns new array of points
        var newPoints = [];
        // Start new cycle. New original is old target. New target is newly generated newPoints.
        originalPoints = targetPoints;

        for (i = 0; i < originalPoints.length; i++) {
            newPoints[i] = [originalPoints[i][0] + randomInt(-10, 10),
                            originalPoints[i][1] + randomInt(-10, 10)];
        }
        targetPoints = newPoints;
    }
    triangle.lineStyle(1, 0xFAFAFA, 1);
    // triangle.beginFill(0x66FF33);
    for (i = 0; i < 4; i++) {
        if (i === 0) {
            triangle.moveTo(easingFn(counter, originalPoints[0][0], targetPoints[0][0] - originalPoints[0][0], cycleDuration),
                            easingFn(counter, originalPoints[0][1], targetPoints[0][1] - originalPoints[0][1], cycleDuration));
        } else if (i === 3) {
            triangle.lineTo(easingFn(counter, originalPoints[0][0], targetPoints[0][0] - originalPoints[0][0], cycleDuration),
                            easingFn(counter, originalPoints[0][1], targetPoints[0][1] - originalPoints[0][1], cycleDuration));
        } else {
            triangle.lineTo(easingFn(counter, originalPoints[i][0], targetPoints[i][0] - originalPoints[i][0], cycleDuration),
                            easingFn(counter, originalPoints[i][1], targetPoints[i][1] - originalPoints[i][1], cycleDuration));
        }
    }
    // triangle.endFill();
    
    return {
        original: originalPoints,
        target: targetPoints
    };
}

function loop(){
    requestAnimationFrame(loop);

    triangle.clear();

    // drawLine(0, 0, counter, counter);
    tri = drawShiftingTriangle(triangle, tri.original, tri.target, counter, linearTweening);

    counter += 1;
    counter = counter % cycleDuration;

    var mousePosition = renderer.plugins.interaction.mouse.global;
    triangle.x = mousePosition.x;
    triangle.y = mousePosition.y;

    //Tell the `renderer` to `render` the `stage`
    renderer.render(stage);
}

loop();
