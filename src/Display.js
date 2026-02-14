/**
 * @license GPL-3.0-only
 *
 * @author Mark Mayes / mm-dev
 *
 *
 * @module Display
 *
 * @description
 * ## Drawing to the display (canvas) happens in this class, with some of it being farmed out to sub-classes
 */

import { RCSI } from "./RCSI/CONST.js";
import { THING_SUBTYPE, THING_TYPE } from "./RCSI/ENUM.js";
import * as GAME from "./RCSI/GAME.js";
import * as IMAGE_IDS from "./RCSI/IMAGE_IDS.js";

import { Game } from "./Game.js";
import { ImageManager } from "./ImageManager.js";
import { InternalTimer } from "./InternalTimer.js";
import { Layout } from "./Layout.js";
import { ThingManager } from "./ThingManager.js";
import { OverlayText } from "./OverlayText.js";
import { Player } from "./Player.js";
import { Shape } from "./Shape.js";
import { Text } from "./Text.js";

import { __, hexOpacityToRGBA, modulo } from "./utils.js";

class Display {
  /** @type {HTMLCanvasElement} */ static canvas;
  /** @type {CanvasRenderingContext2D | null} */ static ctx;
  /** @type {CanvasRenderingContext2D | null} */ static ctxDefault;
  /** @type {Object} */ static titleImage;
  /** @type {boolean} */ static levelIsDark;
  /** @type {number} */ static textColor;
  /** @type {number} */ static textColorHighlight;
  /** @type {number} */ static bgFadeAlpha;
  /** @type {number} */ static shadowColor;
  /** @type {String} */ static overlayBgColor;
  /** @type {number} */ static bgColor;
  /** @type {String} */ static instruct_text;
}

/**
 * @function init
 * @static
 *
 * @description
 * ##### Various initialisation jobs
 * - Create and store a reference to the main game canvas
 * - Initialise some other companion classes
 */
Display.init = function () {
  __("Display.init()", RCSI.FMT_DISPLAY);
  if (!Display.canvas) {
    Display.createCanvas();
  }

  Display.titleImage = ImageManager.getImageByID(IMAGE_IDS.MAIN_TITLE).image_el;

  Layout.init();
  Text.init();
  OverlayText.init();
};

/**
 * @function setupForLevel
 * @static
 *
 * @description
 * ##### Update some level-specific details
 * - Custom colours
 * - Instruction text if this is the first screen
 * - Which things to show on the level intro screen
 */
Display.setupForLevel = function () {
  __("Display.setupForLevel()", RCSI.FMT_DISPLAY);

  Display.levelIsDark = Game.curLevelData.isDark;
  Display.textColor = Game.curLevelData.textColor;
  Display.textColorHighlight = Game.curLevelData.textColorHighlight;
  Display.bgFadeAlpha = Game.curLevelData.bgFadeAlpha;
  Display.shadowColor = Game.curLevelData.textColorShadow || GAME.TEXT_DEFAULT_SHADOW_COLOR;
  if (Game.isOnFrontPage) {
    Display.instruct_text = Game.curLevelData.instruct_text;
  }

  Display.updateLayout();

  Display.updateColors({ bgColor: Game.curLevelData.bgColor });
};

// TODO Document
Display.updateColors = function (_data) {
  Text.setupForLevel({
    levelIsDark: Display.levelIsDark,
    defaultColor: Display.textColor,
    accentColor: Display.textColorHighlight,
    shadowColor: Display.shadowColor,
  });

  Display.setBackgroundColor(_data?.bgColor || Display.bgColor);
};

/**
 * @function setBackgroundColor
 * @static
 *
 * @description
 * ##### Update the background colour
 * - For the game itself
 * - For faded backgrounds underneath eg text and the health meter
 * - For other overlays used eg in
 *
 * @param {number} _hexColor - The new colour
 */
