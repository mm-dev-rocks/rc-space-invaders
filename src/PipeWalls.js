/**
 * @license GPL-3.0-only
 *
 * @author Mark Mayes / mm-dev
 *
 *
 * @module PipeWalls
 *
 * @description
 * ## Draw the pipe walls
 * - Makes a copy of a slice of the canvas
 * - Scales the copy and draws it on top of the original slice
 * - Repeats the process to make wall edges
 */



import * as GAME from "./RCSI/GAME.js";

import { Controller } from "./Controller.js";
import { Display } from "./Display.js";
import { Layout } from "./Layout.js";

import { getOffscreenOrNormalCanvas } from "./utils.js";

class PipeWalls {}

/**
 * @function init
 * @static 
 *
 * @description
 * ##### Creates a `canvas` on which the pipe walls are drawn before copying into the main canvas
 * Uses an offscreen canvas if the browser supports it, to improve performance.
 */
PipeWalls.init = function () {
  if (!PipeWalls.canvas) {
    PipeWalls.canvas = getOffscreenOrNormalCanvas();
    PipeWalls.ctx = PipeWalls.canvas.getContext("2d", {
      willReadFrequently: true,
      desynchronized: true,
    });
  }
};

/**
 * @function updateSizes
 * @static 
 *
 * @description
 * ##### Calculate wall sizes based on the current viewport/layout
 */
PipeWalls.updateSizes = function () {
  PipeWalls.thicknessMain = Math.round(
    GAME.PIPE_WALL_THICKNESS * Layout.proportionalMultiplier
  );
  PipeWalls.thicknessEdges = Math.round(
    GAME.PIPE_WALL_EDGE_THICKNESS * Layout.proportionalMultiplier
  );
  if (Display.isLandscapeAspect) {
    PipeWalls.canvas.width = Layout.gameplayWidth;
    PipeWalls.canvas.height = PipeWalls.thicknessMain;
    PipeWalls.shrinkX = PipeWalls.canvas.width * GAME.PIPE_WALL_ZOOM_FACTOR;
    PipeWalls.shrinkY = PipeWalls.canvas.height * GAME.PIPE_WALL_ZOOM_FACTOR;
    if (GAME.PIPE_WALL_DISTORT_CROSSAXIS) {
      PipeWalls.shrinkX *= GAME.PIPE_WALL_PERSPECTIVE_OFFSET_DIVISOR;
    } else {
      PipeWalls.shrinkY *= GAME.PIPE_WALL_PERSPECTIVE_OFFSET_DIVISOR;
    }
  } else {
    PipeWalls.canvas.width = PipeWalls.thicknessMain;
    PipeWalls.canvas.height = Layout.gameplayHeight;
    PipeWalls.shrinkX = PipeWalls.canvas.width * GAME.PIPE_WALL_ZOOM_FACTOR;
    PipeWalls.shrinkY = PipeWalls.canvas.height * GAME.PIPE_WALL_ZOOM_FACTOR;
    if (GAME.PIPE_WALL_DISTORT_CROSSAXIS) {
      PipeWalls.shrinkY *= GAME.PIPE_WALL_PERSPECTIVE_OFFSET_DIVISOR;
    } else {
      PipeWalls.shrinkX *= GAME.PIPE_WALL_PERSPECTIVE_OFFSET_DIVISOR;
    }
  }
};

/**
 * @function draw
 * @static 
 *
 * @description
 * ##### Calculate the latest positions of and draw the walls
 */
PipeWalls.draw = function () {
  var x = Layout.gameplay_rect.left,
    y = Layout.gameplay_rect.top,
    lateralOffset = Controller.lateralOffset + Layout.gameAreaOffsetLateral;

  if (Display.isLandscapeAspect) {
    y += lateralOffset - PipeWalls.thicknessMain;
  } else {
    x += lateralOffset - PipeWalls.thicknessMain;
  }

  // Create PipeWalls.gradient for first wall
  if (Display.isLandscapeAspect) {
    PipeWalls.gradient = Display.ctx.createLinearGradient(
      x,
      y,
      x + PipeWalls.canvas.width,
      y + PipeWalls.canvas.width
    );
  } else {
    PipeWalls.gradient = Display.ctx.createLinearGradient(
      x,
      y,
      x + PipeWalls.canvas.height,
      y + PipeWalls.canvas.height
    );
  }
  PipeWalls.addGradientColorStops();
  PipeWalls.drawSingleWall(x, y);

  // Create PipeWalls.gradient for second wall
  if (Display.isLandscapeAspect) {
    y += Layout.gameplayHeight + PipeWalls.thicknessMain;
    PipeWalls.gradient = Display.ctx.createLinearGradient(
      x + PipeWalls.canvas.width,
      y + PipeWalls.canvas.width,
      x,
      y
    );
  } else {
    x += Layout.gameplayWidth + PipeWalls.thicknessMain;
    PipeWalls.gradient = Display.ctx.createLinearGradient(
      x + PipeWalls.canvas.height,
      y + PipeWalls.canvas.height,
      x,
      y
    );
  }
  PipeWalls.addGradientColorStops();
  PipeWalls.drawSingleWall(x, y);
};

