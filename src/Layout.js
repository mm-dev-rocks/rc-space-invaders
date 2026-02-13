/**
 * @license GPL-3.0-only
 *
 * @author Mark Mayes / mm-dev
 *
 *
 * @module Layout
 *
 * @description
 * ## Set some important variables for other classes to use, based on the size and orientation of the viewport
 *
 */

import { RCSI } from "./RCSI/CONST.js";
import { ASPECT_RATIO, HORIZ_ALIGN, RECTANGLE, VERT_ALIGN } from "./RCSI/ENUM.js";
import * as GAME from "./RCSI/GAME.js";

import { Game } from "./Game.js";
import { Text } from "./Text.js";
import { __, roundToPlaces } from "./utils.js";

class Layout {}

/**
 * @function init
 * @static
 *
 * @description
 * ##### Simple initialisation
 * This just calls the update function with a default gameplay area size so that the caclulations have something to work with
 */
Layout.init = function () {
  __("Layout.init()::", RCSI.FMT_LAYOUT);
  // TODO magic but means fill canvas, used when this function is called the first time
  Layout.update({ gameplayAreaToCanvasLateralRatio: 1 });
};

/**
 * @function setProportionalSizes
 * @static
 *
 * @description
 * ##### Calculate some values which are used heavily throughout the app
 * - `Layout.proportionalMultiplier` - Used to shrink/grow things in relation to an ideal (`GAME.SCALING_TARGET_SIZE`), to try to make things feel consistent between highly variable screen sizes
 * - `Layout.mainPaddingProportional` - Common padding used eg between text/icons and the edge of the screen
 * - `Layout.textBgPaddingProportional` - Extra spacing around text and the borders of its background
 * - `Layout.hitAreaPaddingProportional` - Invisible spacing around tappable items (eg icons) to make them easier to hit
 */
Layout.setProportionalSizes = function () {
  // used to relatively-size some objects based on canvas size
  Layout.proportionalMultiplier =
    Math.sqrt(Layout.canvas_rect.right * Layout.canvas_rect.bottom) /
    GAME.SCALING_TARGET_SIZE;
  Layout.proportionalMultiplier = roundToPlaces(
    Layout.proportionalMultiplier,
    4
  );
  __(
    "Layout.proportionalMultiplier: " + Layout.proportionalMultiplier,
    RCSI.FMT_LAYOUT
  );

  Layout.mainPaddingProportional = Math.ceil(
    GAME.MAIN_PADDING_PX * Layout.proportionalMultiplier
  );

  Layout.textBgPaddingProportional = Math.ceil(
    Text.drawnCharWidth *
      GAME.TEXT_BG_PADDING_TO_CHARWIDTH_RATIO *
      Layout.proportionalMultiplier
  );

  Layout.hitAreaPaddingProportional =
    Layout.mainPaddingProportional + Layout.textBgPaddingProportional;
};

/**
 * @function update
 * @static
 *
 * @description
 * ##### Calculate sizes (particularly recctangles) for lots of important parts of the game and UI
 *
 * @param {object} _data
 * @param {number} _data.gameplayAreaToCanvasLateralRatio - This value is set per-level and sets the size of the gameplay area (between the pipe walls) as a ratio of the canvas size
 */
