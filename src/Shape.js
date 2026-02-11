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

import { GRADIENT_TYPE } from "./PD/ENUM.js";
import * as GAME from "./PD/GAME.js";

import { Display } from "./Display.js";
import { Layout } from "./Layout.js";

import {
  degreesToRadians,
  degreesToVector,
  hexOpacityToRGBA,
  vectorGetUnitNormal,
} from "./utils.js";

class Shape {}

/**
 * @function updateSizes
 * @static
 *
 * @description
 * ##### Update the generic outer stroke thickness based on the current layout/viewport
 */
Shape.updateSizes = function () {
  Shape.strokeThickness = Math.round(
    GAME.SHAPE_STROKE_THICKNESS * Layout.proportionalMultiplier
  );
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
  var gradient = Shape.getObstacleGradient(_x, _y, _data);

  Display.ctx.beginPath();
  Display.ctx.arc(_x, _y, _data.radius, 0, GAME.PIx2);

  if (_data.useDefaultStroke) {
    Shape.defaultStrokeCurrentPath();
  }

  Display.ctx.fillStyle = gradient;
  Display.ctx.fill();
};

Shape.drawSkewedCircle = function (_x, _y, _obstacle) {
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
    //offsetX = Math.sin(_obstacle.radius * skewHorizRadians),
    //offsetY = Math.cos(_obstacle.radius * skewVertRadians)
    //offsetX = Math.sin(skewVertRadians) * _obstacle.radius * 2,
    offsetX = 0,
    offsetY = 0;
  // opposite = Math.tan(0.915)*60
  //offsetY = 0
  //offsetY = _obstacle.radius * skewVertRadians
  Display.ctx.save();

  //Display.ctx.translate(Layout.canvasWidth / 2, Layout.canvasHeight / 2);
  Display.ctx.translate(_x, _y);
  Display.ctx.transform(1, skewHorizRadians, skewVertRadians, 1, 0, 0);
  //Display.ctx.rotate(skewVertRadians);
  //Display.ctx.rotate(skewHorizRadians);

  Display.ctx.beginPath();
  Display.ctx.arc(_x, _y, _obstacle.radius, 0, GAME.PIx2);

  if (_obstacle.useDefaultStroke) {
    Shape.defaultStrokeCurrentPath();
  }

  Display.ctx.fillStyle = Shape.getObstacleGradient(_x, _y, _obstacle);
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
Shape.drawEllipse = function (
  _x,
  _y,
  _radius,
  _color,
  _stretch,
  _angleDegrees
) {
  var radians = degreesToRadians(_angleDegrees);

  Display.ctx.beginPath();
  Display.ctx.ellipse(
    Math.round(_x),
    Math.round(_y),
    _radius,
    _radius * _stretch,
    radians,
    0,
    GAME.PIx2
  );
  Display.ctx.fillStyle = _color;
  Display.ctx.fill();
};

/**
 * @function getObstacleGradient
 * @static 
 *
 * @description
 * ##### Draw a gradient based on obstacle properties
 * - Matches size and rotation of the gradient to the obstacle
 * - Uses defaults where properties aren't specified
 *
 * @param {number} _x - X coordinate to draw at
 * @param {number} _y - Y coordinate to draw at
 * @param {object} _obstacle - The obstacle to get properties from
 * @param {object} _obstacle.gradient - Details about the gradient to be applied
 * @param {object[]} _obstacle.gradient.stop_ar - Gradient stops in `{pos, color}` format
 * @param {GRADIENT_TYPE} _obstacle.gradient.type - Eg linear/radial
 * @param {number} _obstacle.gradient.fadePoint - Used to fade the default gradient out to the background colour of the current level (`0` to `1` - `0` means fade from centre, `1` would be the outer edge so effectively no fade)
 j
 * @returns {CanvasGradient}
 */
Shape.getObstacleGradient = function (_x, _y, _obstacle) {
  var i,
    gradient,
    gradientType = _obstacle.gradient?.type || GRADIENT_TYPE.RADIAL,
    gradientStop_ar = _obstacle.gradient?.stop_ar || [
      { pos: 0, color: _obstacle.color },
      {
        pos: _obstacle.gradientFadePoint || GAME.OBSTACLE_FADE_GRADIENT_STOP,
        color: _obstacle.color,
      },
      { pos: 1, color: Display.bgColor },
    ],
    directionVector = degreesToVector(
      _obstacle.rotation + (_obstacle.gradient?.rotation || 0)
    );

  if (_obstacle.gradient?.offsetX) {
    _x += _obstacle.gradient.offsetX * _obstacle.radius;
  }
  if (_obstacle.gradient?.offsetY) {
    _y += _obstacle.gradient.offsetY * _obstacle.radius;
  }

  switch (gradientType) {
    case GRADIENT_TYPE.LINEAR:
      gradient = Display.ctx.createLinearGradient(
        _x - directionVector.x * _obstacle.radius,
        _y - directionVector.y * _obstacle.radius,
        _x + directionVector.x * _obstacle.radius,
        _y + directionVector.y * _obstacle.radius
      );
      break;
    case GRADIENT_TYPE.RADIAL:
      gradient = Display.ctx.createRadialGradient(
        _x,
        _y,
        _obstacle.radius / 2,
        _x,
        _y,
        _obstacle.radius
      );
      break;
    case GRADIENT_TYPE.LINEAR_TUMBLING:
      gradient = Display.ctx.createLinearGradient(
        _x - _obstacle.radius,
        _y - _obstacle.radius,
        _x + Math.cos(_obstacle.rotation) * _obstacle.radius * 2,
        _y + Math.sin(_obstacle.rotation) * _obstacle.radius * 2
      );
      break;
    case GRADIENT_TYPE.RADIAL_TUMBLING:
      gradient = Display.ctx.createRadialGradient(
        _x + Math.cos(_obstacle.rotation) * _obstacle.radius * 1.2,
        _y + Math.sin(_obstacle.rotation) * _obstacle.radius * 1.2,
        _obstacle.radius / 2,
        _x + Math.cos(_obstacle.rotation) * _obstacle.radius * 1.2,
        _y + Math.sin(_obstacle.rotation) * _obstacle.radius * 1.2,
        _obstacle.radius
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
 * @param {object} _obstacle
 */
Shape.drawSquarcle = function (_x, _y, _obstacle) {
  var fillStyle = _obstacle.gradient
      ? Shape.getObstacleGradient(_x, _y, _obstacle)
      : _obstacle.color,
    directionVector = degreesToVector(_obstacle.rotation),
    directionVectorNormal = vectorGetUnitNormal(directionVector),
    arcRotation = _obstacle.rotation + 90;

  // Semicircle
  Display.ctx.beginPath();
  Display.ctx.arc(
    _x,
    _y,
    _obstacle.radius,
    degreesToRadians(arcRotation + 180),
    degreesToRadians(arcRotation)
  );

  // Rectangle
  Display.ctx.moveTo(
    _x - directionVectorNormal.x * _obstacle.radius,
    _y - directionVectorNormal.y * _obstacle.radius
  );

  Display.ctx.lineTo(
    _x -
      directionVectorNormal.x * _obstacle.radius -
      directionVector.x * _obstacle.radius,
    _y -
      directionVectorNormal.y * _obstacle.radius -
      directionVector.y * _obstacle.radius
  );

  Display.ctx.lineTo(
    _x +
      directionVectorNormal.x * _obstacle.radius -
      directionVector.x * _obstacle.radius,
    _y +
      directionVectorNormal.y * _obstacle.radius -
      directionVector.y * _obstacle.radius
  );

  Display.ctx.lineTo(
    _x + directionVectorNormal.x * _obstacle.radius,
    _y + directionVectorNormal.y * _obstacle.radius
  );

  if (_obstacle.useDefaultStroke) {
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
 * @param {object} _obstacle
 * @param {number} _obstacle.numAppendages - Number of points of the star
 * @param {number} _obstacle.shapeCenterRadiusDivisor - Size of the central fill based on the radius of the obstacle
 * @param {boolean} _obstacle.useDefaultStroke - If `true` add the standard stroke around the shape
 */
Shape.drawStar = function (_x, _y, _obstacle) {
  var i,
    x1,
    y1,
    x2,
    y2,
    angle1,
    angle2,
    angle3,
    fillStyle = _obstacle.gradient
      ? Shape.getObstacleGradient(_x, _y, _obstacle)
      : _obstacle.color;

  Display.ctx.moveTo(Math.round(_x), Math.round(_y));
  Display.ctx.beginPath();
  for (i = 0; i < _obstacle.numAppendages; i++) {
    angle1 = (GAME.PIx2 / _obstacle.numAppendages) * i;
    angle2 = (GAME.PIx2 / _obstacle.numAppendages) * (i + 1);
    angle3 = (GAME.PIx2 / _obstacle.numAppendages) * (i + 2);

    angle1 += _obstacle.rotation;
    angle2 += _obstacle.rotation;
    angle3 += _obstacle.rotation;

    // TODO degreesToVector?
    x1 =
      (_obstacle.radius / _obstacle.shapeCenterRadiusDivisor) *
        Math.sin(angle1) +
      _x;
    y1 =
      (_obstacle.radius / _obstacle.shapeCenterRadiusDivisor) *
        Math.cos(angle1) +
      _y;
    x2 = _obstacle.radius * Math.sin(angle2) + _x;
    y2 = _obstacle.radius * Math.cos(angle2) + _y;
    x3 =
      (_obstacle.radius / _obstacle.shapeCenterRadiusDivisor) *
        Math.sin(angle3) +
      _x;
    y3 =
      (_obstacle.radius / _obstacle.shapeCenterRadiusDivisor) *
        Math.cos(angle3) +
      _y;

    Display.ctx.lineTo(x1, y1);
    Display.ctx.lineTo(x2, y2);
    Display.ctx.lineTo(x3, y3);
  }
  Display.ctx.closePath();

  if (_obstacle.useDefaultStroke) {
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
  Display.ctx.strokeStyle = hexOpacityToRGBA(
    Display.bgColor,
    GAME.SHAPE_STROKE_ALPHA
  );
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
 * @param {object} _obstacle
 * @param {number} _obstacle.numAppendages - Number of petals of the flower
 * @param {number} _obstacle.shapeCenterColor - Colour to use for the flower centre
 * @param {number} _obstacle.shapeCenterRadiusDivisor - Size of the central fill based on the radius of the obstacle
 * @param {boolean} _obstacle.useDefaultStroke - If `true` add the standard stroke around the shape
 */
Shape.drawFlower = function (_x, _y, _obstacle) {
  var i,
    x1,
    y1,
    x2,
    y2,
    angle1,
    angle2,
    // Collisions with flower petals happened too far away due to bezier curves, this adjusts the draw distance to make things feel more accurate
    petalCurveAllowance =
      (_obstacle.radius / _obstacle.numAppendages) * Math.PI,
    petalRadius = _obstacle.radius + petalCurveAllowance,
    fillStyle = _obstacle.gradient
      ? Shape.getObstacleGradient(_x, _y, _obstacle)
      : _obstacle.color;

  // petals
  Display.ctx.beginPath();
  Display.ctx.moveTo(Math.round(_x), Math.round(_y));
  for (i = 0; i < _obstacle.numAppendages; i++) {
    angle1 = (GAME.PIx2 / _obstacle.numAppendages) * (i + 1);
    angle2 = (GAME.PIx2 / _obstacle.numAppendages) * i;

    angle1 += _obstacle.rotation;
    angle2 += _obstacle.rotation;

    x1 = petalRadius * Math.sin(angle1) + _x;
    y1 = petalRadius * Math.cos(angle1) + _y;
    x2 = petalRadius * Math.sin(angle2) + _x;
    y2 = petalRadius * Math.cos(angle2) + _y;

    Display.ctx.bezierCurveTo(x1, y1, x2, y2, _x, _y);
  }
  Display.ctx.closePath();

  if (_obstacle.useDefaultStroke) {
    Shape.defaultStrokeCurrentPath();
  }
  Display.ctx.fillStyle = fillStyle;
  Display.ctx.fill();

  // center
  Display.ctx.beginPath();
  Display.ctx.arc(
    _x,
    _y,
    _obstacle.radius / _obstacle.shapeCenterRadiusDivisor,
    0,
    GAME.PIx2
  );
  //Display.ctx.closePath();
  Display.ctx.fillStyle = _obstacle.shapeCenterColor || fillStyle;
  Display.ctx.fill();
};

export { Shape };
