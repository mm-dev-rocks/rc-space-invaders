/**
 * @license GPL-3.0-only
 *
 * @author Mark Mayes / mm-dev
 *
 *
 * @module HealthMeter
 *
 * @description
 * ## Manage and draw the health meter
 */

import { RCSI } from "./RCSI/CONST.js";
import * as GAME from "./RCSI/GAME.js";
import * as STRING from "./RCSI/STRING.js";

import { Display } from "./Display.js";
import { Game } from "./Game.js";
import { Layout } from "./Layout.js";
import { Player } from "./Player.js";
import { Text } from "./Text.js";

import { __, isEvenNumber } from "./utils.js";

class HealthMeter {}

/**
 * @function updateSizes
 * @static
 *
 * @description
 * ##### Update the dimensions of the meter
 * Size is based on text character widths or heights (depending on viewport aspect ratio), so that the meter lines up with the (conceptual) text grid.
 */
HealthMeter.updateSizes = function () {
  __("HealthMeter.updateSizes()", RCSI.FMT_DISPLAY);
  __("Text.drawnPixelSize: " + Text.drawnPixelSize, RCSI.FMT_DISPLAY);
  if (Display.isLandscapeAspect) {
    HealthMeter.width = Text.drawnCharWidth;
    HealthMeter.height = GAME.HEALTHMETER_SIZE_CHARS * Text.lineHeight;
    //
    HealthMeter.bgWidth =
      HealthMeter.width + Layout.textBgPaddingProportional * 2;
    HealthMeter.bgHeight =
      HealthMeter.height +
      Text.lineHeight +
      Layout.textBgPaddingProportional * 3;
    //
    HealthMeter.offsetH = 0 - Layout.textBgPaddingProportional;
    HealthMeter.offsetV = 0;
    //
    HealthMeter.heartOffsetH = 0 - Math.round(Text.letterSpacing / 2);
  } else {
    HealthMeter.width = GAME.HEALTHMETER_SIZE_CHARS * Text.fullCharWidth;
    HealthMeter.height = Text.drawnCharHeight;
    //
    HealthMeter.bgWidth =
      HealthMeter.width +
      Text.fullCharWidth +
      Layout.textBgPaddingProportional * 3;
    HealthMeter.bgHeight =
      HealthMeter.height + Layout.textBgPaddingProportional * 2;
    //
    HealthMeter.offsetH = Layout.textBgPaddingProportional;
    HealthMeter.offsetV = 0 - Layout.textBgPaddingProportional;
    //
    HealthMeter.heartOffsetH = 0;
    HealthMeter.heartOffsetV = 0 - Math.round(Text.letterSpacing / 2);
  }

  if (Layout.currentAspectUI.healthMeter.offsetByCharsV) {
    HealthMeter.offsetV +=
      Layout.currentAspectUI.healthMeter.offsetByCharsV * Text.lineHeight;
    HealthMeter.heartOffsetV +=
      Layout.currentAspectUI.healthMeter.offsetByCharsV * Text.lineHeight;
    HealthMeter.heartOffsetV += Layout.textBgPaddingProportional * 2;
  }

  HealthMeter.pos = Layout.getAlignedPos(
    Layout.currentAspectUI.healthMeter.alignH,
    Layout.currentAspectUI.healthMeter.alignV,
    HealthMeter.bgWidth,
    HealthMeter.bgHeight,
    HealthMeter.offsetH,
    HealthMeter.offsetV
  );

  // Used to prevent fuzzy lines when thickness is an odd number
  HealthMeter.strokeFixOffset = !isEvenNumber(Text.drawnPixelSize) ? -0.5 : 0;

  __("HealthMeter.width: " + HealthMeter.width, RCSI.FMT_DISPLAY);
  __("HealthMeter.height: " + HealthMeter.height, RCSI.FMT_DISPLAY);
  __("HealthMeter.pos.x: " + HealthMeter.pos.x, RCSI.FMT_DISPLAY);
  __("HealthMeter.pos.y: " + HealthMeter.pos.y, RCSI.FMT_DISPLAY);
  __(
    "Layout.textBgPaddingProportional: " + Layout.textBgPaddingProportional,
    RCSI.FMT_DISPLAY
  );
};

