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
      })
    );
    return;
  }

  // polyfill for IE11 etc
  function CustomEvent(event, params) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    var evt = document.createEvent("CustomEvent");
    evt.initCustomEvent(
      event,
      params.bubbles,
      params.cancelable,
      params.detail
    );
    return evt;
  }
  CustomEvent.prototype = window.Event.prototype;
  window.CustomEvent = CustomEvent;
  el.dispatchEvent(
    new CustomEvent(eventName, {
      bubbles: true,
      detail: detail_ob,
    })
  );
};

export var pointIsInRect = function (point, rect) {
  if (
    point.x >= rect.left &&
    point.y >= rect.top &&
    point.x <= rect.right &&
    point.y <= rect.bottom
  ) {
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
export var getStripesGradientStopArray = function (_color_ar, _repetitions) {
  var rep,
    col,
    currentPos = 0,
    stop_ar = [],
    totalStops = _color_ar.length * _repetitions,
    stopSize = 1 / totalStops;

  for (rep = 0; rep < _repetitions; rep++) {
    for (col = 0; col < _color_ar.length; col++) {
      stop_ar.push({
        pos: currentPos,
        color: _color_ar[col],
      });
      currentPos += stopSize;
      stop_ar.push({
        pos: currentPos,
        color: _color_ar[col],
      });
    }
  }
  return stop_ar;
};

export var scaleImageData = function (imageData, scale, ctx) {
  var row,
    col,
    sourcePixel,
    x,
    y,
    destRow,
    destCol,
    scaledImageData = ctx.createImageData(
      imageData.width * scale,
      imageData.height * scale
    ),
    currentLineImageData = ctx.createImageData(scale, 1).data;

  for (row = 0; row < imageData.height; row++) {
    for (col = 0; col < imageData.width; col++) {
      sourcePixel = imageData.data.subarray(
        (row * imageData.width + col) * 4,
        (row * imageData.width + col) * 4 + 4
      );

      for (x = 0; x < scale; x++) {
        currentLineImageData.set(sourcePixel, x * 4);
      }

      for (y = 0; y < scale; y++) {
        destRow = row * scale + y;
        destCol = col * scale;
        scaledImageData.data.set(
          currentLineImageData,
          (destRow * scaledImageData.width + destCol) * 4
        );
      }
    }
  }

  return scaledImageData;
};

export var getRandomTrianglePointsWithinCircle = function (
  _radius,
  _numTriangles
) {
  // Give each point as degrees and distance from centre
  var i,
    j,
    trianglePoints = 3,
    allTriangles_ar = [],
    currentTriangle_ar;

  for (i = 0; i < _numTriangles; i++) {
    currentTriangle_ar = [];
    for (j = 0; j < trianglePoints; j++) {
      currentTriangle_ar.push({
        degrees: randomIntBetween(0, 359),
        distance: randomFloatBetween(0, _radius),
      });
    }
    allTriangles_ar.push(currentTriangle_ar);
  }

	return allTriangles_ar;
};

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

  return (
    "rgb(" +
    returnRgb_ar[0] +
    ", " +
    returnRgb_ar[1] +
    ", " +
    returnRgb_ar[2] +
    ")"
  );
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
    brightness2,
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

	Hash/URL parameter handling

---------------------------------------------------------
*/

/**
 * @function importHashParamsTo
 *
 * @description
 * #### Process the URL `location.hash` to import variables into the app
 *
 * @param { Object } _ob Info about how to process the query string
 * @param { Object } _ob.recipient_ob Object which will receive the parameters
 * @param { String[] } [ _ob.filter_ar ] List of parameters to be accepted (any others are ignored)
 */
export const importHashParamsTo = function (_ob) {
  const paramPairs = window.location.hash.slice(1).split("&");

  // Iterate the search parameters
  for (const pair of paramPairs) {
    const pair_ar = pair.split("=");
    let paramName = pair_ar[0];
    let paramValue = pair_ar[1];
    if (_ob.forceLowerCase) {
      if (paramName) {
        paramName = paramName.toLowerCase();
      }
      if (paramValue) {
        paramValue = paramValue.toLowerCase();
      }
    }
    if (Array.isArray(_ob.filter_ar)) {
      // Only accept parameters in the filter list
      for (const filterParam of _ob.filter_ar) {
        if (paramName === filterParam) {
          // Treat an existing but empty param as `true`, so eg `&item` is
          // imported as `&item=true`. If you want a truly empty param, it
          // should just not be in the hash at all. `setHashParam()` handles
          // this automatically.
          if (paramValue === undefined) {
            paramValue = true;
          }
          _ob.recipient_ob[paramName] = paramValue;
        }
      }
    }
  }
};

/**
 * @function setHashParam
 *
 * @description
 * #### Add or remove a parameter in the `location.hash` portion of the URL
 *
 * @param { String } _fullParams_ar An array of all params accepted by the app
 * (same as passed to `importHashParamsTo()`). This will be used to order the
 * parameters in the re-written hash.
 * @param { String } _name The parameter name
 * @param { String } [ _value ] The parameter value, if missing or `undefined` the parameter will be omitted
 *
 * `_value`s of `true` or `'true'` are treated as a special case, and in the
 * re-written hash they will be left empty eg `&item=true` becomes `&item`.
 * This is to keep the hash short and friendly, as in this game people may want
 * to share URLs or edit them eg to jump to a specific level.
 *
 *
 * To reiterate the above:
 *
 * Although the **re-written** hash will omit `true`s, when calling this
 * function if you want true you must pass `_value` as true. An omitted
 * `_value` is taken to mean the parameter should be deleted.
 */
export const setHashParam = function (_fullParams_ar, _name, _value) {
  let currentHash = window.delayedLocationHash || window.location.hash,
    hash_str = "#";

  // Get existing parameters from the URL hash
  const existingParams = {};
  for (const pair of currentHash.slice(1).split("&")) {
    const pair_ar = pair.split("=");
    if (!pair_ar[1]) {
      pair_ar[1] = true;
    }
    existingParams[pair_ar[0]] = pair_ar[1];
  }

  // Add/overwrite or delete the param (_name) we're setting
  if (_value !== undefined) {
    existingParams[_name] = _value;
  } else {
    delete existingParams[_name];
  }

  // Rewrite hash string, filling in the params in the order of `_fullParams_ar`
  for (let i = 0; i < _fullParams_ar.length; i++) {
    const checkedParamName = _fullParams_ar[i];
    // Treat `true`/`'true'` as a special case and just use an empty param
    if (existingParams[checkedParamName]) {
      if (
        existingParams[checkedParamName] === true ||
        existingParams[checkedParamName] === "true"
      ) {
        hash_str += checkedParamName + "&";
      } else {
        hash_str +=
          checkedParamName + "=" + existingParams[checkedParamName] + "&";
      }
    }
  }

  // Remove trailing ampersand
  hash_str = hash_str.replace(/&$/, "");

  // Sometimes this function might be called several times consecutively, the intention being to instantly update the hash in several steps. This pollutes the history as every change to `window.location.hash` updates live.
  // Here we use a timeout to prevent this. Cache the changes to a global variable, check that first when reading the hash. Make sure the variable is deleted after the update so as not to pollute global scope.
  // Use a zero timeout, meaning the callback will happen as soon as the rest of the current event loop has finished, with no added delay.
  window.delayedLocationHash = hash_str;

  clearTimeout(window.locationHashChangeTimeout);
  window.locationHashChangeTimeout = window.setTimeout(function () {
    window.location.hash = hash_str;
    window.delayedLocationHash = undefined;
  }, 0);
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
  if (window.RcSpaceInvaders.hashParams && window.RcSpaceInvaders.hashParams.debug) {
    // `debug` param comes from the query string, so is a string, **not** a boolean
    if (
      window.RcSpaceInvaders.hashParams.debug === true ||
      window.RcSpaceInvaders.hashParams.debug === "true" ||
      window.RcSpaceInvaders.hashParams.debug === "overlay"
    ) {
      if (_format) {
        console.log("%c" + _msg, _format);
      } else {
        console.log(_msg);
      }
    }
    if (window.RcSpaceInvaders.hashParams.debug === "overlay") {
      // Create debug element in DOM if it doesn't already exist
      if (!window.debug_el) {
        window.debug_el = document.createElement("div");
        window.debug_el.id = "debug";
        document.body.insertBefore(window.debug_el, document.body.firstChild);
      }

      // Create element and style it if necessary
      const el = document.createElement("p");
      el.innerText = _msg;
      if (_format) {
        el.style = _format;
      }

      // Add element to debug area and scroll to the latest item
      window.debug_el.appendChild(el);
      window.debug_el.scrollTop = window.debug_el.scrollHeight;
    }
  }
};
