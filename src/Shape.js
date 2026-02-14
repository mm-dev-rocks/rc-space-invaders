/**
 * @license GPL-3.0-only
 *
 * @author Mark Mayes / mm-dev
 *
 *
 * @module Shape
 *
 * @description
 * ## Draw basic polygon-type shapes
 */

import { GRADIENT_TYPE } from "./RCSI/ENUM.js";
import * as GAME from "./RCSI/GAME.js";

import { Display } from "./Display.js";
import { Layout } from "./Layout.js";

import { degreesToRadians, degreesToVector, hexOpacityToRGBA, vectorGetUnitNormal } from "./utils.js";

class Shape {}

/**
 * @function updateSizes
 * @static
 *
 * @description
 * ##### Update the generic outer stroke thickness based on the current layout/viewport
 */
Shape.updateSizes = function () {
  Shape.strokeThickness = Math.round(GAME.SHAPE_STROKE_THICKNESS * Layout.proportionalMultiplier);
};

/**
 * @function drawCircle
 * @static
 *
 * @description
 * ##### Draw a basic gradient-filled circle
 *
 * @param {number} _x - X coordinate to draw at
 * @param {number} _y - Y coordinate to draw at
 * @param {object} _data - Other details
 */
Shape.drawCircle = function (_x, _y, _data) {
  var gradient = Shape.getThingGradient(_x, _y, _data);

  Display.ctx.beginPath();
  Display.ctx.arc(_x, _y, _data.radius, 0, GAME.PIx2);

  if (_data.useDefaultStroke) {
    Shape.defaultStrokeCurrentPath();
  }

  Display.ctx.fillStyle = gradient;
  Display.ctx.fill();
};

Shape.drawSkewedCircle = function (_x, _y, _thing) {
  var /*
ctx.transform(
  [Increases or decreases the size of the pixels horizontally],
  [This effectively angles the X axis up or down],
  [This effectively angles the Y axis left or right],
  [Increases or decreases the size of the pixels vertically],
  [Moves the whole coordinate system horizontally],
  [Moves the whole coordinate system vertically],
)

  */
    // Skew x coordinates by angle skewHorizRadians
    skewHorizDegrees = 90,
    skewHorizRadians = degreesToRadians(skewHorizDegrees),
    // Skew y coordinates by angle skewVertRadians
    skewVertDegrees = 0,
    skewVertRadians = degreesToRadians(skewVertDegrees),
    //offsetX = Math.sin(_thing.radius * skewHorizRadians),
    //offsetY = Math.cos(_thing.radius * skewVertRadians)
    //offsetX = Math.sin(skewVertRadians) * _thing.radius * 2,
    offsetX = 0,
    offsetY = 0;
  // opposite = Math.tan(0.915)*60
  //offsetY = 0
  //offsetY = _thing.radius * skewVertRadians
  Display.ctx.save();

  //Display.ctx.translate(Layout.canvasWidth / 2, Layout.canvasHeight / 2);
  Display.ctx.translate(_x, _y);
  Display.ctx.transform(1, skewHorizRadians, skewVertRadians, 1, 0, 0);
  //Display.ctx.rotate(skewVertRadians);
  //Display.ctx.rotate(skewHorizRadians);

  Display.ctx.beginPath();
  Display.ctx.arc(_x, _y, _thing.radius, 0, GAME.PIx2);

  if (_thing.useDefaultStroke) {
    Shape.defaultStrokeCurrentPath();
  }

  Display.ctx.fillStyle = Shape.getThingGradient(_x, _y, _thing);
  Display.ctx.fill();
  //Display.ctx.strokeStyle = "red";
  //Display.ctx.stroke();

  Display.ctx.restore();
};

/**
 * @function drawEllipse
 * @static
 *
 * @description
 * ##### Draw an ellipse
 *
 * @param {number} _x
 * @param {number} _y
 * @param {number} _radius
 * @param {string} _color
 * @param {number} _stretch
 * @param {number} _angleDegrees
 */
Shape.drawEllipse = function (_x, _y, _radius, _color, _stretch, _angleDegrees) {
  var radians = degreesToRadians(_angleDegrees);

  Display.ctx.beginPath();
  Display.ctx.ellipse(Math.round(_x), Math.round(_y), _radius, _radius * _stretch, radians, 0, GAME.PIx2);
  Display.ctx.fillStyle = _color;
  Display.ctx.fill();
};

/**
 * @function getThingGradient
 * @static 
 *
 * @description
 * ##### Draw a gradient based on thing properties
 * - Matches size and rotation of the gradient to the thing
 * - Uses defaults where properties aren't specified
 *
 * @param {number} _x - X coordinate to draw at
 * @param {number} _y - Y coordinate to draw at
 * @param {object} _thing - The thing to get properties from
 * @param {object} _thing.gradient - Details about the gradient to be applied
 * @param {object[]} _thing.gradient.stop_ar - Gradient stops in `{pos, color}` format
 * @param {GRADIENT_TYPE} _thing.gradient.type - Eg linear/radial
 * @param {number} _thing.gradient.fadePoint - Used to fade the default gradient out to the background colour of the current level (`0` to `1` - `0` means fade from centre, `1` would be the outer edge so effectively no fade)
 j
 * @returns {CanvasGradient}
 */