Display.setBackgroundColor = function (_hexColor) {
  Display.bgColor = _hexColor;
  Display.overlayBgColor = hexOpacityToRGBA(_hexColor, GAME.TEXT_BACKGROUND_FILL_ALPHA);
  document.body.style.backgroundColor = Game.curLevelData.bgColor;
};

/**
 * @function updateLayout
 * @static
 *
 * @description
 * ##### Make sure sizes for everything are matched to the current viewport dimensions
 * Most of the work is done by calling similar methods in other classes.
 */
Display.updateLayout = function () {
  Display.canvas.width = Layout.canvasWidth;
  Display.canvas.height = Layout.canvasHeight;

  // IMPORTANT changing width/height resets the drawing states of the context get reset
  Display.ctx.imageSmoothingEnabled = false;
  Display.ctxDefault.imageSmoothingEnabled = false;

  Player.updateSizes();
};

/**
 * @function createCanvas
 * @static
 *
 * @description
 * ##### Create the main `canvas` element and add it to the DOM
 * **`Display.canvas` contains everything we see on-screen.**
 */
Display.createCanvas = function () {
  __("Display.createCanvas()", RCSI.FMT_INFO);

  Display.canvas = document.createElement("canvas");
  Display.canvas.id = RCSI.EL_IDS.ACTIVEAREA_CANVAS;
  // Declaring that we don't need the canvas itself to use transparency allows
  // the browser to optimise
  Display.ctx = Display.canvas.getContext("2d", {
    alpha: false,
    willReadFrequently: true,
    // Never set `desynchronized: true` on this canvas context!
    // It works on secondary canvases in `PipeWalls` and `Text`, but here it causes blank screens/empty canvas in some
    // browsers TODO Why??
    //desynchronized: true,
  });

  if (Display.ctx) {
    Display.ctx.imageSmoothingEnabled = false;
    __("\t disabling smoothing", RCSI.FMT_INFO);
  }

  Display.ctxDefault = Display.ctx;

  Game.container_el.appendChild(Display.canvas);

  if (GAME.PIXEL_SCALE !== 1) {
    Display.canvas.style.transform = "scale(" + GAME.PIXEL_SCALE + ")";
  }
};

/**
 * @function update
 * @static
 *
 * @description
 * ##### The main update function
 * - Called once per frame
 * - Manages all updates to the screen (`Display.canvas`), including the game itself and the UI
 * - Decides what to show/hide depending on the current state of the game
 */
Display.update = function () {
  Display.drawBackground();
  Display.drawBackgroundThings();

  if (Game.isOnFrontPage) {
    Display.drawTitle();
    Text.drawInstructions(Display.instruct_text);
    Text.drawVersionInfo();
  }

  Player.draw();

  if (!Game.isOnFrontPage) {
    Text.drawTimeRemaining();
    Text.drawCollected();
    Text.drawLevel();
  }

  if (OverlayText.content_ar?.length > 0) {
    OverlayText.draw();
  }

  if (!Game.isOnFrontPage && Game.isInLevelIntro) {
    Text.drawVersionInfo({ isInLevelIntro: true, color: Display.textColor });
  }
};

/**
 * @function drawTitle
 * @static
 *
 * @description
 * ##### Draw the **Pipe Dream** title image on the intro page
 */
Display.drawTitle = function () {
  var hueRotationAngle = modulo(InternalTimer.frameCount, 360);
  if (Display.ctx) {
    Display.ctx.filter = "hue-rotate(" + hueRotationAngle + "deg)";
    Display.ctx.drawImage(
      Display.titleImage,
      0,
      0,
      Display.titleImage.width,
      Display.titleImage.height,
      Layout.mainTitle_rect.left,
      Layout.mainTitle_rect.top,
      Layout.mainTitle_rect.right - Layout.mainTitle_rect.left,
      Layout.mainTitle_rect.bottom - Layout.mainTitle_rect.top,
    );
    Display.ctx.filter = "none";
  }
};

