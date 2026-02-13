/**
 * @license GPL-3.0-only
 *
 * @author Mark Mayes / mm-dev
 *
 *
 * @module AddedLayer
 *
 * @description
 * ## Draw added detail layers on top of some obstacles and sometimes the player
 * **Measurements for details such as sizes, thicknesses etc are given as a proportion of the item radius.**
 * - This allows the layers to scale with the different-sized items
 * - A value of `1` is equal to the item radius
 * - `_target` params will either be obstacles or the player
 */

import * as GAME from "./RCSI/GAME.js";

import { Display } from "./Display.js";

import { degreesToVector } from "./utils.js";

class AddedLayer {}

/**
 * @function drawTriangles
 * @static
 *
 * @description
 * ##### Stylised cracks effect based on several random overlapping triangles
 *
 * @param {number} _x - X coordinate of the item centre
 * @param {number} _y - Y coordinate of the item centre
 * @param {object} _target - The item to draw on top of
 * @param {object} _data
 * @param {number} _data.color Main color
 * @param {number} _data.thickness Line thickness
 * @param {number} _data.triangle_ar Array of triangle points
 */
AddedLayer.drawTriangles = function (_x, _y, _target, _data) {
  var i,
    j,
    vec,
    x1,
    y1,
    x2,
    y2,
    trianglePoints = 3,
    currentPoint,
    currentTriangle_ar;

  Display.ctx.beginPath();
  
  for (i = 0; i < _data.triangle_ar.length; i++) {
    currentTriangle_ar = _data.triangle_ar[i];
    for (j = 0; j < trianglePoints; j++) {
        currentPoint = currentTriangle_ar[j];
      vec = degreesToVector(_target.rotation + currentPoint.degrees);
      x1 = _x + vec.x * _target.radius * currentPoint.distance;
      y1 = _y + vec.y * _target.radius * currentPoint.distance;
      if (j === 0) {
        Display.ctx.moveTo(x1, y1);
        x2 = x1;
        y2 = y1;
      } else {
        Display.ctx.lineTo(x1, y1);
      }
    }
    Display.ctx.lineTo(x2, y2);
  }
  
  Display.ctx.lineWidth = Math.ceil(_data.thickness * _target.radius);
  Display.ctx.lineCap = "butt";
  Display.ctx.strokeStyle = _data.color;
  Display.ctx.stroke();
};

/**
 * @function drawDot
 * @static
 *
 * @description
 * ##### Simple dot/circle
 *
 * @param {number} _x - X coordinate of the item centre
 * @param {number} _y - Y coordinate of the item centre
 * @param {object} _target - The item to draw on top of
 * @param {object} _data
 * @param {number} _data.color Main color
 * @param {number} _data.extension How far the dot extends from the centre
 */
AddedLayer.drawDot = function (_x, _y, _target, _data) {
  Display.ctx.beginPath();
  Display.ctx.arc(_x, _y, _data.extension * _target.radius, 0, GAME.PIx2);

  if (_data.useDefaultStroke) {
    Shape.defaultStrokeCurrentPath();
  }

  Display.ctx.fillStyle = _data.color;
  Display.ctx.fill();
};

/**
 * @function drawSpokes
 * @static
 *
 * @description
 * ##### Spokes eg for bicycle wheels
 *
 * @param {number} _x - X coordinate of the item centre
 * @param {number} _y - Y coordinate of the item centre
 * @param {object} _target - The item to draw on top of
 * @param {object} _data
 * @param {number} _data.color Main color
 * @param {number} _data.thickness Spoke thickness
 * @param {number} _data.extension How far the spokes extend from the centre
 */
AddedLayer.drawSpokes = function (_x, _y, _target, _data) {
  var i,
    vec,
    angleStep = 360 / _data.total;

  Display.ctx.lineWidth = Math.ceil(_data.thickness * _target.radius);
  Display.ctx.lineCap = "butt";
  Display.ctx.strokeStyle = _data.color;
  Display.ctx.beginPath();
  for (i = 0; i < _data.total; i++) {
    Display.ctx.moveTo(_x, _y);

    vec = degreesToVector(angleStep * i + _target.rotation);

    Display.ctx.lineTo(
      _x + vec.x * _target.radius * _data.extension,
      _y + vec.y * _target.radius * _data.extension
    );
  }
  Display.ctx.stroke();
};

/**
 * @function drawStem
 * @static
 *
 * @description
 * ##### Stem for leaves
 *
 * @param {number} _x - X coordinate of the item centre
 * @param {number} _y - Y coordinate of the item centre
 * @param {object} _target - The item to draw on top of
 * @param {object} _data
 * @param {number} _data.color Main color
 * @param {number} _data.offsetFront Distance from the centre of the front/tip
 * @param {number} _data.offsetRear Distance from the centre of the rear/butt
 * @param {number} _data.degreeSpanFront Thickness of the front part of the stem, given as degrees of arc
 * @param {number} _data.degreeSpanRear Thickness of the rear part of the stem, given as degrees of arc
 */