/**
 * @function drawSingleWall
 * @static 
 *
 * @description
 * ##### Draw a single wall
 * Called twice by the main drawing function.
 *
 * @param {number} _x - Positioning coordinate
 * @param {number} _y - Positioning coordinate
 */
PipeWalls.drawSingleWall = function (_x, _y) {
  // Get copy of pixels under first wall
  var copiedImageData = Display.ctx.getImageData(
    _x,
    _y,
    PipeWalls.canvas.width,
    PipeWalls.canvas.height
  );

  // Draw main pipe wall
  PipeWalls.ctx.putImageData(copiedImageData, 0, 0);
  Display.ctx.drawImage(
    PipeWalls.canvas,
    Math.floor(PipeWalls.shrinkX),
    Math.floor(PipeWalls.shrinkY),
    Math.floor(PipeWalls.canvas.width - PipeWalls.shrinkX),
    Math.floor(PipeWalls.canvas.height - PipeWalls.shrinkY),
    Math.floor(_x),
    Math.floor(_y),
    Math.floor(PipeWalls.canvas.width),
    Math.floor(PipeWalls.canvas.height)
  );

  // Draw gradient overlay
  Display.ctx.globalCompositeOperation = "difference";
  Display.ctx.fillStyle = PipeWalls.gradient;
  Display.ctx.fillRect(_x, _y, PipeWalls.canvas.width, PipeWalls.canvas.height);
  Display.ctx.lineWidth = PipeWalls.thicknessEdges;
  if (Display.isLandscapeAspect) {
    Display.ctx.moveTo(_x, _y);
    Display.ctx.lineTo(_x + PipeWalls.canvas.width, _y);
    Display.ctx.moveTo(_x, _y + PipeWalls.canvas.height);
    Display.ctx.lineTo(
      _x + PipeWalls.canvas.width,
      _y + PipeWalls.canvas.height
    );
  } else {
    Display.ctx.moveTo(_x, _y);
    Display.ctx.lineTo(_x, _y + PipeWalls.canvas.height);
    Display.ctx.moveTo(_x + PipeWalls.canvas.width, _y);
    Display.ctx.lineTo(
      _x + PipeWalls.canvas.width,
      _y + PipeWalls.canvas.height
    );
  }

  // Draw edges / outline
  Display.ctx.strokeStyle = PipeWalls.gradient;
  Display.ctx.stroke();
  Display.ctx.globalCompositeOperation = "source-over";
};

/**
 * @function addGradientColorStops
 * @static 
 *
 * @description
 * ##### Add the colour stops to the gradient
 * The gradient gets recreated on every call to `draw()`, so the stops must be re-applied.
 */
PipeWalls.addGradientColorStops = function () {
  PipeWalls.gradient.addColorStop(0.0, GAME.PIPE_GRADIENTCOLOR_2);
  PipeWalls.gradient.addColorStop(0.1, GAME.PIPE_GRADIENTCOLOR_1);
  PipeWalls.gradient.addColorStop(0.2, GAME.PIPE_GRADIENTCOLOR_2);
  PipeWalls.gradient.addColorStop(0.3, GAME.PIPE_GRADIENTCOLOR_1);
  PipeWalls.gradient.addColorStop(0.4, GAME.PIPE_GRADIENTCOLOR_3);
  PipeWalls.gradient.addColorStop(0.7, GAME.PIPE_GRADIENTCOLOR_2);
  PipeWalls.gradient.addColorStop(0.8, GAME.PIPE_GRADIENTCOLOR_3);
  PipeWalls.gradient.addColorStop(0.9, GAME.PIPE_GRADIENTCOLOR_1);
  PipeWalls.gradient.addColorStop(1, GAME.PIPE_GRADIENTCOLOR_2);
};

export { PipeWalls };
