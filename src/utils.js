// SPDX-License-Identifier: GPL-3.0-only

/*
---------------------------------------------------------

	General Purpose Utility Functions

---------------------------------------------------------
*/
export var padString = function (str, pad) {
  var str = "" + str,
    return_str = str;

  if (str.length < pad.length) {
    return_str = pad.substr(0, pad.length - str.length) + str;
  }
  ///logMsg(pad + " || " + str + " --> " + return_str);
  return return_str;
};

export var removeChildFromParent = function (el) {
  if (el?.parentNode) {
    el.parentNode.removeChild(el);
  }
};

export var isEmpty = function (str) {
  return !str || str.length === 0;
};

/*
	This function has an unusual structure whereby if window.CustomEvent
	already exists it dispatches the event then returns. This is because
	wrapping the polyfill `function CustomEvent` definition inside an if/else
	block	is disallowed by `use: strict`, causing an error in Safari
*/
export var manualEvent = function (el, eventName, detail_ob) {
  if (typeof window.CustomEvent === "function") {
    el.dispatchEvent(
      new CustomEvent(eventName, {
        bubbles: true,
        detail: detail_ob,
      }),
    );
    return;
  }

  // polyfill for IE11 etc
  function CustomEvent(event, params) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    var evt = document.createEvent("CustomEvent");
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
    return evt;
  }
  CustomEvent.prototype = window.Event.prototype;
  window.CustomEvent = CustomEvent;
  el.dispatchEvent(
    new CustomEvent(eventName, {
      bubbles: true,
      detail: detail_ob,
    }),
  );
};

export var pointIsInRect = function (point, rect) {
  if (point.x >= rect.left && point.y >= rect.top && point.x <= rect.right && point.y <= rect.bottom) {
    return true;
  } else {
    return false;
  }
};

/*
---------------------------------------------------------

	Graphics

---------------------------------------------------------
*/

export var getOffscreenOrNormalCanvas = function () {
  return "OffscreenCanvas" in window
    ? document.createElement("canvas").transferControlToOffscreen()
    : document.createElement("canvas");
};

/*
---------------------------------------------------------

	Trigonometry / Pythagoras

---------------------------------------------------------
*/
export var circleAreaFromRadius = function (_radius) {
  return Math.PI * _radius * _radius;
};

export var vectorToDegrees = function (vector) {
  var radians = Math.atan2(vector.y, vector.x),
    degrees = radiansToDegrees(radians);

  return modulo(Math.round(degrees), 360);
};

export var degreesToVector = function (degrees) {
  var radians = degreesToRadians(degrees);
  return {
    x: Math.cos(radians),
    y: Math.sin(radians),
  };
};

export var degreesToRadians = function (degrees) {
  return degrees * (Math.PI / 180);
};

export var radiansToDegrees = function (radians) {
  return radians * (180 / Math.PI);
};

export var getDistanceBetweenPoints = function (p1, p2) {
  var a = Math.abs(p1.x - p2.x),
    b = Math.abs(p1.y - p2.y);
  return Math.sqrt(a * a + b * b);
};

export var getSquaredDistanceBetweenPoints = function (p1, p2) {
  var a = Math.abs(p1.x - p2.x),
    b = Math.abs(p1.y - p2.y);
  return a * a + b * b;
};

/*
---------------------------------------------------------

	Vectors

---------------------------------------------------------
*/

export var vectorRotateByDegrees = function (vector, degrees) {
  var currentDegrees = vectorToDegrees(vector);
  return degreesToVector(currentDegrees + degrees);
};

export var vectorGetDotProduct = function (v1, v2) {
  return v1.x * v2.x + v1.y * v2.y;
};

export var vectorAdd = function (v1, v2) {
  return {
    x: v1.x + v2.x,
    y: v1.y + v2.y,
  };
};

export var vectorSubtract = function (v1, v2) {
  return {
    x: v1.x - v2.x,
    y: v1.y - v2.y,
  };
};

export var vectorMultiply = function (v1, v2) {
  return {
    x: v1.x * v2.x,
    y: v1.y * v2.y,
  };
};

export var vectorScalarMultiply = function (vector, scalar) {
  return {
    x: vector.x * scalar,
    y: vector.y * scalar,
  };
};

export var vectorGetUnitNormal = function (vector) {
  return {
    x: (-1 * vector.y) / Math.sqrt(vector.x * vector.x + vector.y * vector.y),
    y: vector.x / Math.sqrt(vector.x * vector.x + vector.y * vector.y),
  };
};

export const vectorGetMagnitude = function (vector) {
  return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
};

/*
---------------------------------------------------------

	Other number stuff

---------------------------------------------------------
*/
export var modulo = function (n, mod) {
  return ((n % mod) + mod) % mod;
};

export var roundToPlaces = function (number, places) {
  return Number(Math.round(number + "e" + places) + "e-" + places);
};