AddedLayer.drawStem = function (_x, _y, _target, _data) {
  var vec,
    x1,
    y1,
    x2,
    y2,
    x3,
    y3,
    x4,
    y4,
    rearAngle = _target.rotation - 180;

  Display.ctx.fillStyle = _data.color;
  Display.ctx.beginPath();

  vec = degreesToVector(_target.rotation - _data.degreeSpanFront / 2);
  x1 = _x + vec.x * _target.radius * _data.offsetFront;
  y1 = _y + vec.y * _target.radius * _data.offsetFront;

  vec = degreesToVector(_target.rotation + _data.degreeSpanFront / 2);
  x2 = _x + vec.x * _target.radius * _data.offsetFront;
  y2 = _y + vec.y * _target.radius * _data.offsetFront;

  vec = degreesToVector(rearAngle - _data.degreeSpanRear / 2);
  x3 = _x + vec.x * _target.radius * _data.offsetRear;
  y3 = _y + vec.y * _target.radius * _data.offsetRear;

  vec = degreesToVector(rearAngle + _data.degreeSpanRear / 2);
  x4 = _x + vec.x * _target.radius * _data.offsetRear;
  y4 = _y + vec.y * _target.radius * _data.offsetRear;

  Display.ctx.moveTo(x1, y1);
  Display.ctx.lineTo(x2, y2);
  Display.ctx.lineTo(x3, y3);
  Display.ctx.lineTo(x4, y4);
  Display.ctx.closePath();

  Display.ctx.fill();
};

/**
 * @function drawMouth
 * @static
 *
 * @description
 * ##### Mouth for character
 *
 * @param {number} _x - X coordinate of the item centre
 * @param {number} _y - Y coordinate of the item centre
 * @param {object} _target - The item to draw on top of
 * @param {number} [_target.stretch] How far open the mouth is
 * @param {object} _data
 * @param {number} _data.color Main color
 * @param {number} _data.offsetFromCenter Distance of the mouth from the centre of the target
 */
AddedLayer.drawMouth = function (_x, _y, _target, _data) {
  var vec, x1, y1, x2, y2, x3, y3, x4, y4;

  Display.ctx.lineWidth = _data.thickness * _target.radius;
  Display.ctx.lineCap = "round";
  Display.ctx.strokeStyle = _data.color;
  Display.ctx.fillStyle = _data.color;
  Display.ctx.beginPath();

  vec = degreesToVector(_target.rotation - _data.degreeSpan / 2);
  x1 = _x + vec.x * _target.radius * _data.offsetFromCenter;
  y1 = _y + vec.y * _target.radius * _data.offsetFromCenter;

  vec = degreesToVector(_target.rotation + _data.degreeSpan / 2);
  x2 = _x + vec.x * _target.radius * _data.offsetFromCenter;
  y2 = _y + vec.y * _target.radius * _data.offsetFromCenter;

  vec = degreesToVector(_target.rotation);
  x3 = _x + vec.x * _target.radius * _data.offsetFromCenter;
  y3 = _y + vec.y * _target.radius * _data.offsetFromCenter;

  Display.ctx.moveTo(x1, y1);
  Display.ctx.bezierCurveTo(x1, y1, x3, y3, x2, y2);

  if (_target.stretch) {
    x4 = _x + vec.x * _target.radius * _data.offsetFromCenter * _target.stretch;
    y4 = _y + vec.y * _target.radius * _data.offsetFromCenter * _target.stretch;
    Display.ctx.moveTo(x1, y1);
    Display.ctx.bezierCurveTo(x1, y1, x4, y4, x2, y2);
  }

  Display.ctx.fill();
};

/**
 * @function drawStetson
 * @static
 *
 * @description
 * ##### Stetson-style hat
 *
 * @param {number} _x - X coordinate of the item centre
 * @param {number} _y - Y coordinate of the item centre
 * @param {object} _target - The item to draw on top of
 * @param {object} _data
 * @param {number} _data.offsetFromCenter Distance of the hat from the centre of the target
 * @param {number} _data.thickness Overall size of the hat
 * @param {number} _data.colorOuter Outer/rim colour
 * @param {number} _data.colorInner Inner colour
 */