Layout.update = function (_data) {
  __("Layout.update()::", RCSI.FMT_LAYOUT);
  Layout.gameplayAreaToCanvasLateralRatio =
    _data.gameplayAreaToCanvasLateralRatio;

  Layout.canvasWidth = Math.round(
    document.documentElement.clientWidth / GAME.PIXEL_SCALE
  );
  Layout.canvasHeight = Math.round(
    document.documentElement.clientHeight / GAME.PIXEL_SCALE
  );

  // Don't switch aspect ratios during a session
  if (!Layout.sessionAspectRatio) {
    if (Layout.canvasWidth > Layout.canvasHeight) {
      Layout.sessionAspectRatio = ASPECT_RATIO.LANDSCAPE;
      Layout.currentAspectUI = GAME.UI_LANDSCAPE;
    } else {
      Layout.sessionAspectRatio = ASPECT_RATIO.PORTRAIT;
      Layout.currentAspectUI = GAME.UI_PORTRAIT;
    }
  }

  Layout.gameplayWidth = Layout.canvasWidth;
  Layout.gameplayHeight = Layout.canvasHeight;
  // Size field-of-play as a % of canvas size depending on level (`gameplayAreaToCanvasLateralRatio` comes from level data)
  if (Layout.sessionAspectRatio === ASPECT_RATIO.LANDSCAPE) {
    Layout.gameplayHeight *= Layout.gameplayAreaToCanvasLateralRatio;
  } else {
    Layout.gameplayWidth *= Layout.gameplayAreaToCanvasLateralRatio;
  }
  __("\tLayout.gameplayHeight: " + Layout.gameplayHeight, RCSI.FMT_LAYOUT);
  __("\tLayout.gameplayWidth: " + Layout.gameplayWidth, RCSI.FMT_LAYOUT);

  Layout.canvas_rect = Layout.getRectangle(RECTANGLE.CANVAS);
  Layout.gameplay_rect = Layout.getRectangle(RECTANGLE.GAMEAREA);
  Layout.background_rect = Layout.getRectangle(RECTANGLE.BACKGROUND);
  Layout.floating_rect = Layout.getRectangle(RECTANGLE.FLOATING);
  __(
    "\tLayout.canvas_rect: " + JSON.stringify(Layout.canvas_rect),
    RCSI.FMT_LAYOUT
  );
  __(
    "\tLayout.gameplay_rect: " + JSON.stringify(Layout.gameplay_rect),
    RCSI.FMT_LAYOUT
  );
  __(
    "\tLayout.background_rect: " + JSON.stringify(Layout.background_rect),
    RCSI.FMT_LAYOUT
  );
  __(
    "\tLayout.floating_rect: " + JSON.stringify(Layout.floating_rect),
    RCSI.FMT_LAYOUT
  );

  // Convert % control area sizes to px
  if (Game.deviceIsTouchEnabled) {
    Layout.currentAspectUI.controller.height =
      ((Layout.canvas_rect.bottom - Layout.canvas_rect.top) / 100) *
      Layout.currentAspectUI.controller.touchHeightPercent;
    Layout.currentAspectUI.controller.width =
      ((Layout.canvas_rect.right - Layout.canvas_rect.left) / 100) *
      Layout.currentAspectUI.controller.touchWidthPercent;
  } else {
    Layout.currentAspectUI.controller.height =
      ((Layout.canvas_rect.bottom - Layout.canvas_rect.top) / 100) *
      Layout.currentAspectUI.controller.mouseHeightPercent;
    Layout.currentAspectUI.controller.width =
      ((Layout.canvas_rect.right - Layout.canvas_rect.left) / 100) *
      Layout.currentAspectUI.controller.mouseWidthPercent;
  }

  if (Layout.sessionAspectRatio === ASPECT_RATIO.LANDSCAPE) {
    Layout.gameAreaOffsetLateral =
      (Layout.canvasHeight - Layout.gameplayHeight) / 2;
  } else {
    Layout.gameAreaOffsetLateral =
      (Layout.canvasWidth - Layout.gameplayWidth) / 2;
  }

  Layout.setProportionalSizes();

  Layout.soundToggleIcon_rect = Layout.getRectangle(RECTANGLE.SOUNDTOGGLEICON);

  Layout.fullscreenToggleIcon_rect = Layout.getRectangle(
    RECTANGLE.FULLSCREENICON
  );

  Layout.mainTitle_rect = Layout.getRectangle(RECTANGLE.MAINTITLE);
};

/**
 * @function getRectangle
 * @static
 *
 * @description
 * ##### Based on current layout/dimensions, get a rectangle describing the position and size of a specific object (eg gameplay area, title image, sound icon)
 *
 * @param {RECTANGLE} _type - Which rectangle do we want?
 *
 * @returns {object} A rectangle with `top`, `right`, `bottom`, `left` properties
 */