/**
 * @function draw
 * @static
 *
 * @description
 * ##### Call other functions to update and draw the meter
 */
HealthMeter.draw = function () {
  HealthMeter.setStrokeProperties();
  HealthMeter.drawBackground();
  HealthMeter.drawInnerBar();
  HealthMeter.drawOuterStroke();
  HealthMeter.drawHeart();
};

/**
 * @function drawInnerBar
 * @static
 *
 * @description
 * ##### The inner bar
 * This is the part that changes in size (shrinks) as the player's health diminishes.
 */
HealthMeter.drawInnerBar = function () {
  var width,
    height,
    x,
    y,
    healthRemainingDecimalFraction =
      Player.health / Game.curLevelData.startHealth;

  if (Display.isLandscapeAspect) {
    width = HealthMeter.width;
    height = HealthMeter.height * healthRemainingDecimalFraction;
    y =
      HealthMeter.pos.y +
      Layout.textBgPaddingProportional +
      HealthMeter.height -
      HealthMeter.strokeFixOffset -
      height;
    x = HealthMeter.pos.x + Layout.textBgPaddingProportional;
  } else {
    width = HealthMeter.width * healthRemainingDecimalFraction;
    height = HealthMeter.height;
    x =
      HealthMeter.pos.x +
      Layout.textBgPaddingProportional +
      HealthMeter.width -
      HealthMeter.strokeFixOffset -
      width;
    y = HealthMeter.pos.y + Layout.textBgPaddingProportional;
  }

  x = Math.floor(x);
  y = Math.floor(y);
  height = Math.floor(height);
  width = Math.floor(width);

  // inner bar (changes size with health)
  // Flash after damage
  if (
    Player.damagedFramesCounter > 0 &&
    Display.flashIsOff(GAME.TEXT_FLASH_ON_SECS, GAME.TEXT_FLASH_OFF_SECS)
  ) {
    Display.ctx.fillStyle = "transparent";
  } else {
    Display.ctx.fillStyle = Display.textColorHighlight;
  }
  Display.ctx.fillRect(x, y, width, height);

  // Cap stroke
  Display.ctx.beginPath();
  if (Display.isLandscapeAspect) {
    Display.ctx.moveTo(x, y);
    Display.ctx.lineTo(x + width - Text.drawnPixelSize, y);
  } else {
    Display.ctx.moveTo(x, y);
    Display.ctx.lineTo(x, y - Text.drawnPixelSize + height);
  }
  Display.ctx.stroke();
};

/**
 * @function drawBackground
 * @static
 *
 * @description
 * ##### The translucent padded background
 */
HealthMeter.drawBackground = function () {
  Display.ctx.fillStyle = Display.overlayBgColor;
  Display.ctx.fillRect(
    HealthMeter.pos.x,
    HealthMeter.pos.y,
    HealthMeter.bgWidth,
    HealthMeter.bgHeight
  );
};

/**
 * @function drawOuterStroke
 * @static
 *
 * @description
 * ##### The main outline
 */
HealthMeter.drawOuterStroke = function () {
  Display.ctx.strokeRect(
    HealthMeter.pos.x +
      Layout.textBgPaddingProportional +
      HealthMeter.strokeFixOffset,
    HealthMeter.pos.y +
      Layout.textBgPaddingProportional +
      HealthMeter.strokeFixOffset,
    HealthMeter.width,
    HealthMeter.height
  );
  Display.ctx.stroke();
};

/**
 * @function setStrokeProperties
 * @static
 *
 * @description
 * ##### Set the thickness and colour of the stroke for drawing the outline and cap line
 */
HealthMeter.setStrokeProperties = function () {
  Display.ctx.lineWidth = Text.drawnPixelSize;
  Display.ctx.strokeStyle = Display.shadowColor;
};

/**
 * @function drawHeart
 * @static
 *
 * @description
 * ##### The heart icon
 */
HealthMeter.drawHeart = function () {
  Text.draw({
    text: STRING.HEART,
    color: Display.textColorHighlight,
    drawBackground: false,
    alignH: Layout.currentAspectUI.healthMeter.alignH,
    alignV: Layout.currentAspectUI.healthMeter.alignV,
    offsetH: HealthMeter.heartOffsetH,
    offsetV: HealthMeter.heartOffsetV,
  });
};

export { HealthMeter };
