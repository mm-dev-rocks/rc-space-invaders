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

import * as GAME from "./RCSI/GAME.js";

import { Display } from "./Display.js";

class Shape {}

/**
 * @function drawCircle
 * @static
 *
 * @description
 * ##### Draw a basic circle
 *
 * @param {number} _x - X coordinate to draw at
 * @param {number} _y - Y coordinate to draw at
 * @param {object} _data - Other details
 */
Shape.drawCircle = function (_x, _y, _data) {
  if (Display.ctx) {
    Display.ctx.beginPath();
    Display.ctx.arc(_x, _y, _data.radius, 0, GAME.PIx2);

    Display.ctx.fillStyle = _data.color;
    Display.ctx.fill();
  }
};

export { Shape };
