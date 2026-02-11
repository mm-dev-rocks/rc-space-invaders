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

import { PD } from "./PD/CONST.js";
import {
  ADDED_LAYER,
  ASPECT_RATIO,
  OBSTACLE_SUBTYPE,
  OBSTACLE_TYPE,
} from "./PD/ENUM.js";
import * as GAME from "./PD/GAME.js";
import * as IMAGE_IDS from "./PD/IMAGE_IDS.js";
import * as STRING from "./PD/STRING.js";

import { AddedLayer } from "./AddedLayer.js";
import { Controller } from "./Controller.js";
import { FullscreenManager } from "./FullscreenManager.js";
import { Game } from "./Game.js";
import { HealthMeter } from "./HealthMeter.js";
import { ImageManager } from "./ImageManager.js";
import { InternalTimer } from "./InternalTimer.js";
import { IntroObstacles } from "./IntroObstacles.js";
import { Layout } from "./Layout.js";
import { ObstacleManager } from "./ObstacleManager.js";
import { OverlayText } from "./OverlayText.js";
import { PipeWalls } from "./PipeWalls.js";
import { Player } from "./Player.js";
import { Shape } from "./Shape.js";
import { Text } from "./Text.js";

import { __, hexOpacityToRGBA, modulo } from "./utils.js";

class Display {}

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
  __("Display.init()", PD.FMT_DISPLAY);
  if (!Display.canvas) {
    Display.createCanvas();
  }

  Display.titleImage = ImageManager.getImageByID(IMAGE_IDS.MAIN_TITLE).image_el;

  Layout.init();
  Text.init();
  OverlayText.init();
  PipeWalls.init();
};

/**
 * @function setupForLevel
 * @static
 *
 * @description
 * ##### Update some level-specific details
 * - Custom colours
 * - Instruction text if this is the first screen
 * - Which obstacles to show on the level intro screen
 */
