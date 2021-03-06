/* Sorry, this code is pretty damn ugly. I spend 8 hours 5 days a week refactoring code, I just don't feel like making
 * it better right now. Maybe I'll have enough caffiene in my veins and nothing better to do sometime to put this all
 * into ES2015 modules or something.
 */
// global vars
var renderer;
var stage;
var screenWidth;
var screenHeight;
var counter;
var totalScreenPixels;
var connectionDistance;
var pointShiftDistance;
var polygon;
var startPoints;
var polygonPoints;
var lastLoop;
var thisLoop;
var fps;
var fpsGraphic;
var scrollDelta;
var pointShiftBiasX;
var pointShiftBiasY;
var numPoints;

// global non-configurable vars (modifying these might break stuff)
var click = null;
var hover = null;
var lastHover = null;
var clickEnd = false;
var sprites = [];
var reset = false;

// global configurable vars
var resolution = 1; // scaling for PIXI renderer
var debug = false; // toggles drawing extra indicators for debugging
var fpsEnabled = debug; // toggles the FPS counter
var cycleDuration = 60; // length of a point's "cycle": number of frames it takes for it to travel to its chosen destination
var connectionLimit = 10; // maximum number of lines drawn from one point to others within connection distance
// colorShiftAmt = 80; // disabled for now
var disconnectedColorShiftAmt = 10; // when a point is alone (not connected), shift RGB values by this amount every tick
var allTweeningFns = [ // array of all possible tweening functions, these are defined below
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
// sets of tweening functions that I think look good with points randomly choose from them
var tweeningSets = { // numbers refer to indicies into the allTweeningsFns array above
    linear: [0],
    meandering: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    snappy: [10, 11, 12, 13, 14, 15],
    bouncy: [16, 17, 18],
    elastic: [19, 20, 21],
    back: [24]
};
var tweeningFns = tweeningSets.back; // the actual set of tweening functions points will randomly choose from
// click effect related config vars
var clickPullRateStart = 0.01; // initial value for the ratio of a point's distance from the click position to travel in one cycle
var clickPullRateInc = 0.005; // amount to increase clickPullRate every tick that a click is held
var clickPullRateMax = 0.5; // maximum value of clickPullRate
var clickPullRate = clickPullRateStart;
var clickMaxDistStart = 50; // initial value for the effect radius of a click: points this distance from click position will be pulled (overridden if small screen size)
var clickMaxDistInc = 2; // amount to increase clickMaxDist every tick that a click is held
var clickMaxDistMax = 5000; // maximum value of clickMaxDist
var clickMaxDist = clickMaxDistStart;
var clickInertiaStart = -0.7; // initial value of the ratio of point's origin distance from the click position to be added to point's new target
var clickInertia = clickInertiaStart;
var clickTweeningFnStart = null; // initial value of the specific tweening function to assign to points in effect radius (null will not change functions)
var clickTweeningFn = clickTweeningFnStart;
var clickColorShiftAmt = disconnectedColorShiftAmt * 3; // amount of RGB color value to shift for each point in effect radius
var clickPullRateEnd = -0.5; // value of clickPullRate during tick after end of click (for "rebound" effect)
var clickInertiaEnd = 0.3; // value of clickInertia during tick after end of click
var clickTweeningFnEnd = 12; // value of clickTweeningFn during tick after end of click (number refers to index into allTweeningsFns)
// hover effect related config vars
var hoverPushRate = -0.05; // ratio of a point's distance from the hover position to travel in one cycle
var hoverInertia = 0.8;  // ratio of a point's origin distance from the click position to be added to point's new target
var hoverMaxDistStart = 75; // initial value for the effect radius of a hover: points this distance from hover position will be pushed (overridden if small screen size)
var hoverMaxDistMax = 1000; // maximum value of hoverMaxDist
var hoverMaxDist = hoverMaxDistStart;
var hoverTweeningFn = 5;  // specific tweening function to assign to points in effect radius
var zRange = 50;  // maximum value for the range of possible z coords for a point
var nodeImg = 'img/node.png';  // image file location for representing every point
var nodeImgRes = 100;  // resolution of nodeImg file in pixels (aspect ratio should be square)
// var minNodeDiameter = 3;  // minimum pixel size of point on canvas when z coord is 0, maximum is this value plus zRange
var nodeSize = 3;  // with z coord ignored, this value is used for scaling the drawing for each node
var drawNodes = true;  // whether to display circles at each point's current position
var drawLines = true;  // whether to display lines connecting points if they are in connection distance
var lineSize = 1;  // thickness in pixels of drawn lines between points

/* TWEENING FUNCTIONS */

// These are modified versions of the jquery easing functions:
// https://github.com/danro/jquery-easing/blob/master/jquery.easing.js
// See license in LICENSE-3RD-PARTY.txt

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

/* TOGGLE FUNCTIONS */

function toggleHelp () {
    var help, controls;
    help = document.getElementById('help');
    controls = document.getElementById('controls');
    if (help.style.display === 'none') {
        help.style.display = 'block';

        // hide controls if open (only want one panel open at a time)
        if (controls.style.display === 'block') {
            controls.style.display = 'none';
        }
    } else {
        help.style.display = 'none';
    }
}

function toggleControls () {
    var help, controls;
    help = document.getElementById('help');
    controls = document.getElementById('controls');
    if (controls.style.display === 'none') {
        controls.style.display = 'block';

        // hide help if open (only want one panel open at a time)
        if (help.style.display === 'block') {
            help.style.display = 'none';
        }
    } else {
        controls.style.display = 'none';
    }
}

function toggleFPS () {
    var fpsCheckbox = document.getElementsByName('fpsCounterToggle')[0];
    if (fpsEnabled) {
        stage.removeChild(fpsGraphic);
        fpsEnabled = false;
    } else {
        stage.addChild(fpsGraphic);
        fpsEnabled = true;
        lastLoop = new Date();
    }
    fpsCheckbox.checked = fpsEnabled;
}

function toggleDebug () {
    var fpsCheckbox = document.getElementsByName('fpsCounterToggle')[0];
    var debugCheckbox = document.getElementsByName('debugToggle')[0];
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
    fpsCheckbox.checked = fpsEnabled;
    debugCheckbox.checked = debug;
}

function toggleNodes () {
    nodesCheckbox = document.getElementsByName('nodesToggle')[0];
    if (drawNodes) {
        for (i = 0; i < sprites.length; i++) {
            sprites[i].visible = false;
        }
        drawNodes = false;
    } else {
        for (i = 0; i < sprites.length; i++) {
            sprites[i].visible = true;
        }
        drawNodes = true;
    }
    nodesCheckbox.checked = drawNodes;
}

function toggleLines () {
    linesCheckbox = document.getElementsByName('linesToggle')[0];
    drawLines = !drawLines;
    linesCheckbox.checked = drawLines;
}

/* UTILITY FUNCTIONS */

function randomInt (min, max) {
    // inclusive of min and max
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

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

function distance (point1, point2) {
    var a = point1[0] - point2[0];
    var b = point1[1] - point2[1];
    return Math.sqrt(a * a + b * b);
}

function distancePos (point1, point2) {
    // TODO: refactor distance and distancePos to the same function
    var a = point1.x - point2.x;
    var b = point1.y - point2.y;
    return Math.sqrt(a * a + b * b);
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

function relativeCounter (counter, targetStart) {
    /* Return current progress of point in its cycle. AKA. what count would be if cycleDuration == targetStart */
    var relCounter = counter - targetStart;
    if (relCounter < 0) {
        return cycleDuration + relCounter;
    }
    return relCounter;
}

function createSprite () {
    return new window.PIXI.Sprite(
        window.PIXI.loader.resources[nodeImg].texture
    );
}

function clearSprites () {
    if (sprites.length > 0) {
        // need to clear out old sprites
        for (i = 0; i < sprites.length; i++) {
            stage.removeChild(sprites[i]);
        }
        sprites = [];
    }
}

/* POINT OPERATION FUNCTIONS */

function getRandomPoints (numPoints, maxX, maxY, maxZ, tweeningFns) {
    var i, x, y, z, color, cycleStart, easingFn, sprite;
    var points = [];
    for (i = 0; i < numPoints; i++) {
        x = randomInt(0, maxX - 1);
        y = randomInt(0, maxY - 1);
        // z = randomInt(0, maxZ - 1);  // TODO: do something with the 3rd dimension
        z = 0;  // turns out that 3D is hard and I am a weak 2D boy
        cycleStart = randomInt(0, cycleDuration - 1);
        color = randomColor();
        easingFn = tweeningFns[Math.floor(Math.random() * tweeningFns.length)];
        // save PIXI Sprite for each point in array
        sprite = createSprite();
        if (!drawNodes) sprite.visible = false;
        sprites.push(sprite);
        stage.addChild(sprite);
        points[i] = [x, y, z, cycleStart, color, easingFn];
    }
    return points;
}

function addOrRemovePoints (numPoints, points) {
    /* Given new value numPoints, remove or add new random points to match new count. */
    var deletedSprites, newPoints;
    if (points.target.length > numPoints) {
        points.original.splice(numPoints - 1);
        points.target.splice(numPoints - 1);
        points.tweened.splice(numPoints - 1);
        deletedSprites = sprites.splice(numPoints - 1);
        for (var i = 0; i < deletedSprites.length; i++) {
            stage.removeChild(deletedSprites[i]);
        }
    } else if (points.target.length < numPoints) {
        newPoints = getRandomPoints(numPoints - points.target.length, screenWidth, screenHeight, zRange, tweeningFns);
        points.original = points.original.concat(newPoints);
        points.target = points.target.concat(JSON.parse(JSON.stringify(newPoints)));
        points.tweened = points.tweened.concat(JSON.parse(JSON.stringify(newPoints)));
    }
    return points;
}

function shiftPoints (points, maxShiftAmt, counter, tweeningFns) {
    var i, shiftX, shiftY, candidateX, candidateY;
    for (i = 0; i < points.original.length; i++) {
        if (points.target[i][3] >= cycleDuration) {
            // cycleDuration was reduced and now this point's cycle is out of bounds. Randomly pick a new valid one.
            points.target[i][3] = randomInt(0, cycleDuration - 1);
        }
        if (points.target[i][3] === counter) {
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
            points.target[i][5] = tweeningFns[Math.floor(Math.random() * tweeningFns.length)];
            // FIXME: buggy, makes points jump around too fast
            // points.target[i][3] = shiftPointCounter(points.original[i][3], maxShiftAmt);
        }
    }
    // clear pointShiftBiases now that they have been "used"
    pointShiftBiasX = 0;
    pointShiftBiasY = 0;

    return points;
}

function pullPoints (points, clickPos, pullRate, inertia, maxDist, counter, resetPoints, tweeningFn) {
    var targetXDiff, targetYDiff, originXDiff, originYDiff;
    for (var i = 0; i < points.target.length; i++) {
        targetXDiff = clickPos.x - points.target[i][0];
        targetYDiff = clickPos.y - points.target[i][1];
        originXDiff = clickPos.x - points.original[i][0];
        originYDiff = clickPos.y - points.original[i][1];
        if (Math.sqrt((targetXDiff * targetXDiff) + (targetYDiff * targetYDiff)) <= maxDist) {
            // point is within effect radius
            if (resetPoints) {
                // Good for changing directions, reset the points original positions to their current positions
                points.original[i][0] = points.tweened[i][0];
                points.original[i][1] = points.tweened[i][1];
            }
            points.target[i][0] += Math.round((targetXDiff + (inertia * originXDiff)) * pullRate); // pull X
            points.target[i][1] += Math.round((targetYDiff + (inertia * originYDiff)) * pullRate); // pull Y
            // shift the color of each point in effect radius by some configurable amount
            points.target[i][4] = shiftColor(points.original[i][4], clickColorShiftAmt);
            if (tweeningFn !== null) {
                // Also switch the tweening function for all affected points for additional effect
                // The tweening function will be re-assigned at the start of the point's next cycle
                points.target[i][4] = tweeningFn;
            }
            if (debug) {
                points.target[i][6] = true;  // marks this point as affected
            }

            // If this point's cycle is near it's end, bump it up some ticks to make the animation smoother
            if (relativeCounter(points.target[i][3]) > Math.roundcycleDuration - 10) {
                points.target[i][3] = (points.target[i][3] + Math.round(cycleDuration / 2)) % cycleDuration;
            }
        } else {
            if (debug) {
                points.target[i][6] = false;  // marks this point as unaffected
            }
        }
    }
}

function clearAffectedPoints (points) {
    for (var i = 0; i < points.target.length; i++) {
        points.target[i][6] = false;
    }
}

function redistributeCycles (points, oldCycleDuration, cycleDuration) {
    /* Given old and new cycleDuration, re-assign points' cycle starts that expand/compress to fit the new range in a
     * way that ensures the current progress of the point in its cycle is around the same percentage (so that the point
     * does not jump erratically back or forward in it's current trajectory).
     */
    // FIXME: if cycleDuration goes to 1 all points' cycles will be compressed to about the same value, and when
    // cycleDuration goes back up, the values will remain the same, making the points appear to dance in sync.
    var progress;
    for (var i = 0; i < points.original.length; i++) {
        progress = points.target[i][3] / oldCycleDuration;
        points.target[i][3] = Math.round(progress * cycleDuration);
    }
    return points;
}

function randomizeCycles (points, cycleDuration) {
    /* Assigns every point a new random cycle start */
    for (var i = 0; i < points.original.length; i++) {
        points.target[i][3] = randomInt(0, cycleDuration - 1);
    }
    return points;
}

function synchronizeCycles (points, cycleDuration) {
    /* Assigns every point the same cycle start (0) */
    for (var i = 0; i < points.original.length; i++) {
        points.target[i][3] = 0;
    }
    return points;
}

/* DRAW FUNCTIONS */

function drawPolygon (polygon, points, counter, tweeningFns) {
    var i, j, easingFn, relativeCount, avgColor, shadedColor, connectionCount, dist, connectivity, scale, nodeDiameter;
    // calculate vectors
    for (i = 0; i < points.original.length; i++) {
        easingFn = allTweeningFns[points.target[i][5]];
        relativeCount = relativeCounter(counter, points.target[i][3]);
        points.tweened[i][0] = easingFn(relativeCount, points.original[i][0], points.target[i][0] - points.original[i][0], cycleDuration);
        points.tweened[i][1] = easingFn(relativeCount, points.original[i][1], points.target[i][1] - points.original[i][1], cycleDuration);

        if (debug) {
            // draw vector trajectories
            if (points.target[i][6]) {
                polygon.lineStyle(1, 0x008b8b, 1);  // draw path different color if it is under effect of click/hover
            } else {
                polygon.lineStyle(1, 0x191970, 1);
            }
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
                if ((points.tweened[i][3] === counter) || (points.tweened[j][3] === counter)) {
                    // avgColor = shiftColor(avgColor, Math.round(colorShiftAmt * (1 - connectivity)));
                    points.tweened[i][4] = weightedAverageColor(points.tweened[i][4], points.tweened[j][4], connectivity);
                    points.tweened[j][4] = weightedAverageColor(points.tweened[j][4], points.tweened[i][4], connectivity);
                }
                avgColor = averageColor(points.tweened[i][4], points.tweened[j][4]);
                shadedColor = shadeColor(avgColor, connectivity);
                if (drawLines) {
                    polygon.lineStyle(lineSize, rgbToHex(shadedColor), 1);
                    polygon.moveTo(points.tweened[i][0], points.tweened[i][1]);
                    polygon.lineTo(points.tweened[j][0], points.tweened[j][1]);
                }
                connectionCount = connectionCount + 1;
            }
        }

        if (connectionCount === 0) {
            points.tweened[i][4] = shiftColor(points.tweened[i][4], disconnectedColorShiftAmt);
        }

        if (drawNodes) {
            // draw nodes
            nodeDiameter = nodeSize;
            scale = nodeDiameter / nodeImgRes;
            sprites[i].scale.x = scale;
            sprites[i].scale.y = scale;
            sprites[i].x = points.tweened[i][0] - (nodeDiameter / 2);
            sprites[i].y = points.tweened[i][1] - (nodeDiameter / 2);
            sprites[i].tint = rgbToHex(points.tweened[i][4]);
        }
    }
}

/* MAIN LOOP */

function loop () {
    screenWidth = window.innerWidth;
    screenHeight = window.innerHeight;
    renderer.resize(screenWidth, screenHeight);

    polygon.clear();

    if (reset === true) {
        var newPoints;
        clearSprites();
        newPoints = getRandomPoints(numPoints, screenWidth, screenHeight, zRange, tweeningFns);
        polygonPoints = {
            original: newPoints,
            target: JSON.parse(JSON.stringify(newPoints)),
            tweened: JSON.parse(JSON.stringify(newPoints))
        };
        reset = false;
    }

    if (click !== null) {
        if (clickEnd) {
            // apply "rebound" effects
            clickPullRate = clickPullRateEnd;
            clickInertia = clickInertiaEnd;
            clickTweeningFn = clickTweeningFnEnd;
            if (debug) {
                // draw debug click effect radius red color when clickEnd == true
                polygon.lineStyle(1, 0xDC143C, 1);
                polygon.drawCircle(click.x, click.y, clickMaxDist);
            }
        } else {
            if (debug) {
                // draw click effect radius blue when debug is on
                polygon.lineStyle(1, 0x483D8B, 1);
                polygon.drawCircle(click.x, click.y, clickMaxDist);
            }
        }

        // a pointer event is occuring and needs to affect the points in effect radius
        pullPoints(polygonPoints, click, clickPullRate, clickInertia, clickMaxDist, counter, clickEnd, clickTweeningFn);

        // slightly increase effect amount for next loop if click is still occuring
        if (clickMaxDist <= clickMaxDistMax) {
            clickMaxDist += clickMaxDistInc;
        }
        if (clickPullRate <= clickPullRateMax) {
            clickPullRate += clickPullRateInc;
        }

        if (clickEnd) {
            // done with rebound effect, re-initialize everything to prepare for next click
            click = null;
            clickEnd = false;
            clickMaxDist = clickMaxDistStart;
            clickPullRate = clickPullRateStart;
            clickInertia = clickInertiaStart;
            clickTweeningFn = clickTweeningFnStart;
            clearAffectedPoints(polygonPoints);
        }
    } else if (hover !== null) {
        if (lastHover !== null) {
            // hover effect radius grows bigger the faster the mouse moves
            hoverMaxDist += Math.min(Math.round(distancePos(hover, lastHover)), hoverMaxDistMax);
        }
        if (debug) {
            // draw hover effect radius yellow when debug is on
            polygon.lineStyle(1, 0xBDB76B, 1);
            polygon.drawCircle(hover.x, hover.y, hoverMaxDist);
        }

        // a hover event is occuring and needs to affect the points in effect radius
        pullPoints(polygonPoints, hover, hoverPushRate, hoverInertia, hoverMaxDist, counter, false, hoverTweeningFn);

        hoverMaxDist = hoverMaxDistStart;
        lastHover = hover;
    }

    // TODO: it would be cool to fill in triangles
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

    // points that have reached the end of their cycles need new targets
    polygonPoints = shiftPoints(polygonPoints, pointShiftDistance, counter, tweeningFns);

    // If user scrolled, modify cycleDuration by amount scrolled
    if (scrollDelta !== 0) {
        var oldCycleDuration = cycleDuration;
        cycleDuration = Math.round(cycleDuration + scrollDelta);
        if (cycleDuration < 1) {
            cycleDuration = 1;
        }
        scrollDelta = 0;
        polygonPoints = redistributeCycles(polygonPoints, oldCycleDuration, cycleDuration);

        // Update control inputs
        var timeRange = document.getElementsByName('timeRange')[0];
        var timeInput = document.getElementsByName('timeInput')[0];
        timeRange.value = cycleDuration;
        timeInput.value = cycleDuration;
    }

    // Tell the `renderer` to `render` the `stage`
    renderer.render(stage);
    window.requestAnimationFrame(loop);
}

function registerEventHandlers() {
    var tweeningInputs, debugCheckbox, fpsCheckbox, nodeCheckbox, linesCheckbox;
    tweeningInputs = document.getElementsByName('tweening');
    debugCheckbox = document.getElementsByName('debugToggle')[0];
    fpsCheckbox = document.getElementsByName('fpsCounterToggle')[0];
    nodesCheckbox = document.getElementsByName('nodesToggle')[0];
    linesCheckbox = document.getElementsByName('linesToggle')[0];

    /* MOUSE AND TOUCH EVENTS */

    window.addEventListener('wheel', function (e) {
        if (e.target.tagName !== 'CANVAS') return;
        scrollDelta = scrollDelta + e.deltaY;
    });

    window.addEventListener('touchstart', function (e) {
        if (e.target.tagName !== 'CANVAS') return;
        e.target.focus();
        click = getMousePos(e.changedTouches[0], resolution);
        clickEnd = false;
    });

    window.addEventListener('touchmove', function (e) {
        if (e.target.tagName !== 'CANVAS') return;
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
        if (e.target.tagName !== 'CANVAS') return;
        e.target.focus();
        click = getMousePos(e, resolution);
        clickEnd = false;
    });

    window.addEventListener('mousemove', function (e) {
        if (e.target.tagName !== 'CANVAS') return;
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
        clearAffectedPoints(polygonPoints);
    });

    document.addEventListener('mouseleave', function (e) {
        clickEnd = true;
        hover = null;
        lastHover = null;
        clearAffectedPoints(polygonPoints);
    });

    /* KEYBOARD EVENTS */

    window.addEventListener('keydown', function (e) {
        var i;
        if (e.target.tagName === 'INPUT') return;
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
            tweeningInputs[0].checked = true;
        } else if (e.keyCode === 50) { // 2
            tweeningFns = tweeningSets.meandering;
            tweeningInputs[1].checked = true;
        } else if (e.keyCode === 51) { // 3
            tweeningFns = tweeningSets.snappy;
            tweeningInputs[2].checked = true;
        } else if (e.keyCode === 52) { // 4
            tweeningFns = tweeningSets.bouncy;
            tweeningInputs[3].checked = true;
        } else if (e.keyCode === 53) { // 5
            tweeningFns = tweeningSets.elastic;
            tweeningInputs[4].checked = true;
        } else if (e.keyCode === 54) { // 6
            tweeningFns = tweeningSets.back;
            tweeningInputs[5].checked = true;
        } else if (e.keyCode === 70) { // f
            toggleFPS();
        } else if (e.keyCode === 68) { // d
            toggleDebug();
        } else if (e.keyCode === 78) { // n
            toggleNodes();
        } else if (e.keyCode === 76) { // l
            toggleLines();
        } else if (e.keyCode === 191) { // ?
            toggleHelp();
        }
    });

    /* BUTTON & INPUT EVENTS */

    document.getElementById('toggle-help').addEventListener('click', function () {
        toggleHelp();
    }, false);

    document.getElementById('toggle-controls').addEventListener('click', function () {
        toggleControls();
    }, false);

    document.getElementById('close-help').addEventListener('click', function () {
        toggleHelp();
    }, false);

    document.getElementById('close-controls').addEventListener('click', function () {
        toggleControls();
    }, false);

    document.getElementById('synchronize-cycles').addEventListener('click', function () {
        synchronizeCycles(polygonPoints, cycleDuration);
    }, false);

    document.getElementById('randomize-cycles').addEventListener('click', function () {
        randomizeCycles(polygonPoints, cycleDuration);
    }, false);

    document.getElementById('reset').addEventListener('click', function () {
        reset = true;
    }, false);

    var connectDistRange = document.getElementsByName('connectDistRange')[0];
    connectDistRange.value = connectionDistance;
    connectDistRange.addEventListener('input', function (e) {
        connectionDistance = parseInt(this.value, 10);
    });

    var connectDistInput = document.getElementsByName('connectDistInput')[0];
    connectDistInput.value = connectionDistance;
    connectDistInput.addEventListener('input', function (e) {
        connectionDistance = parseInt(this.value, 10);
    });

    var connectLimitRange = document.getElementsByName('connectLimitRange')[0];
    connectLimitRange.value = connectionLimit;
    connectLimitRange.addEventListener('input', function (e) {
        connectionLimit = parseInt(this.value, 10);
    });

    var connectLimitInput = document.getElementsByName('connectLimitInput')[0];
    connectLimitInput.value = connectionLimit;
    connectLimitInput.addEventListener('input', function (e) {
        connectionLimit = parseInt(this.value, 10);
    });

    var pointsNumRange = document.getElementsByName('pointsNumRange')[0];
    pointsNumRange.value = numPoints;
    pointsNumRange.addEventListener('input', function (e) {
        numPoints = parseInt(this.value, 10);
        polygonPoints = addOrRemovePoints(numPoints, polygonPoints);
    });

    var pointsNumInput = document.getElementsByName('pointsNumInput')[0];
    pointsNumInput.value = numPoints;
    pointsNumInput.addEventListener('input', function (e) {
        numPoints = parseInt(this.value, 10);
        polygonPoints = addOrRemovePoints(numPoints, polygonPoints);
    });

    var maxTravelRange = document.getElementsByName('maxTravelRange')[0];
    maxTravelRange.value = pointShiftDistance;
    maxTravelRange.addEventListener('input', function (e) {
        pointShiftDistance = parseInt(this.value, 10);
    });

    var maxTravelInput = document.getElementsByName('maxTravelInput')[0];
    maxTravelInput.value = pointShiftDistance;
    maxTravelInput.addEventListener('input', function (e) {
        pointShiftDistance = parseInt(this.value, 10);
    });

    var timeRange = document.getElementsByName('timeRange')[0];
    timeRange.value = cycleDuration;
    timeRange.addEventListener('input', function (e) {
        var oldCycleDuration = cycleDuration;
        cycleDuration = parseInt(this.value, 10);
        polygonPoints = redistributeCycles(polygonPoints, oldCycleDuration, cycleDuration);
    });

    var timeInput = document.getElementsByName('timeInput')[0];
    timeInput.value = cycleDuration;
    timeInput.addEventListener('input', function (e) {
        var oldCycleDuration = cycleDuration;
        if (this.value === '' || this.value === '0') return;
        cycleDuration = parseInt(this.value, 10);
        polygonPoints = redistributeCycles(polygonPoints, oldCycleDuration, cycleDuration);
    });

    var i;
    for (i = 0; i < tweeningInputs.length; i++) {
        tweeningInputs[i].addEventListener('change', function (e) {
            tweeningFns = tweeningSets[this.value];
        });
    }

    var pointSizeRange = document.getElementsByName('pointSizeRange')[0];
    pointSizeRange.value = nodeSize;
    pointSizeRange.addEventListener('input', function (e) {
        nodeSize = parseInt(this.value, 10);
    });

    var pointSizeInput = document.getElementsByName('pointSizeInput')[0];
    pointSizeInput.value = nodeSize;
    pointSizeInput.addEventListener('input', function (e) {
        nodeSize = parseInt(this.value, 10);
    });

    var lineSizeRange = document.getElementsByName('lineSizeRange')[0];
    lineSizeRange.value = lineSize;
    lineSizeRange.addEventListener('input', function (e) {
        lineSize = parseInt(this.value, 10);
    });

    var lineSizeInput = document.getElementsByName('lineSizeInput')[0];
    lineSizeInput.value = lineSize;
    lineSizeInput.addEventListener('input', function (e) {
        lineSize = parseInt(this.value, 10);
    });

    var colorShiftRange = document.getElementsByName('colorShiftRange')[0];
    colorShiftRange.value = disconnectedColorShiftAmt;
    colorShiftRange.addEventListener('input', function (e) {
        disconnectedColorShiftAmt = parseInt(this.value, 10);
    });

    var colorShiftInput = document.getElementsByName('colorShiftInput')[0];
    colorShiftInput.value = disconnectedColorShiftAmt;
    colorShiftInput.addEventListener('input', function (e) {
        disconnectedColorShiftAmt = parseInt(this.value, 10);
    });


    debugCheckbox.addEventListener('change', function (e) {
        toggleDebug();
    });

    fpsCheckbox.addEventListener('change', function (e) {
        toggleFPS();
    });

    nodesCheckbox.addEventListener('change', function (e) {
        toggleNodes();
    });

    linesCheckbox.addEventListener('change', function (e) {
        toggleLines();
    });
}

function loopStart () {
    screenWidth = window.innerWidth;
    screenHeight = window.innerHeight;
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
    connectionDistance = Math.min(Math.round(totalScreenPixels / 16), 75);
    pointShiftDistance = Math.round(totalScreenPixels / 45);
    clickMaxDistStart = Math.min(Math.round(totalScreenPixels / 20), clickMaxDistStart);
    hoverMaxDistStart = Math.min(Math.round(totalScreenPixels / 16), hoverMaxDistStart);
    polygon = new window.PIXI.Graphics();
    stage.addChild(polygon);
    numPoints = Math.round(totalScreenPixels / 6);
    startPoints = getRandomPoints(numPoints, screenWidth, screenHeight, zRange, tweeningFns);
    polygonPoints = {
        original: startPoints,
        target: JSON.parse(JSON.stringify(startPoints)),
        tweened: JSON.parse(JSON.stringify(startPoints))
    };

    fpsGraphic = new window.PIXI.Text('0', {font: '25px monospace', fill: 'yellow'});
    fpsGraphic.anchor = new window.PIXI.Point(1, 0);
    fpsGraphic.x = screenWidth - 1;
    fpsGraphic.y = 0;

    if (fpsEnabled) {
        stage.addChild(fpsGraphic);
    }

    lastLoop = new Date();

    scrollDelta = 0;

    // Try to fix bug where click initializes to a bogus value
    click = null;
    hover = null;

    registerEventHandlers();

    window.requestAnimationFrame(loop);
}

// Use PIXI loader to load image and then start animation
window.PIXI.loader
    .add(nodeImg)
    .load(loopStart);
