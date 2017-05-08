
// These functions are taken from: https://github.com/danro/jquery-easing/blob/master/jquery.easing.js
// (with slight modifications to the function signatures)

function linearTweening (t, b, c, d) {
    // t = current time
    // b = start value
    // c = change in value
    // d = duration
  return ((c * t) / d) + b
}

function easeOutBounce (t, b, c, d) {
  if ((t /= d) < (1 / 2.75)) {
    return c * (7.5625 * t * t) + b
  } else if (t < (2 / 2.75)) {
    return c * (7.5625 * (t -= (1.5 / 2.75)) * t + 0.75) + b
  } else if (t < (2.5 / 2.75)) {
    return c * (7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375) + b
  } else {
    return c * (7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375) + b
  }
}

function easeInSine (t, b, c, d) {
  return -c * Math.cos(t / d * (Math.PI / 2)) + c + b
}

function easeOutSine (t, b, c, d) {
  return c * Math.sin(t / d * (Math.PI / 2)) + b
}

function easeInOutSine (t, b, c, d) {
  return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b
}

function easeInQuad (t, b, c, d) {
  return c * (t /= d) * t + b
}

function easeOutQuad (t, b, c, d) {
  return -c * (t /= d) * (t - 2) + b
}

function easeInOutQuad (t, b, c, d) {
  if ((t /= d / 2) < 1) return c / 2 * t * t + b
  return -c / 2 * ((--t) * (t - 2) - 1) + b
}

function easeInCubic (t, b, c, d) {
  return c * (t /= d) * t * t + b
}

function easeOutCubic (t, b, c, d) {
  return c * ((t = t / d - 1) * t * t + 1) + b
}

function easeInOutCubic (t, b, c, d) {
  if ((t /= d / 2) < 1) return c / 2 * t * t * t + b
  return c / 2 * ((t -= 2) * t * t + 2) + b
}

function easeInExpo (t, b, c, d) {
  return (t == 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b
}

function easeOutExpo (t, b, c, d) {
  return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b
}

function easeInOutExpo (t, b, c, d) {
  if (t == 0) return b
  if (t == d) return b + c
  if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b
  return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b
}

function easeInElastic (t, b, c, d) {
  var s = 1.70158; var p = 0; var a = c
  if (t == 0) return b; if ((t /= d) == 1) return b + c; if (!p) p = d * 0.3
  if (a < Math.abs(c)) { a = c; var s = p / 4 }	else var s = p / (2 * Math.PI) * Math.asin(c / a)
  return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b
}

function easeOutElastic (t, b, c, d) {
  var s = 1.70158; var p = 0; var a = c
  if (t == 0) return b; if ((t /= d) == 1) return b + c; if (!p) p = d * 0.3
  if (a < Math.abs(c)) { a = c; var s = p / 4 }	else var s = p / (2 * Math.PI) * Math.asin(c / a)
  return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b
}

function easeInOutElastic (t, b, c, d) {
  var s = 1.70158; var p = 0; var a = c
  if (t == 0) return b; if ((t /= d / 2) == 2) return b + c; if (!p) p = d * (0.3 * 1.5)
  if (a < Math.abs(c)) { a = c; var s = p / 4 }	else var s = p / (2 * Math.PI) * Math.asin(c / a)
  if (t < 1) return -0.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b
  return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * 0.5 + c + b
}

function easeInCirc (t, b, c, d) {
  return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b
}

function easeOutCirc (t, b, c, d) {
  return c * Math.sqrt(1 - (t = t / d - 1) * t) + b
}

function easeInOutCirc (t, b, c, d) {
  if ((t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b
  return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b
}