/**
 * @function flashIsOff
 * @static
 *
 * @description
 * ##### For flashing items, decide whether on this frame the item should be 'off' (hidden) rather than an 'on' (displayed)
 * As the display is redrawn for every frame, if we want an item to periodically flash we need a way of calculating when to show it and when to hide it.
 * - The frame rate may be inconsistent, so it makes sense to specify the period of the on/off cycle using seconds
 * - `InternalTimer.currentFps` can be used to roughly convert seconds to frames
 * - `InternalTimer.frameCount` is a simple counter of how many frames have been drawn
 *
 * @param {number} _secsOn - How many seconds or fractions of a second the 'on' part of the flash cycle should last
 * @param {number} _secsOff - As above but for the 'off' part of the cycle
 *
 * @returns {boolean} Whether the item should be 'flashed off'. or hidden during this frame
 */
// TODO Make the calculations more robust to prevent clashes
Display.flashIsOff = function (_secsOn, _secsOff) {
  var i,
    framesOn = Math.ceil(_secsOn * InternalTimer.currentFps),
    framesOff = Math.ceil(_secsOff * InternalTimer.currentFps),
    fullCycleFrames = framesOn + framesOff;

  for (i = 0; i < framesOff; i++) {
    if ((InternalTimer.frameCount + i) % fullCycleFrames === 0) {
      return true;
    }
  }
};

/**
 * @function drawBackground
 * @static
 *
 * @description
 * ##### The solid fill background colour
 */
Display.drawBackground = function () {
  Display.ctx.fillStyle = Display.bgColor;
  Display.ctx.fillRect(0, 0, Display.canvas.width, Display.canvas.height);
};

/**
 * @function swapContext
 * @static
 *
 * @description
 * ##### Swap to a different canvas context
 * - Used eg by OverlayText to temporarily swap to its own special canvas
 * - While swapped, all canvas operations such as in `Text` or other classes will be performed on the swapped canvas
 * - Can be used to set back to the default canvas
 *
 * @param {object} _data - [TODO:description]
 * @param {boolean} [_data.backToDefault] - If `true`, context is switched back to the standard context and any transforms are restored
 * @param {CanvasRenderingContext2D} [_data.contextToSwapTo] - The context to swap to
 */
Display.swapContext = function (_data) {
  if (_data.backToDefault) {
    Display.ctx = Display.ctxDefault;
    Display.ctx.restore();
  } else {
    Display.ctx.save();
    Display.ctx = _data.contextToSwapTo;
  }
};

/**
 * @function drawBackgroundThings
 * @static
 *
 * @description
 * ##### Background things
 * - Are below and do not interact with the player
 * - Conceptually are on the **bottom layer**
 */
Display.drawBackgroundThings = function () {
  var i, thing;
  for (i = 0; i < ThingManager.things.length; i++) {
    thing = ThingManager.things[i];
    if (thing.type === THING_TYPE.BACKGROUND) {
      Display.drawThing(thing);
    }
  }
};

/**
 * @function drawThing
 * @static
 *
 * @description
 * ##### Draw an individual thing
 * Decide what kind of primitive shape this thing is and farm out the drawing of it to the `Shape` class.
 * - Although things have their own `pos.x`/`pos.y` properties, sometimes they are drawn offset to suggest depth/parallax
 * - So `displayX` and `displayY` are calculated here, and may not be the same as the `pos` properties
 *
 * @param {object} _thing - The thing to be drawn
 */
Display.drawThing = function (_thing) {
  var displayX,
    displayY,
    lateralOffset = 0,
    parallaxMultiplier = 1;

  if (_thing.type === THING_TYPE.BACKGROUND) {
    parallaxMultiplier = GAME.BACKGROUND_LATERAL_MULTIPLIER;
  }

  displayX = _thing.pos.x + lateralOffset;
  displayY = _thing.pos.y;

  switch (_thing.subtype) {
    default:
      Shape.drawCircle(displayX, displayY, {
        radius: _thing.radius,
        color: _thing.color,
      });
      break;
  }
};

export { Display };