AddedLayer.drawStetson = function (_x, _y, _target, _data) {
  var vec, x1, y1;

  vec = degreesToVector(_target.rotation);
  x1 = _x - vec.x * _target.radius * _data.offsetFromCenter;
  y1 = _y - vec.y * _target.radius * _data.offsetFromCenter;

  Display.ctx.beginPath();
  Display.ctx.arc(x1, y1, _data.thickness * _target.radius, 0, GAME.PIx2);
  Display.ctx.fillStyle = _data.colorOuter;
  Display.ctx.fill();

  Display.ctx.beginPath();
  // TODO magic
  Display.ctx.arc(x1, y1, (_data.thickness / 2) * _target.radius, 0, GAME.PIx2);
  Display.ctx.fillStyle = _data.colorInner;
  Display.ctx.fill();
};

/**
 * @function drawBowler
 * @static
 *
 * @description
 * ##### Bowler-style hat
 *
 * @param {number} _x - X coordinate of the item centre
 * @param {number} _y - Y coordinate of the item centre
 * @param {object} _target - The item to draw on top of
 * @param {object} _data
 * @param {number} _data.offsetFromCenter Distance of the hat from the centre of the target
 * @param {number} _data.thickness Overall size of the hat
 * @param {number} _data.colorOuter Outer/rim colour
 * @param {number} _data.colorInner Inner colour
 */
AddedLayer.drawBowler = function (_x, _y, _target, _data) {
  var vec, x1, y1;

  vec = degreesToVector(_target.rotation);
  x1 = _x - vec.x * _target.radius * _data.offsetFromCenter;
  y1 = _y - vec.y * _target.radius * _data.offsetFromCenter;
  Display.ctx.beginPath();
  Display.ctx.arc(x1, y1, _data.thickness * _target.radius, 0, GAME.PIx2);
  Display.ctx.fillStyle = _data.colorOuter;
  Display.ctx.fill();

  vec = degreesToVector(_target.rotation);
  x1 = _x - vec.x * _target.radius * _data.offsetFromCenter;
  y1 = _y - vec.y * _target.radius * _data.offsetFromCenter;
  Display.ctx.beginPath();
  // TODO magic
  Display.ctx.arc(
    x1,
    y1,
    (_data.thickness / 1.4) * _target.radius,
    0,
    GAME.PIx2
  );
  Display.ctx.fillStyle = _data.colorInner;
  Display.ctx.fill();
};

/**
 * @function drawEyes
 * @static
 *
 * @description
 * ##### Eyes for a character
 *
 * @param {number} _x - X coordinate of the item centre
 * @param {number} _y - Y coordinate of the item centre
 * @param {object} _target - The item to draw on top of
 * @param {object} _data
 * @param {number} _data.color Main color
 * @param {number} _data.offsetFromCenter Distance of eyes from the centre of the target
 * @param {number} _data.degreeSpan How far apart the eyes are
 * @param {number} _data.thickness Size of eyes
 */
AddedLayer.drawEyes = function (_x, _y, _target, _data) {
  var vec, x1, y1;

  Display.ctx.fillStyle = _data.color;
  Display.ctx.beginPath();

  vec = degreesToVector(_target.rotation - _data.degreeSpan / 2);
  x1 = _x + vec.x * _target.radius * _data.offsetFromCenter;
  y1 = _y + vec.y * _target.radius * _data.offsetFromCenter;
  Display.ctx.arc(x1, y1, _data.thickness * _target.radius, 0, GAME.PIx2);

  vec = degreesToVector(_target.rotation + _data.degreeSpan / 2);
  x1 = _x + vec.x * _target.radius * _data.offsetFromCenter;
  y1 = _y + vec.y * _target.radius * _data.offsetFromCenter;
  Display.ctx.arc(x1, y1, _data.thickness * _target.radius, 0, GAME.PIx2);

  Display.ctx.fill();
};

/**
 * @function drawHelicopterTailPropeller
 * @static
 *
 * @description
 * ##### Rotating top-down propeller
 *
 * @param {number} _x - X coordinate of the item centre
 * @param {number} _y - Y coordinate of the item centre
 * @param {object} _target - The item to draw on top of
 * @param {object} _data
 * @param {number} _data.color Main color
 * @param {number} _data.extension Span of propeller
 * @param {number} _data.thickness Thickness of propeller
 */
AddedLayer.drawHelicopterTailPropeller = function (_x, _y, _target, _data) {
  var vec;

  Display.ctx.lineWidth = _data.thickness * _target.radius;
  Display.ctx.lineCap = "butt";
  Display.ctx.strokeStyle = _data.color;
  Display.ctx.beginPath();

  vec = degreesToVector(0 + _target.rotation);
  Display.ctx.moveTo(_x, _y - vec.y * _target.radius * _data.extension);
  Display.ctx.lineTo(_x, _y + vec.y * _target.radius * _data.extension);

  Display.ctx.stroke();
};

export { AddedLayer };