Shape.getThingGradient = function (_x, _y, _thing) {
  var i,
    gradient,
    gradientType = _thing.gradient?.type || GRADIENT_TYPE.RADIAL,
    gradientStop_ar = _thing.gradient?.stop_ar || [
      { pos: 0, color: _thing.color },
      {
        pos: _thing.gradientFadePoint || GAME.THING_FADE_GRADIENT_STOP,
        color: _thing.color,
      },
      { pos: 1, color: Display.bgColor },
    ],
    directionVector = degreesToVector(_thing.rotation + (_thing.gradient?.rotation || 0));

  if (_thing.gradient?.offsetX) {
    _x += _thing.gradient.offsetX * _thing.radius;
  }
  if (_thing.gradient?.offsetY) {
    _y += _thing.gradient.offsetY * _thing.radius;
  }

  switch (gradientType) {
    case GRADIENT_TYPE.LINEAR:
      gradient = Display.ctx.createLinearGradient(
        _x - directionVector.x * _thing.radius,
        _y - directionVector.y * _thing.radius,
        _x + directionVector.x * _thing.radius,
        _y + directionVector.y * _thing.radius,
      );
      break;
    case GRADIENT_TYPE.RADIAL:
      gradient = Display.ctx.createRadialGradient(_x, _y, _thing.radius / 2, _x, _y, _thing.radius);
      break;
    case GRADIENT_TYPE.LINEAR_TUMBLING:
      gradient = Display.ctx.createLinearGradient(
        _x - _thing.radius,
        _y - _thing.radius,
        _x + Math.cos(_thing.rotation) * _thing.radius * 2,
        _y + Math.sin(_thing.rotation) * _thing.radius * 2,
      );
      break;
    case GRADIENT_TYPE.RADIAL_TUMBLING:
      gradient = Display.ctx.createRadialGradient(
        _x + Math.cos(_thing.rotation) * _thing.radius * 1.2,
        _y + Math.sin(_thing.rotation) * _thing.radius * 1.2,
        _thing.radius / 2,
        _x + Math.cos(_thing.rotation) * _thing.radius * 1.2,
        _y + Math.sin(_thing.rotation) * _thing.radius * 1.2,
        _thing.radius,
      );
      break;
    default:
      break;
  }

  for (i = 0; i < gradientStop_ar.length; i++) {
    gradient.addColorStop(gradientStop_ar[i].pos, gradientStop_ar[i].color);
  }

  return gradient;
};

/**
 * @function drawSquarcle
 * @static
 *
 * @description
 * ##### Draw a combined square and circle
 * - Used eg for bullets, ghosts
 *
 * @param {number} _x
 * @param {number} _y
 * @param {object} _thing
 */
Shape.drawSquarcle = function (_x, _y, _thing) {
  var fillStyle = _thing.gradient ? Shape.getThingGradient(_x, _y, _thing) : _thing.color,
    directionVector = degreesToVector(_thing.rotation),
    directionVectorNormal = vectorGetUnitNormal(directionVector),
    arcRotation = _thing.rotation + 90;

  // Semicircle
  Display.ctx.beginPath();
  Display.ctx.arc(_x, _y, _thing.radius, degreesToRadians(arcRotation + 180), degreesToRadians(arcRotation));

  // Rectangle
  Display.ctx.moveTo(_x - directionVectorNormal.x * _thing.radius, _y - directionVectorNormal.y * _thing.radius);

  Display.ctx.lineTo(
    _x - directionVectorNormal.x * _thing.radius - directionVector.x * _thing.radius,
    _y - directionVectorNormal.y * _thing.radius - directionVector.y * _thing.radius,
  );

  Display.ctx.lineTo(
    _x + directionVectorNormal.x * _thing.radius - directionVector.x * _thing.radius,
    _y + directionVectorNormal.y * _thing.radius - directionVector.y * _thing.radius,
  );

  Display.ctx.lineTo(_x + directionVectorNormal.x * _thing.radius, _y + directionVectorNormal.y * _thing.radius);

  if (_thing.useDefaultStroke) {
    Shape.defaultStrokeCurrentPath();
  }
  Display.ctx.fillStyle = fillStyle;
  Display.ctx.fill();
};

/**
 * @function drawStar
 * @static
 *
 * @description
 * ##### Draw a star shape
 *
 * @param {number} _x
 * @param {number} _y
 * @param {object} _thing
 * @param {number} _thing.numAppendages - Number of points of the star
 * @param {number} _thing.shapeCenterRadiusDivisor - Size of the central fill based on the radius of the thing
 * @param {boolean} _thing.useDefaultStroke - If `true` add the standard stroke around the shape
 */