Layout.getRectangle = function (_type) {
  var rect, pos, w, h;

  if (_type === RECTANGLE.CANVAS) {
    rect = {
      left: 0,
      right: Layout.canvasWidth,
      top: 0,
      bottom: Layout.canvasHeight,
    };
    //
    //
  } else if (_type === RECTANGLE.BACKGROUND) {
    // The player is always laterally in the midpoint of the canvas
    // So the furthest outside the gameplay area that will be displayed is half a canvas
    rect = {
      left: 0 - Layout.gameplayWidth / 2,
      right: Layout.canvasWidth + Layout.gameplayWidth / 2,
      top: 0 - Layout.gameplayHeight / 2,
      bottom: Layout.canvasHeight + Layout.gameplayHeight / 2,
    };
    //
    //
  } else if (_type === RECTANGLE.FLOATING) {
    rect = {
      top: Layout.canvas_rect.top,
      right: Layout.canvas_rect.right,
      bottom: Layout.canvas_rect.bottom,
      left: Layout.canvas_rect.left,
    };
    if (Layout.sessionAspectRatio === ASPECT_RATIO.LANDSCAPE) {
      rect.top -= (Layout.canvasHeight / 2) * GAME.FLOATING_LATERAL_MULTIPLIER;
      rect.bottom +=
        (Layout.canvasHeight / 2) * GAME.FLOATING_LATERAL_MULTIPLIER;
    } else {
      rect.left -= (Layout.canvasWidth / 2) * GAME.FLOATING_LATERAL_MULTIPLIER;
      rect.right += (Layout.canvasWidth / 2) * GAME.FLOATING_LATERAL_MULTIPLIER;
    }
    //
    //
  } else if (_type === RECTANGLE.GAMEAREA) {
    rect = {
      left: 0,
      right: Layout.gameplayWidth,
      top: 0,
      bottom: Layout.gameplayHeight,
    };
    if (Layout.sessionAspectRatio === ASPECT_RATIO.LANDSCAPE) {
      rect.right *= 2;
    } else {
      rect.bottom *= 2;
    }
    //
    //
  } else if (_type === RECTANGLE.MAINTITLE) {
    w = Layout.canvasWidth - Layout.mainPaddingProportional * 2;
    h = w / (GAME.MAINTITLE_WIDTH_PX / GAME.MAINTITLE_HEIGHT_PX);
    w *= Layout.currentAspectUI.mainTitle.sizeRatio;
    h *= Layout.currentAspectUI.mainTitle.sizeRatio;
    pos = Layout.getAlignedPos(
      Layout.currentAspectUI.mainTitle.alignH,
      Layout.currentAspectUI.mainTitle.alignV,
      w,
      h,
      0,
      //0
      Layout.currentAspectUI.mainTitle.offsetByCharsV * Text.drawnCharHeight
    );
    rect = {
      left: pos.x,
      right: pos.x + w,
      top: pos.y,
      bottom: pos.y + h,
    };
    //
    //
  } else if (_type === RECTANGLE.SOUNDTOGGLEICON) {
    pos = Layout.getAlignedPos(
      Layout.currentAspectUI.soundToggle.alignH,
      Layout.currentAspectUI.soundToggle.alignV,
      Text.drawnCharWidth,
      Text.drawnCharHeight
    );
    rect = {
      left: pos.x - Layout.hitAreaPaddingProportional,
      right: pos.x + Text.drawnCharWidth + Layout.hitAreaPaddingProportional,
      top: pos.y - Layout.hitAreaPaddingProportional,
      bottom: pos.y + Text.drawnCharHeight + Layout.hitAreaPaddingProportional,
    };
    //
    //
  } else if (_type === RECTANGLE.FULLSCREENICON) {
    pos = Layout.getAlignedPos(
      Layout.currentAspectUI.fullscreenToggle.alignH,
      Layout.currentAspectUI.fullscreenToggle.alignV,
      Text.drawnCharWidth,
      Text.drawnCharHeight
    );
    rect = {
      left: pos.x - Layout.hitAreaPaddingProportional,
      right: pos.x + Text.drawnCharWidth + Layout.hitAreaPaddingProportional,
      top: pos.y - Layout.hitAreaPaddingProportional,
      bottom: pos.y + Text.drawnCharHeight + Layout.hitAreaPaddingProportional,
    };
  }
  return rect;
};

/**
 * @function getAlignedPos
 * @static
 *
 * @description
 * ##### Based on a desired alignment and size of an item, calculate its coordinates
 *
 * @param {HORIZ_ALIGN} _alignmentH - Horizontal alignment
 * @param {VERT_ALIGN} _alignmentV - Vertical alignment
 * @param {number} _itemWidth - The height of the item
 * @param {number} _itemHeight - The width of the item
 * @param {number} [_offsetH] - A horizontal offset to be applied after the basic calculation
 * @param {number} [_offsetV] - A vertical offset to be applied after the basic calculation
 *
 * @returns {object}  x/y coordinates for the item
 */
Layout.getAlignedPos = function (
  _alignmentH,
  _alignmentV,
  _itemWidth,
  _itemHeight,
  _offsetH,
  _offsetV
) {
  var x,
    y,
    padding = Layout.mainPaddingProportional,
    offsetH = _offsetH || 0,
    offsetV = _offsetV || 0;

  if (_alignmentH === HORIZ_ALIGN.LEFT) {
    x = padding;
  } else if (_alignmentH === HORIZ_ALIGN.RIGHT) {
    x = Layout.canvas_rect.right - padding - _itemWidth;
  } else if (_alignmentH === HORIZ_ALIGN.CENTER) {
    x = Layout.canvas_rect.right / 2 - _itemWidth / 2;
  } else {
    __(
      "Layout::getAlignedPos:: _alignmentH NOT RECOGNISED: " + _alignmentH,
      RCSI.FMT_ERROR
    );
  }

  if (_alignmentV === VERT_ALIGN.TOP) {
    y = padding;
  } else if (_alignmentV === VERT_ALIGN.BOTTOM) {
    y = Layout.canvas_rect.bottom - padding - _itemHeight;
  } else if (_alignmentV === VERT_ALIGN.CENTER) {
    y = Layout.canvas_rect.bottom / 2 - _itemHeight / 2;
  } else {
    __(
      "Layout::getAlignedPos:: _alignmentV NOT RECOGNISED: " + _alignmentH,
      RCSI.FMT_ERROR
    );
  }
  x += offsetH;
  y += offsetV;
  return { x: Math.round(x), y: Math.round(y) };
};

export { Layout };
