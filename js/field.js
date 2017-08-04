var renderer;
var stage;
var screenWidth;
var screenHeight;
var counter;
var totalScreenPixels;
var cycleDuration;
var connectionDistance;
var connectionLimit;
var pointShiftDistance;
// var colorShiftAmt;
var disconnectedColorShiftAmt;
var polygon;
var startPoints;
var polygonPoints;
var tweeningFns;
var lastLoop;
var thisLoop;
var fps;
var fpsGraphic;
var scrollDelta;
var pointShiftBiasX;
var pointShiftBiasY;
var resolution = 1;
var debug = false;
var fpsEnabled = debug;
var allTweeningFns = [
    linearTweening,
    easeInSine,
    easeOutSine,
    easeInOutSine,
    easeInQuad,
    easeOutQuad,
    easeInOutQuad,
    easeInCubic,
    easeOutCubic,
    easeInOutCubic,
    easeInExpo,
    easeOutExpo,
    easeInOutExpo,
    easeInCirc,
    easeOutCirc,
    easeInOutCirc,
    easeOutBounce,
    easeInBounce,
    easeInOutBounce,
    easeInElastic,
    easeOutElastic,
    easeInOutElastic,
    easeInBack,
    easeOutBack,
    easeInOutBack
];
var tweeningSets = {
    linear: [0],
    meandering: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    snappy: [10, 11, 12, 13, 14, 15],
    bouncy: [16, 17, 18],
    elastic: [19, 20, 21],
    back: [22, 23, 24]
};
var click = null;
var hover = null;
var lastHover = null;
var clickEnd = false;
var clickPullRateStart = 0.01;
var clickMaxDistStart = 50;
var clickPullRateInc = 0.005;
var clickPullRateMax = 0.3;
var clickMaxDistInc = 2;
var clickMaxDistMax = 5000;
var clickPullRate = clickPullRateStart;
var clickMaxDist = clickMaxDistStart;
var clickPullRateEnd = -0.6;
var clickInertiaStart = -0.7;
var clickInertia = clickInertiaStart;
var clickInertiaEnd = 0.3;
var clickTweeningFnStart = null;
var clickTweeningFn = clickTweeningFnStart;
var clickTweeningFnEnd = 12;
var hoverPushRate = -0.05;
var hoverInertia = 0.8;
var hoverMaxDistStart = 75;
var hoverMaxDistMax = 1000;
var hoverMaxDist = hoverMaxDistStart;
var hoverTweeningFn = 5;