Shape.drawStar = function (_x, _y, _thing) {
  var i,
    x1,
    y1,
    x2,
    y2,
    angle1,
    angle2,
    angle3,
    fillStyle = _thing.gradient ? Shape.getThingGradient(_x, _y, _thing) : _thing.color;

  Display.ctx.moveTo(Math.round(_x), Math.round(_y));
  Display.ctx.beginPath();
  for (i = 0; i < _thing.numAppendages; i++) {
    angle1 = (GAME.PIx2 / _thing.numAppendages) * i;
    angle2 = (GAME.PIx2 / _thing.numAppendages) * (i + 1);
    angle3 = (GAME.PIx2 / _thing.numAppendages) * (i + 2);

    angle1 += _thing.rotation;
    angle2 += _thing.rotation;
    angle3 += _thing.rotation;

    // TODO degreesToVector?
    x1 = (_thing.radius / _thing.shapeCenterRadiusDivisor) * Math.sin(angle1) + _x;
    y1 = (_thing.radius / _thing.shapeCenterRadiusDivisor) * Math.cos(angle1) + _y;
    x2 = _thing.radius * Math.sin(angle2) + _x;
    y2 = _thing.radius * Math.cos(angle2) + _y;
    x3 = (_thing.radius / _thing.shapeCenterRadiusDivisor) * Math.sin(angle3) + _x;
    y3 = (_thing.radius / _thing.shapeCenterRadiusDivisor) * Math.cos(angle3) + _y;

    Display.ctx.lineTo(x1, y1);
    Display.ctx.lineTo(x2, y2);
    Display.ctx.lineTo(x3, y3);
  }
  Display.ctx.closePath();

  if (_thing.useDefaultStroke) {
    Shape.defaultStrokeCurrentPath();
  }
  Display.ctx.fillStyle = fillStyle;
  Display.ctx.fill();
};

/**
 * @function defaultStrokeCurrentPath
 * @static
 *
 * @description
 * ##### Add a stroke/outline to a shape
 * The stroke is coloured as a translucent version of the background colour of the current level
 */
Shape.defaultStrokeCurrentPath = function () {
  Display.ctx.lineWidth = Shape.strokeThickness;
  Display.ctx.strokeStyle = hexOpacityToRGBA(Display.bgColor, GAME.SHAPE_STROKE_ALPHA);
  Display.ctx.stroke();
};

/**
 * @function drawFlower
 * @static
 *
 * @description
 * ##### Draw a star shape
 *
 * @param {number} _x
 * @param {number} _y
 * @param {object} _thing
 * @param {number} _thing.numAppendages - Number of petals of the flower
 * @param {number} _thing.shapeCenterColor - Colour to use for the flower centre
 * @param {number} _thing.shapeCenterRadiusDivisor - Size of the central fill based on the radius of the thing
 * @param {boolean} _thing.useDefaultStroke - If `true` add the standard stroke around the shape
 */
Shape.drawFlower = function (_x, _y, _thing) {
  var i,
    x1,
    y1,
    x2,
    y2,
    angle1,
    angle2,
    // Collisions with flower petals happened too far away due to bezier curves, this adjusts the draw distance to make things feel more accurate
    petalCurveAllowance = (_thing.radius / _thing.numAppendages) * Math.PI,
    petalRadius = _thing.radius + petalCurveAllowance,
    fillStyle = _thing.gradient ? Shape.getThingGradient(_x, _y, _thing) : _thing.color;

  // petals
  Display.ctx.beginPath();
  Display.ctx.moveTo(Math.round(_x), Math.round(_y));
  for (i = 0; i < _thing.numAppendages; i++) {
    angle1 = (GAME.PIx2 / _thing.numAppendages) * (i + 1);
    angle2 = (GAME.PIx2 / _thing.numAppendages) * i;

    angle1 += _thing.rotation;
    angle2 += _thing.rotation;

    x1 = petalRadius * Math.sin(angle1) + _x;
    y1 = petalRadius * Math.cos(angle1) + _y;
    x2 = petalRadius * Math.sin(angle2) + _x;
    y2 = petalRadius * Math.cos(angle2) + _y;

    Display.ctx.bezierCurveTo(x1, y1, x2, y2, _x, _y);
  }
  Display.ctx.closePath();

  if (_thing.useDefaultStroke) {
    Shape.defaultStrokeCurrentPath();
  }
  Display.ctx.fillStyle = fillStyle;
  Display.ctx.fill();

  // center
  Display.ctx.beginPath();
  Display.ctx.arc(_x, _y, _thing.radius / _thing.shapeCenterRadiusDivisor, 0, GAME.PIx2);
  //Display.ctx.closePath();
  Display.ctx.fillStyle = _thing.shapeCenterColor || fillStyle;
  Display.ctx.fill();
};

export { Shape };