export var randomIntBetween = function (min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

export var randomFloatBetween = function (min, max) {
  return Math.random() * (max - min) + min;
};

export var getRandomItemFromArray = function (ar) {
  return ar[Math.floor(Math.random() * ar.length)];
};

export var getNearestEvenNumber = function (num) {
  return 2 * Math.round(num / 2);
};

export var isEvenNumber = function (num) {
  return num / 2 === Math.floor(num / 2);
};

/*
---------------------------------------------------------

	Colours

---------------------------------------------------------
*/
export const toHex = (x) => {
  const hex = Math.round(x).toString(16);
  //logMsg('x: ' + x);
  //logMsg('hex: ' + hex);
  return hex.length === 1 ? "0" + hex : hex;
};

export var rgbToHex = function (r, g, b) {
  return "#" + toHex(r) + toHex(g) + toHex(b);
};

export var hexOpacityToRGBA = function (hexColor, opacity) {
  var r, g, b;
  // skip first character '#'
  r = parseInt(hexColor.substring(1, 3), 16);
  g = parseInt(hexColor.substring(3, 5), 16);
  b = parseInt(hexColor.substring(5, 7), 16);
  return "rgba(" + r + ", " + g + ", " + b + ", " + opacity + ")";
};

export var hexToRGB_ar = function (hex) {
  var bigint;

  // trim leading hash
  if (hex.substr(0, 1) === "#") {
    hex = hex.substr(1);
  }

  bigint = parseInt(hex, 16);

  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
};

export var getFadeStepBetweenRGBColorsArray = function (color1, color2, steps) {
  var rgb1_ar = rgbToRGB_ar(color1),
    rgb2_ar = rgbToRGB_ar(color2);
  //__("steps: " + steps);
  //__("Number(rgb2_ar[0]): " + Number(rgb2_ar[0]));
  //__("Number(rgb1_ar[0]): " + Number(rgb1_ar[0]));
  //  __("Number(rgb2_ar[0]) - Number(rgb1_ar[0]) / steps: " + (( Number(rgb2_ar[0]) - Number(rgb1_ar[0])) / steps ));
  return [
    (Number(rgb2_ar[0]) - Number(rgb1_ar[0])) / steps,
    (Number(rgb2_ar[1]) - Number(rgb1_ar[1])) / steps,
    (Number(rgb2_ar[2]) - Number(rgb1_ar[2])) / steps,
  ];
};

export var addFadeStepToRGB = function (rgb, rgbStep_ar) {
  var rgb_ar = rgbToRGB_ar(rgb),
    returnRgb_ar = [
      Number(rgb_ar[0]) + Number(rgbStep_ar[0]),
      Number(rgb_ar[1]) + Number(rgbStep_ar[1]),
      Number(rgb_ar[2]) + Number(rgbStep_ar[2]),
    ];

  return "rgb(" + returnRgb_ar[0] + ", " + returnRgb_ar[1] + ", " + returnRgb_ar[2] + ")";
};

export var rgbToRGB_ar = function (rgb) {
  return rgb.replace(/[^\d,.]/g, "").split(",");
};

export var getBrightnessFromRGBAr = function (ar) {
  //return ((299 * ar[0]) + (587 * ar[1]) + (114 * ar[2])) / 1000;
  return (ar[0] + ar[0] + ar[2] + ar[1] + ar[1] + ar[1]) / 6;
};

export var hslToHex = function (h, s, l) {
  h /= 360;
  s /= 100;
  l /= 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  const toHex = (x) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

export var getRandomHSLColorArray = function (tone) {
  var saturation,
    lightness,
    hue = Math.floor(Math.random() * 360);
  if (tone === undefined) {
    saturation = Math.floor(Math.random() * 100);
    lightness = Math.floor(Math.random() * 100);
  } else if (tone.toUpperCase() === "LIGHT") {
    saturation = Math.floor(Math.random() * 100);
    lightness = 80 + Math.floor(Math.random() * 20);
  } else if (tone.toUpperCase() === "DARK") {
    saturation = 30 + Math.floor(Math.random() * 40);
    lightness = Math.floor(Math.random() * 50);
  }
  return [hue, saturation, lightness];
};

export var getRandomHexColor = function (tone) {
  var hsl_ar = getRandomHSLColorArray(tone);
  return hslToHex.apply(null, hsl_ar);
};

export var getRandomContrastingHexColor = function (hexColor, minContrast) {
  var brightness1,
    c1RGB_ar,
    hexContrasting,
    c2RGB_ar = hexToRGB_ar(hexColor),
    brightness2 = getBrightnessFromRGBAr(c2RGB_ar);
  do {
    hexContrasting = getRandomHexColor();
    c1RGB_ar = hexToRGB_ar(hexContrasting);
    brightness1 = getBrightnessFromRGBAr(c1RGB_ar);
    //logMsg("brightness1: " + brightness1);
    //logMsg((brightness1 + 0.05) / brightness2 + 0.05);
  } while (Math.abs(brightness1 - brightness2) < minContrast);

  //logMsg("hexContrasting: " + hexContrasting);
  return hexContrasting;
};

/*
---------------------------------------------------------

	Logging

---------------------------------------------------------
*/
/**
 * @function __
 *
 * @description
 * #### Logging function. **To be used everywhere instead of `console.log()`**.
 *
 * The name "__" is chosen to be short and clean. When visually scanning code it looks
 * a bit like indentation so can help differentiate from normal non-logging lines of code.
 *
 * With this function logging can be enabled/disabled via a query string parameter in the URL hash:
 * - `?debug=true` displays console output
 * - `?debug=overlay` displays console output and also displays output in a floating element
 *     (useful for logging to eg mobile browsers when we can't access developer tools easily)
 * - If `?debug` is missing or not set to any of the above values, logging is disabled

 * @param { String } _msg Message to be logged to console and/or printed to screen
 * @param { String } [ _format ] CSS style to apply to message
 */
export const __ = function (_msg, _format) {
  if (_format) {
    console.log("%c" + _msg, _format);
  } else {
    console.log(_msg);
  }
};