Display.setupForLevel = function () {
  __("Display.setupForLevel()", PD.FMT_DISPLAY);

  Display.levelIsDark = Game.curLevelData.isDark;
  Display.textColor = Game.curLevelData.textColor;
  Display.textColorHighlight = Game.curLevelData.textColorHighlight;
  //Display.setBackgroundColor(Game.curLevelData.bgColor);
  //document.body.style.backgroundColor = Game.curLevelData.bgColor;
  Display.bgFadeAlpha = Game.curLevelData.bgFadeAlpha;
  Display.shadowColor =
    Game.curLevelData.textColorShadow || GAME.TEXT_DEFAULT_SHADOW_COLOR;
  if (Game.isOnFrontPage) {
    Display.instruct_text = Game.curLevelData.instruct_text;
  }

  Display.updateLayout();

  IntroObstacles.setupForLevel();

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
  Display.overlayBgColor = hexOpacityToRGBA(
    _hexColor,
    GAME.TEXT_BACKGROUND_FILL_ALPHA
  );
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
  if (Layout.sessionAspectRatio === ASPECT_RATIO.LANDSCAPE) {
    Display.isLandscapeAspect = true;
  } else {
    Display.isLandscapeAspect = false;
  }
  Display.canvas.width = Layout.canvasWidth;
  Display.canvas.height = Layout.canvasHeight;

  Player.updateSizes();
  HealthMeter.updateSizes();
  Controller.updateSizes();
  IntroObstacles.updateSizes();
  Shape.updateSizes();
  PipeWalls.updateSizes();
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
  __("Display.createCanvas()", PD.FMT_INFO);

  Display.canvas = document.createElement("canvas");
  Display.canvas.id = PD.EL_IDS.ACTIVEAREA_CANVAS;
  // Declaring that we don't need the canvas itself to use transparency allows
  // the browser to optimise
  Display.ctx = Display.canvas.getContext("2d", {
    alpha: false,
    willReadFrequently: true,
    // Never set `desynchronized: true` on this canvas context!
    // It works on secondary canvases in `PipeWalls` and `Text`, but here it causes blank screens/empty canvas in some browsers TODO Why??
    //desynchronized: true,
  });
  Display.ctx.imageSmoothingEnabled = false;

  Display.ctxDefault = Display.ctx;

  if (Display.ctx.roundRect) {
    Display.hasRoundRect = true;
  } else {
    Display.hasRoundRect = false;
  }

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
  var t1, t2;

  if (Game.doPerfLog) {
    t1 = performance.now();
  }

  Display.drawBackground();
  Display.drawBackgroundObstacles();
  if (!Game.isOnFrontPage) {
    Display.drawBackgroundFade();
    Display.drawForegroundObstacles();
  }

  if (Game.isOnFrontPage) {
    Display.drawTitle();
    Text.drawInstructions(Display.instruct_text);
    Text.drawVersionInfo();
  }

  Player.draw();

  if (!Game.isOnFrontPage) {
    if (Game.doPerfLog) {
      t2 = performance.now();
    }
    PipeWalls.draw();
    if (Game.doPerfLog) {
      __("PipeWalls.draw() " + (performance.now() - t2), PD.FMT_PERFORMANCE);
    }
    Display.drawFloatingObstacles();
  }

  if (!Game.isInGameOver) {
    Controller.draw();
  }

  HealthMeter.draw();

  if (!Game.isOnFrontPage) {
    if (!Game.timeIsLow) {
      Text.drawTimeRemaining();
    } else {
      Text.drawTimeRemaining({ timeIsLow: true });
    }
    Text.drawCollected();
    Text.drawLevel();
  }

  if (OverlayText.content_ar?.length > 0) {
    OverlayText.draw();
  }

  Display.drawSoundToggle();
  Display.drawFullscreenToggle();

  if (!Game.isOnFrontPage && Game.isInLevelIntro) {
    Text.drawVersionInfo({ isInLevelIntro: true, color: Display.textColor });
  }

  //if (Game.textIsFading) {
  //  Game.introTextFadeAlpha += Game.introTextFadeStepSize;
  //  if (Game.introTextFadeStepSize > 0) {
  //    // Fading in
  //    if (Game.introTextFadeAlpha > 1 - Game.introTextFadeStepSize) {
  //      Game.introTextFadeAlpha = 1;
  //    }
  //  } else {
  //    // Fading out
  //    if (Game.introTextFadeAlpha < Game.introTextFadeStepSize) {
  //      Game.introTextFadeAlpha = 0;
  //    }
  //  }
  //}

  if (Game.showFps) {
    Text.drawFps();
  }

  if (Game.doPerfLog) {
    __("Display.update() " + (performance.now() - t1), PD.FMT_PERFORMANCE);
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
    Layout.mainTitle_rect.bottom - Layout.mainTitle_rect.top
  );
  Display.ctx.filter = "none";
};

/**
 * @function drawFullscreenToggle
 * @static
 *
 * @description
 * ##### The enter/exit fullscreen toggle icon
 */
Display.drawFullscreenToggle = function () {
  Text.draw({
    text: STRING.FULLSCREEN,
    color: FullscreenManager.isFullscreen
      ? Display.textColorHighlight
      : Display.textColor,
    drawBackground: true,
    alignH: Layout.currentAspectUI.fullscreenToggle.alignH,
    alignV: Layout.currentAspectUI.fullscreenToggle.alignV,
  });
};

/**
 * @function drawSoundToggle
 * @static
 *
 * @description
 * ##### The sound on/off toggle icon
 */