function randomInt (min, max) {
    // inclusive of min and max
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* eslint-disable no-unused-vars */
function linearTweening (t, b, c, d) {
    // t = current time
    // b = start value
    // c = change in value
    // d = duration
    return ((c * t) / d) + b;
}

function easeOutBounce (t, b, c, d) {
    if ((t /= d) < (1 / 2.75)) {
        return c * (7.5625 * t * t) + b;
    } else if (t < (2 / 2.75)) {
        return c * (7.5625 * (t -= (1.5 / 2.75)) * t + 0.75) + b;
    } else if (t < (2.5 / 2.75)) {
        return c * (7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375) + b;
    } else {
        return c * (7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375) + b;
    }
}

function easeInBounce (t, b, c, d) {
    return c - easeOutBounce(d - t, 0, c, d) + b;
}

function easeInOutBounce (t, b, c, d) {
    if (t < d / 2) return easeInBounce(t * 2, 0, c, d) * 0.5 + b;
    return easeOutBounce(t * 2 - d, 0, c, d) * 0.5 + c * 0.5 + b;
}

function easeInSine (t, b, c, d) {
    return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
}

function easeOutSine (t, b, c, d) {
    return c * Math.sin(t / d * (Math.PI / 2)) + b;
}

function easeInOutSine (t, b, c, d) {
    return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
}

function easeInQuad (t, b, c, d) {
    return c * (t /= d) * t + b;
}

function easeOutQuad (t, b, c, d) {
    return -c * (t /= d) * (t - 2) + b;
}

function easeInOutQuad (t, b, c, d) {
    if ((t /= d / 2) < 1) return c / 2 * t * t + b;
    return -c / 2 * ((--t) * (t - 2) - 1) + b;
}

function easeInCubic (t, b, c, d) {
    return c * (t /= d) * t * t + b;
}

function easeOutCubic (t, b, c, d) {
    return c * ((t = t / d - 1) * t * t + 1) + b;
}

function easeInOutCubic (t, b, c, d) {
    if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
    return c / 2 * ((t -= 2) * t * t + 2) + b;
}

function easeInExpo (t, b, c, d) {
    return (t === 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
}

function easeOutExpo (t, b, c, d) {
    return (t === d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
}

function easeInOutExpo (t, b, c, d) {
    if (t === 0) return b;
    if (t === d) return b + c;
    if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
    return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
}

function easeInElastic (t, b, c, d) {
    var s = 1.70158; var p = 0; var a = c;
    if (t === 0) return b; if ((t /= d) === 1) return b + c; if (!p) p = d * 0.3;
    if (a < Math.abs(c)) { a = c; s = p / 4; } else s = p / (2 * Math.PI) * Math.asin(c / a);
    return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
}

function easeOutElastic (t, b, c, d) {
    var s = 1.70158; var p = 0; var a = c;
    if (t === 0) return b; if ((t /= d) === 1) return b + c; if (!p) p = d * 0.3;
    if (a < Math.abs(c)) { a = c; s = p / 4; } else s = p / (2 * Math.PI) * Math.asin(c / a);
    return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
}

function easeInOutElastic (t, b, c, d) {
    var s = 1.70158; var p = 0; var a = c;
    if (t === 0) return b; if ((t /= d / 2) === 2) return b + c; if (!p) p = d * (0.3 * 1.5);
    if (a < Math.abs(c)) { a = c; s = p / 4; } else s = p / (2 * Math.PI) * Math.asin(c / a);
    if (t < 1) return -0.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
    return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * 0.5 + c + b;
}

function easeInBack (t, b, c, d, s) {
    if (s === undefined) s = 1.70158;
    return c * (t /= d) * t * ((s + 1) * t - s) + b;
}

function easeOutBack (t, b, c, d, s) {
    if (s === undefined) s = 1.70158;
    return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
}

function easeInOutBack (t, b, c, d, s) {
    if (s === undefined) s = 1.70158;
    if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
    return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
}

function easeInCirc (t, b, c, d) {
    return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
}

function easeOutCirc (t, b, c, d) {
    return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
}

function easeInOutCirc (t, b, c, d) {
    if ((t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
    return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
}
/* eslint-enable no-unused-vars */

// from: http://stackoverflow.com/a/5624139
// modified to return integer literal
function rgbToHex (color) {
    return parseInt(((1 << 24) + (color.r << 16) + (color.g << 8) + color.b).toString(16).slice(1), 16);
}

/* Choose a random RGB color */
function randomColor () {
    return {
        r: Math.floor(Math.random() * (255 + 1)),
        g: Math.floor(Math.random() * (255 + 1)),
        b: Math.floor(Math.random() * (255 + 1))
    };
}

/* Find the average of two RGB colors and return one RGB of that color */
function averageColor (color1, color2) {
    return {
        r: Math.round((color1.r + color2.r) / 2),
        g: Math.round((color1.g + color2.g) / 2),
        b: Math.round((color1.b + color2.b) / 2)
    };
}

/*
 * Find the average of two RGB colors where color1 is weighted against color2 by the given weight.
 * weight is a decimal between 0 and 1.
 */
function weightedAverageColor (color1, color2, weight) {
    return {
        r: Math.round(((color1.r * (2 * weight)) + (color2.r * (2 * (1 - weight)))) / 2),
        g: Math.round(((color1.g * (2 * weight)) + (color2.g * (2 * (1 - weight)))) / 2),
        b: Math.round(((color1.b * (2 * weight)) + (color2.b * (2 * (1 - weight)))) / 2)
    };
}

/* Darken the color by a factor of 0 to 1, where 1 is black and 0 is white */
function shadeColor (color, shadeFactor) {
    return {
        r: Math.round(color.r * (1 - shadeFactor)),
        g: Math.round(color.g * (1 - shadeFactor)),
        b: Math.round(color.b * (1 - shadeFactor))
    };
}

/* Given a color component (red, green, or blue int), randomly shift by configurable amount */
function shiftColorComponent (component, maxShiftAmt) {
    var shiftAmt = randomInt(maxShiftAmt * -1, maxShiftAmt);
    var newComponent = component + shiftAmt;
    if ((newComponent < 0) || (newComponent > 255)) {
        newComponent = component - shiftAmt;
    }
    return newComponent;
}

/* Randomly shift a RGB color by a configurable amount and return new RGB color */
function shiftColor (color, maxShiftAmt) {
    return {
        r: shiftColorComponent(color.r, maxShiftAmt),
        g: shiftColorComponent(color.g, maxShiftAmt),
        b: shiftColorComponent(color.b, maxShiftAmt)
    };
}

/* from: https://stackoverflow.com/a/17130415 */
function getMousePos (evt, res) {
    var canvas = document.getElementsByTagName('canvas')[0];
    if (canvas !== undefined) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: Math.round((evt.clientX - rect.left) / (rect.right - rect.left) * canvas.width / res),
            y: Math.round((evt.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height / res)
        };
    }
}

function distancePos (point1, point2) {
    var a = point1.x - point2.x;
    var b = point1.y - point2.y;
    return Math.sqrt(a * a + b * b);
}

function distance (point1, point2) {
    var a = point1[0] - point2[0];
    var b = point1[1] - point2[1];
    return Math.sqrt(a * a + b * b);
}

function getRandomPoints (numPoints, maxX, maxY, tweeningFns) {
    var i, x, y, color, cycleStart, easingFn;
    var points = [];
    for (i = 0; i < numPoints; i++) {
        x = randomInt(0, maxX - 1);
        y = randomInt(0, maxY - 1);
        cycleStart = randomInt(0, cycleDuration - 1);
        color = randomColor();
        easingFn = tweeningFns[Math.floor(Math.random() * tweeningFns.length)];
        points[i] = [x, y, cycleStart, color, easingFn];
    }
    return points;
}

// eslint-disable-next-line no-unused-vars
function shiftPointCounter (original, maxShiftAmt) {
    var shiftAmt = randomInt(maxShiftAmt * -1, 0);
    var newCounter = original + shiftAmt;
    if (newCounter < 0) {
        newCounter = cycleDuration + shiftAmt;
    }
    return newCounter;
}

function shiftPoints (points, maxShiftAmt, counter, tweeningFns) {
    var i, shiftX, shiftY, candidateX, candidateY;
    for (i = 0; i < points.original.length; i++) {
        if (points.target[i][2] >= cycleDuration) {
            // cycleDuration was reduced and now this point's cycle is out of bounds. Randomly pick a new valid one.
            points.target[i][2] = randomInt(0, cycleDuration - 1);
        }
        if (points.target[i][2] === counter) {
            points.original[i] = points.target[i].slice();
            shiftX = randomInt(maxShiftAmt * -1, maxShiftAmt);
            shiftY = randomInt(maxShiftAmt * -1, maxShiftAmt);
            if (((shiftX < 0) && (pointShiftBiasX === 1)) || ((shiftX > 0) && (pointShiftBiasX === -1))) {
                shiftX = shiftX * -1;
            }
            if (((shiftY < 0) && (pointShiftBiasY === 1)) || ((shiftY > 0) && (pointShiftBiasY === -1))) {
                shiftY = shiftY * -1;
            }
            candidateX = points.original[i][0] + shiftX;
            candidateY = points.original[i][1] + shiftY;
            if ((candidateX > screenWidth) || (candidateX < 0)) {
                candidateX = points.original[i][0] - shiftX;
            }
            if ((candidateY > screenHeight) || (candidateY < 0)) {
                candidateY = points.original[i][1] - shiftY;
            }
            points.target[i][0] = candidateX;
            points.target[i][1] = candidateY;
            points.target[i][4] = tweeningFns[Math.floor(Math.random() * tweeningFns.length)];
            // FIXME: buggy, makes points jump around too fast
            // points.target[i][2] = shiftPointCounter(points.original[i][2], maxShiftAmt);
        }
    }
    // clear pointShiftBiases now that they have been "used"
    pointShiftBiasX = 0;
    pointShiftBiasY = 0;

    return points;
}

function pullPoints (points, clickPos, pullRate, inertia, maxDist, counter, resetPoints, tweeningFn) {
    var xDist, yDist, xTraveled, yTraveled;
    for (var i = 0; i < points.target.length; i++) {
        xDist = clickPos.x - points.target[i][0];
        yDist = clickPos.y - points.target[i][1];
        xTraveled = clickPos.x - points.original[i][0];
        yTraveled = clickPos.y - points.original[i][1];
        if (Math.abs(xDist) <= maxDist && Math.abs(yDist) <= maxDist) {
            if (resetPoints) {
                // Good for changing directions, reset the points original positions to their current positions
                points.original[i][0] = points.tweened[i][0];
                points.original[i][1] = points.tweened[i][1];
            }
            points.target[i][0] += Math.round((xDist + (inertia * xTraveled)) * pullRate);
            points.target[i][1] += Math.round((yDist + (inertia * yTraveled)) * pullRate);
            points.target[i][3] = shiftColor(points.original[i][3], disconnectedColorShiftAmt * 3);
            if (tweeningFn !== null) {
                // Also twitch the tweening function for all affected points for additional effect
                points.target[i][4] = tweeningFn;
            }
        }
        // TODO: define these magic numbers somewhere
        // If this point's cycle is near it's end, bump it up some ticks to make the animation smoother
        if (relativeCounter(points.target[i][2]) > cycleDuration - 10) {
            points.target[i][2] = (points.target[i][2] + Math.round(cycleDuration / 2)) % cycleDuration;
        }
    }
}

function redistributeCycles (points, oldCycleDuration, cycleDuration) {
    var progress;
    for (var i = 0; i < points.original.length; i++) {
        progress = points.target[i][2] / oldCycleDuration;
        points.target[i][2] = Math.round(progress * cycleDuration);
    }
    return points;
}

function relativeCounter (counter, targetStart) {
    var relCounter = counter - targetStart;
    if (relCounter < 0) {
        return cycleDuration + relCounter;
    }
    return relCounter;
}

function drawPolygon (polygon, points, counter, tweeningFns) {
    var i, j, easingFn, relativeCount, avgColor, shadedColor, connectionCount, dist, connectivity;
    // calculate vectors
    for (i = 0; i < points.original.length; i++) {
        easingFn = allTweeningFns[points.target[i][4]];
        relativeCount = relativeCounter(counter, points.target[i][2]);
        points.tweened[i][0] = easingFn(relativeCount, points.original[i][0], points.target[i][0] - points.original[i][0], cycleDuration);
        points.tweened[i][1] = easingFn(relativeCount, points.original[i][1], points.target[i][1] - points.original[i][1], cycleDuration);

        if (debug) {
            // draw vector trajectories
            polygon.lineStyle(1, 0x191970, 1);
            polygon.moveTo(points.tweened[i][0], points.tweened[i][1]);
            for (j = relativeCount; j < cycleDuration; j++) {
                polygon.lineTo(
                    easingFn(j, points.original[i][0], points.target[i][0] - points.original[i][0], cycleDuration),
                    easingFn(j, points.original[i][1], points.target[i][1] - points.original[i][1], cycleDuration)
                );
            }
        }
    }
    // draw lines
    for (i = 0; i < points.original.length; i++) {
        connectionCount = 0;
        for (j = i + 1; j < points.original.length; j++) {
            // TODO pick the N (connectionLimit) closest connections instead of the first N that occur sequentially.
            if (connectionCount >= connectionLimit) break;
            dist = distance(points.tweened[i], points.tweened[j]);
            connectivity = dist / connectionDistance;
            if ((j !== i) && (dist <= connectionDistance)) {
                // find average color of both points
                if ((points.tweened[i][2] === counter) || (points.tweened[j][2] === counter)) {
                    // avgColor = shiftColor(avgColor, Math.round(colorShiftAmt * (1 - connectivity)));
                    points.tweened[i][3] = weightedAverageColor(points.tweened[i][3], points.tweened[j][3], connectivity);
                    points.tweened[j][3] = weightedAverageColor(points.tweened[j][3], points.tweened[i][3], connectivity);
                }
                avgColor = averageColor(points.tweened[i][3], points.tweened[j][3]);
                shadedColor = shadeColor(avgColor, connectivity);
                polygon.lineStyle(1, rgbToHex(shadedColor), 1);

                polygon.moveTo(points.tweened[i][0], points.tweened[i][1]);
                polygon.lineTo(points.tweened[j][0], points.tweened[j][1]);
                connectionCount = connectionCount + 1;
            }
        }

        if (connectionCount === 0) {
            points.tweened[i][3] = shiftColor(points.tweened[i][3], disconnectedColorShiftAmt);
        }

        // draw vectors
        polygon.lineStyle(1, rgbToHex(points.tweened[i][3]), 1);
        polygon.drawCircle(points.tweened[i][0], points.tweened[i][1], 1);
    }
}

function loop () {
    screenWidth = document.documentElement.clientWidth;
    screenHeight = document.documentElement.clientHeight;
    renderer.resize(screenWidth, screenHeight);

    polygon.clear();

    if (click !== null) {
        if (clickEnd) {
            clickPullRate = clickPullRateEnd;
            clickInertia = clickInertiaEnd;
            clickTweeningFn = clickTweeningFnEnd;
            if (debug) {
                polygon.lineStyle(1, 0xDC143C, 1);
                polygon.drawCircle(click.x, click.y, clickMaxDist);
            }
        } else {
            if (debug) {
                polygon.lineStyle(1, 0x483D8B, 1);
                polygon.drawCircle(click.x, click.y, clickMaxDist);
            }
        }

        // a pointer event is occuring and needs to affect the points
        pullPoints(polygonPoints, click, clickPullRate, clickInertia, clickMaxDist, counter, clickEnd, clickTweeningFn);

        // slightly increase effect amount for next loop if click is still occuring
        if (clickMaxDist <= clickMaxDistMax) {
            clickMaxDist += clickMaxDistInc;
        }
        if (clickPullRate <= clickPullRateMax) {
            clickPullRate += clickPullRateInc;
        }

        if (clickEnd) {
            click = null;
            clickEnd = false;
            clickMaxDist = clickMaxDistStart;
            clickPullRate = clickPullRateStart;
            clickInertia = clickInertiaStart;
            clickTweeningFn = clickTweeningFnStart;
        }
    } else if (hover !== null) {
        if (lastHover !== null) {
            hoverMaxDist += Math.min(Math.round(distancePos(hover, lastHover)), hoverMaxDistMax);
        }
        if (debug) {
            polygon.lineStyle(1, 0xBDB76B, 1);
            polygon.drawCircle(hover.x, hover.y, hoverMaxDist);
        }

        pullPoints(polygonPoints, hover, hoverPushRate, hoverInertia, hoverMaxDist, counter, false, hoverTweeningFn);

        hoverMaxDist = hoverMaxDistStart;
        lastHover = hover;
    }

    // polygon.beginFill(0x00FF00);
    drawPolygon(polygon, polygonPoints, counter, tweeningFns);
    // polygon.endFill();

    counter += 1;
    counter = counter % cycleDuration;

    if (counter === 0 && fpsEnabled) {
        thisLoop = new Date();
        fps = Math.round((1000 / (thisLoop - lastLoop)) * cycleDuration);
        fpsGraphic.setText(fps.toString());
        lastLoop = thisLoop;
    }

    polygonPoints = shiftPoints(polygonPoints, pointShiftDistance, counter, tweeningFns);

    // var mousePosition = renderer.plugins.interaction.mouse.global;
    // triangle.x = mousePosition.x;
    // triangle.y = mousePosition.y;

    // If user scrolled, modify cycleDuration by amount scrolled
    if (scrollDelta !== 0) {
        var oldCycleDuration = cycleDuration;
        cycleDuration = Math.round(cycleDuration + scrollDelta);
        if (cycleDuration < 1) {
            cycleDuration = 1;
        }
        scrollDelta = 0;
        polygonPoints = redistributeCycles(polygonPoints, oldCycleDuration, cycleDuration);
    }

    // Tell the `renderer` to `render` the `stage`
    renderer.render(stage);
    window.requestAnimationFrame(loop);
}

function loopStart () {
    screenWidth = document.documentElement.clientWidth;
    screenHeight = document.documentElement.clientHeight;
    // Create the renderer
    renderer = window.PIXI.autoDetectRenderer(screenWidth, screenHeight, {antialias: true, resolution: resolution});

    // Add the canvas to the HTML document
    document.body.appendChild(renderer.view);

    // Create a container object called the `stage`
    stage = new window.PIXI.Container();

    renderer.view.style.position = 'absolute';
    renderer.view.style.display = 'block';
    renderer.autoResize = true;

    counter = 0;
    totalScreenPixels = screenWidth + screenHeight;
    cycleDuration = 60;
    connectionDistance = Math.min(Math.round(totalScreenPixels / 16), 75);
    connectionLimit = 10;
    pointShiftDistance = Math.round(totalScreenPixels / 45);
    // colorShiftAmt = 80;
    disconnectedColorShiftAmt = 10;
    polygon = new window.PIXI.Graphics();
    tweeningFns = tweeningSets.meandering;
    startPoints = getRandomPoints(Math.round(totalScreenPixels / 6), screenWidth, screenHeight, tweeningFns);
    polygonPoints = {
        original: startPoints,
        target: JSON.parse(JSON.stringify(startPoints)),
        tweened: JSON.parse(JSON.stringify(startPoints))
    };
    stage.addChild(polygon);

    fpsGraphic = new window.PIXI.Text('0', {font: '25px monospace', fill: 'yellow'});
    fpsGraphic.x = 0;
    fpsGraphic.y = 0;

    if (fpsEnabled) {
        stage.addChild(fpsGraphic);
    }

    lastLoop = new Date();

    scrollDelta = 0;

    window.requestAnimationFrame(loop);
}

window.onload = loopStart;

/* MOUSE AND TOUCH EVENTS */

// FIXME: buggy :(
window.addEventListener('mousewheel', function (e) {
    scrollDelta = scrollDelta + ((e.deltaY / 100) * 3);
});

window.addEventListener('touchstart', function (e) {
    click = getMousePos(e.changedTouches[0], resolution);
});

window.addEventListener('touchmove', function (e) {
    if (click !== null) {
        click = getMousePos(e.changedTouches[0], resolution);
    }
});

window.addEventListener('touchend', function (e) {
    clickEnd = true;
});

window.addEventListener('touchcancel', function (e) {
    clickEnd = true;
});

window.addEventListener('mousedown', function (e) {
    click = getMousePos(e, resolution);
});

window.addEventListener('mousemove', function (e) {
    var pos = getMousePos(e, resolution);
    if (click !== null) {
        click = pos;
    }
    hover = pos;
});

window.addEventListener('mouseup', function (e) {
    clickEnd = true;
    hover = null;
    lastHover = null;
});

window.addEventListener('mouseleave', function (e) {
    clickEnd = true;
    hover = null;
    lastHover = null;
});

document.addEventListener('mouseleave', function (e) {
    clickEnd = true;
    hover = null;
    lastHover = null;
});

/* KEYBOARD EVENTS */

window.addEventListener('keydown', function (e) {
    if (e.keyCode === 37) { // left
        pointShiftBiasX = -1;
    } else if (e.keyCode === 38) { // up
        pointShiftBiasY = -1;
    } else if (e.keyCode === 39) { // right
        pointShiftBiasX = 1;
    } else if (e.keyCode === 40) { // down
        pointShiftBiasY = 1;
    } else if (e.keyCode === 49) { // 1
        tweeningFns = tweeningSets.linear;
    } else if (e.keyCode === 50) { // 2
        tweeningFns = tweeningSets.meandering;
    } else if (e.keyCode === 51) { // 3
        tweeningFns = tweeningSets.snappy;
    } else if (e.keyCode === 52) { // 4
        tweeningFns = tweeningSets.bouncy;
    } else if (e.keyCode === 53) { // 5
        tweeningFns = tweeningSets.elastic;
    } else if (e.keyCode === 54) { // 6
        tweeningFns = tweeningSets.back;
    } else if (e.keyCode === 70) { // f
        // toggle fpsCounter
        if (fpsEnabled) {
            stage.removeChild(fpsGraphic);
            fpsEnabled = false;
        } else {
            stage.addChild(fpsGraphic);
            fpsEnabled = true;
            lastLoop = new Date();
        }
    } else if (e.keyCode === 68) {
        // toggle debug
        if (debug) {
            if (fpsEnabled) {
                stage.removeChild(fpsGraphic);
            }
            debug = false;
            fpsEnabled = debug;
        } else {
            if (!fpsEnabled) {
                stage.addChild(fpsGraphic);
            }
            debug = true;
            fpsEnabled = debug;
            lastLoop = new Date();
        }
    }
});