Display.drawSoundToggle = function () {
  Text.draw({
    text: Game.soundIsEnabled ? STRING.SOUND_ENABLED : STRING.SOUND_DISABLED,
    color: Game.soundIsEnabled ? Display.textColorHighlight : Display.textColor,
    drawBackground: true,
    alignH: Layout.currentAspectUI.soundToggle.alignH,
    alignV: Layout.currentAspectUI.soundToggle.alignV,
    offsetV:
      Layout.currentAspectUI.soundToggle.offsetByCharsV * Text.drawnCharHeight,
  });
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
 * @function drawBackgroundFade
 * @static
 *
 * @description
 * ##### Fade out part of the background
 * - Used to dim the inside of the pipe to suggest the glass material is absorbing light from things behind it
 * - As each level has a different combination of colours for the background fill and background obstacles, the level config contains a `bgFadeAlpha` variable to tweak the opacity of this fade
 */
Display.drawBackgroundFade = function () {
  var x, y, width, height;

  if (Display.isLandscapeAspect) {
    x = Layout.gameplay_rect.left;
    y = Controller.lateralOffset + Layout.gameAreaOffsetLateral;
  } else {
    x = Controller.lateralOffset + Layout.gameAreaOffsetLateral;
    y = Layout.gameplay_rect.top;
  }
  width = Layout.gameplayWidth;
  height = Layout.gameplayHeight;

  Display.ctx.fillStyle = hexOpacityToRGBA(
    Display.bgColor,
    Display.bgFadeAlpha
  );
  Display.ctx.fillRect(x, y, width, height);
};

/**
 * @function drawBackgroundObstacles
 * @static
 *
 * @description
 * ##### Background obstacles
 * - Are below and do not interact with the player
 * - Conceptually are on the **bottom layer**
 */
Display.drawBackgroundObstacles = function () {
  var i, obstacle;
  for (i = 0; i < ObstacleManager.obstacles.length; i++) {
    obstacle = ObstacleManager.obstacles[i];
    if (obstacle.type === OBSTACLE_TYPE.BACKGROUND) {
      Display.drawObstacle(obstacle);
    }
  }
};

/**
 * @function drawForegroundObstacles
 * @static
 *
 * @description
 * ##### Foreground obstacles
 * - Can interact with the player by being collected or causing health damage
 * - Conceptually are on the **middle layer**
 */
Display.drawForegroundObstacles = function () {
  var i, obstacle;
  for (i = 0; i < ObstacleManager.obstacles.length; i++) {
    obstacle = ObstacleManager.obstacles[i];
    if (
      !obstacle.isDeleted &&
      (obstacle.type === OBSTACLE_TYPE.COLLECT ||
        obstacle.type === OBSTACLE_TYPE.AVOID)
    ) {
      Display.drawObstacle(obstacle);
    }
  }
};

/**
 * @function drawFloatingObstacles
 * @static
 *
 * @description
 * ##### Floating obstacles
 * - Are above and do not interact with the player
 * - Conceptually are on the **top layer**
 */
Display.drawFloatingObstacles = function () {
  var i, obstacle;
  for (i = 0; i < ObstacleManager.obstacles.length; i++) {
    obstacle = ObstacleManager.obstacles[i];
    if (obstacle.type === OBSTACLE_TYPE.FLOATING) {
      Display.drawObstacle(obstacle);
    }
  }
};

/**
 * @function drawObstacle
 * @static
 *
 * @description
 * ##### Draw an individual obstacle
 * Decide what kind of primitive shape this obstacle is and farm out the drawing of it to the `Shape` class.
 * - Although obstacles have their own `pos.x`/`pos.y` properties, sometimes they are drawn offset to suggest depth/parallax
 * - So `displayX` and `displayY` are calculated here, and may not be the same as the `pos` properties
 *
 * @param {object} _obstacle - The obstacle to be drawn
 */
Display.drawObstacle = function (_obstacle) {
  var displayX,
    displayY,
    lateralOffset = 0,
    parallaxMultiplier = 1,
    ignore = false;

  if (_obstacle.type === OBSTACLE_TYPE.BACKGROUND) {
    parallaxMultiplier = GAME.BACKGROUND_LATERAL_MULTIPLIER;
  } else if (_obstacle.type === OBSTACLE_TYPE.FLOATING) {
    parallaxMultiplier = GAME.FLOATING_LATERAL_MULTIPLIER;
  }
  if (_obstacle.type !== OBSTACLE_TYPE.LEVELINTRO) {
    lateralOffset =
      (Controller.lateralOffset + Layout.gameAreaOffsetLateral) *
      parallaxMultiplier;
  }

  if (Display.isLandscapeAspect) {
    displayX = _obstacle.pos.x;
    displayY = _obstacle.pos.y + lateralOffset;
  } else {
    displayX = _obstacle.pos.x + lateralOffset;
    displayY = _obstacle.pos.y;
  }

  //if (_obstacle.type === OBSTACLE_TYPE.AVOID) {
  //  // AVOIDABLE
  //  _obstacle.damageSafetyCounter = 0;
  if (
    _obstacle.type === OBSTACLE_TYPE.AVOID &&
    _obstacle.damageSafetyCounter > 0 &&
    Display.flashIsOff(GAME.DAMAGE_FLASH_ON_SECS, GAME.DAMAGE_FLASH_OFF_SECS)
  ) {
    ignore = true;
  }

  //displayX = Math.round(displayX);
  //displayY = Math.round(displayY);

  if (!ignore) {
    switch (_obstacle.subtype) {
      case OBSTACLE_SUBTYPE.FLOWER:
        Shape.drawFlower(displayX, displayY, _obstacle);
        break;
      case OBSTACLE_SUBTYPE.STAR:
        Shape.drawStar(displayX, displayY, _obstacle);
        break;
      case OBSTACLE_SUBTYPE.SQUARCLE:
        Shape.drawSquarcle(displayX, displayY, _obstacle);
        break;
      case OBSTACLE_SUBTYPE.SKEWED_CIRCLE:
        Shape.drawSkewedCircle(displayX, displayY, _obstacle);
        break;
      default:
        Shape.drawCircle(displayX, displayY, {
          radius: _obstacle.radius,
          // TODO color/explodingColor are not used, always gradient?
          color: _obstacle.explodingColor || _obstacle.color,
          gradientFadePoint: _obstacle.gradientFadePoint,
          gradient: _obstacle.gradient,
          rotation: _obstacle.rotation,
          useDefaultStroke: _obstacle.useDefaultStroke,
        });
        break;
    }

    if (_obstacle.addedLayer_ar) {
      Display.drawAddedLayers(displayX, displayY, _obstacle);
    }
  }
};

/**
 * @function drawAddedLayers
 * @static
 *
 * @description
 * ##### Some obstacles have special added details eg:
 * - Hats
 * - Lines of detail
 *
 * @param {number} _x - X coordinate of the obstacle
 * @param {number} _y - Y coordinate of the obstacle
 * @param {object} _obstacle - The obstacle to be drawn on top of
 */
Display.drawAddedLayers = function (_x, _y, _obstacle) {
  var i, addedLayer;

  for (i = 0; i < _obstacle.addedLayer_ar.length; i++) {
    addedLayer = _obstacle.addedLayer_ar[i];

    // Add layer offsets if needed
    _x += addedLayer.offsetX ? addedLayer.offsetX * _obstacle.radius : 0;
    _y += addedLayer.offsetY ? addedLayer.offsetY * _obstacle.radius : 0;

    switch (addedLayer.type) {
      case ADDED_LAYER.SPOKES:
        AddedLayer.drawSpokes(_x, _y, _obstacle, addedLayer);
        break;
      case ADDED_LAYER.MOUTH:
        AddedLayer.drawMouth(_x, _y, _obstacle, addedLayer);
        break;
      case ADDED_LAYER.EYES:
        AddedLayer.drawEyes(_x, _y, _obstacle, addedLayer);
        break;
      case ADDED_LAYER.STETSON:
        AddedLayer.drawStetson(_x, _y, _obstacle, addedLayer);
        break;
      case ADDED_LAYER.STEM:
        AddedLayer.drawStem(_x, _y, _obstacle, addedLayer);
        break;
      case ADDED_LAYER.BOWLER:
        AddedLayer.drawBowler(_x, _y, _obstacle, addedLayer);
        break;
      case ADDED_LAYER.DOT:
        AddedLayer.drawDot(_x, _y, _obstacle, addedLayer);
        break;
      case ADDED_LAYER.TRIANGLES:
        AddedLayer.drawTriangles(_x, _y, _obstacle, addedLayer);
        break;
      default:
        break;
    }
  }
};

export { Display };
