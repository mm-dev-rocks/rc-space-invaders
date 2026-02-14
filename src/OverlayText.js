/**
 * @license GPL-3.0-only
 *
 * @author Mark Mayes / mm-dev
 *
 *
 * @module OverlayText
 *
 * @description
 * ## Create groups of text objects to be shown in the main central overlay
 * Used for example at the end of the game or during level intros.
 */

import { RCSI } from "./RCSI/CONST.js";
import { GAMEOVER_REASON } from "./RCSI/ENUM.js";
import * as GAME from "./RCSI/GAME.js";
import * as STRING from "./RCSI/STRING.js";

import { Game } from "./Game.js";

import { Display } from "./Display.js";
import { Text } from "./Text.js";

import { __, getOffscreenOrNormalCanvas } from "./utils.js";

class OverlayText {
  /** @type {Array} */ static text_ar;
  /** @type {Array} */ static content_ar;
  /** @type {HTMLCanvasElement | OffscreenCanvas | null} */ static canvas;
  /** @type {Object} */ static canvasCtx;
  /** @type {number} */ static levelIntroCollectLineNumber;
  /** @type {number} */ static levelIntroAvoidLineNumber;
}

/**
 * @function init
 * @static
 *
 * @description
 * ##### Create the canvas used to draw the overlay text
 * As the overlay text area has many overlapping objects, doing alpha fades on it produces ugly artifacts. So we use a separate canvas to compose the overlay, then draw it to the main canvas later.
 */
OverlayText.init = function () {
  if (OverlayText.canvas) {
    OverlayText.canvas = null;
  }
  OverlayText.canvas = getOffscreenOrNormalCanvas();

  OverlayText.canvasCtx = OverlayText.canvas.getContext("2d", {
    willReadFrequently: true,
    desynchronized: true,
  });
  if (OverlayText.canvasCtx) {
    OverlayText.canvasCtx.imageSmoothingEnabled = false;
  }
};

/**
 * @function draw
 * @static
 *
 * @description
 * ##### Draw 'overlay text', which is text in the middle of the screen eg during level intros, game over etc
 *
 * **Canvas context swap**
 *
 * We want to be able to animate a fade on the overlay. It contains several overlapping items, drawn by multiple modules. Each item gets drawn with its own faded alpha, leading to ugly buildups in summed-up opacity where items overlap.
 *
 * To work around this, the overlay is drawn to a separate canvas, then that entire canvas is drawn to the main canvas in a single operation.
 *
 * This is done by calling `Display.swapContext({ contextToSwapTo: OverlayText.canvasCtx })`. While this is in effect, every canvas operation from all modules will take place in the passed context.
 *
 * Afterwards, the context is put back to normal with `Display.swapContext({ backToDefault: true })`.
 *
 * **Level intros**
 *
 * These are a special case where we also need to draw examples of
 * obstacles which appear in this level. This complicates things as we want the
 * content to be centred. `OverlayText.padWithSpacesToFitObstacleGroups()` handles that.
 *
 * The sequence of operations here may be confusing:
 *
 * 0. Draw the overlay text with `{measureOnly: true}` --- which returns metrics about where the text is without drawing anything
 * positioned
 * 0. Draw the obstacles (which requires info about position of the text as above) --- which gets us the info about the width of the group of obstacles (this differs depending on how many different types of obstacle this level has)
 * 0. Draw the text for real into the separate canvas context
 * 0. Finally copy the separate canvas into the main canvas
 *
 */
OverlayText.draw = function () {
  var collectLinePos,
    avoidLinePos,
    textConfig = {
      text: OverlayText.content_ar,
      alignH: GAME.OVERLAY_TEXT_ALIGN_H,
      alignV: GAME.OVERLAY_TEXT_ALIGN_V,
      measureOnly: true,
    },
    // If both these are false we must be in a level intro
    isLevelIntro = !Game.isOnFrontPage && !Game.isInGameOver,
    // This is where we measure out the final positions of the text - no drawing happens here
    textMeasurements = Text.draw(textConfig);

  // Now we know the size of the text (including background and padding)
  OverlayText.wipeAndResizeCanvas(textMeasurements.bgMeasurements.width, textMeasurements.bgMeasurements.height);
  OverlayText.canvasCtx.translate(0 - textMeasurements.bgMeasurements.left, 0 - textMeasurements.bgMeasurements.top);
  Display.swapContext({ contextToSwapTo: OverlayText.canvasCtx });

  // Draw exactly the same text again, we had to draw it before the obstacles to get measurements, but now the obstacles might cover parts of the text, so re-draw it
  Text.draw(
    Object.assign(textConfig, {
      measureOnly: false,
      drawBackground: true,
      groupIsFadeable: true,
    }),
  );

  if (isLevelIntro) {
    collectLinePos = textMeasurements.lines_rect_ar[OverlayText.levelIntroCollectLineNumber];
    avoidLinePos = textMeasurements.lines_rect_ar[OverlayText.levelIntroAvoidLineNumber];
  }

  // Draw everything to the main canvas
  Display.swapContext({ backToDefault: true });

  if (Display.ctx && OverlayText.canvas) {
    Display.ctx.drawImage(
      OverlayText.canvas,
      textMeasurements.bgMeasurements.left,
      textMeasurements.bgMeasurements.top,
    );

    Display.ctx.globalAlpha = 1;
  }
};

/**
 * @function wipeAndResizeCanvas
 * @static
 *
 * @description
 * ##### Wipe and resize the overlay canvas, ready to re-draw the overlay
 *
 * @param {number} _w - Desired width of the canvas
 * @param {number} _h - Desired height of the canvas
 */
OverlayText.wipeAndResizeCanvas = function (_w, _h) {
  if (OverlayText.canvas) {
    OverlayText.canvas.width = _w;
    OverlayText.canvas.height = _h;
  }
  OverlayText.canvasCtx.clearRect(0, 0, _w, _h);
};

/**
 * @function getCurrentLevelDescription
 * @static
 *
 * @description
 * ##### Based on the current level data, create an array of objects describing the text
 * As per `Text.draw()`, each text object can have the following properties:
 * - `text` - The plain text string
 * - `color` - The colour of the text
 * - `flashing` - Set to `true` to make the text flash
 *
 * @returns {object[]} The array of text objects
 */
OverlayText.getCurrentLevelDescription = function () {
  var text_ar,
    levelStr = Game.curLevelId,
    //levelStr = STRING.LEVEL_TEXT + " " + Game.curLevelId,
    tipStr = Game.curLevelData.tip ? " " + Game.curLevelData.tip : "";

  text_ar = [
    {
      text: levelStr,
      color: Game.curLevelData.textColor,
    },
    {
      text: tipStr,
      color: Game.curLevelData.textColor,
      flashing: true,
    },
    GAME.TEXT_BLANKLINE,
  ];

  return text_ar;
};

/**
 * @function setEmpty
 * @static
 *
 * @description
 * ##### Empty the main text array (`OverlayText.content_ar`)
 */
OverlayText.setEmpty = function () {
  __("\t\tSETTING EMPTY OVERLAY TEXT", RCSI.FMT_GAME);
  OverlayText.content_ar = [];
};

/**
 * @function addCompletedLevelOutro
 * @static
 *
 * @description
 * ##### Create and add some text at the end of a level
 * - Creates text objects
 * - Directly appends the text objects to `OverlayText.content_ar`
 */
OverlayText.addCompletedLevelOutro = function () {
  __("Normal level completed - Setting level outro text", RCSI.FMT_OVERLAYTEXT);
  __("\t\tSETTING OVERLAY TEXT", RCSI.FMT_OVERLAYTEXT);
  OverlayText.content_ar = OverlayText.content_ar.concat(
    //OverlayText.getCurrentLevelDescription(),
    [
      {
        text: Game.curLevelId + " " + STRING.LEVEL_COMPLETED,
        color: Game.curLevelData.textColorHighlight,
      },
      GAME.TEXT_BLANKLINE,
      {
        text: STRING.LEVEL_SCORE + " " + Game.scoreForLevel,
        color: Game.curLevelData.textColor,
        flashing: true,
      },
      GAME.TEXT_BLANKLINE,
      {
        text: Game.timeRemaining.toString() + " " + STRING.TIME_REMAINING,
        color: Game.curLevelData.textColor,
      },
      GAME.TEXT_BLANKLINE,
    ],
  );
};

/**
 * @function updateLevelIntroSpecialLineNumbers
 * @static
 *
 * @description
 * ##### Work out where some special lines of text are
 * In the level intros, groups of 'avoid' and 'collect' obstacles are shown next to specific lines of text ('avoid' and 'eat').
 *
 * The line numbers of those important labels can change depending on what other text is displayed.
 *
 * In this function the lines are detected and stored in variables for other classes to use.
 */
OverlayText.updateLevelIntroSpecialLineNumbers = function () {
  var i, currentLine;

  for (i = 0; i < OverlayText.content_ar.length; i++) {
    currentLine = OverlayText.content_ar[i];
    if (currentLine.text === STRING.COLLECT_TEXT) {
      OverlayText.levelIntroCollectLineNumber = i;
    } else if (currentLine.text === STRING.AVOID_TEXT) {
      OverlayText.levelIntroAvoidLineNumber = i;
    }
  }
};

/**
 * @function addHitToStart
 * @static
 *
 * @description
 * ##### Add 'hit to start' text
 */
OverlayText.addHitToStart = function () {
  OverlayText.content_ar = OverlayText.content_ar.concat([
    {
      text: STRING.HIT_TO_START,
      color: Game.curLevelData.textColor,
      flashing: true,
    },
    GAME.TEXT_BLANKLINE,
  ]);
};

/**
 * @function addNormalLevelIntro
 * @static
 *
 * @description
 * ##### Create and add some text at the beginning of a level
 * - Creates text objects
 * - Directly appends the text objects to `OverlayText.content_ar`
 */
OverlayText.addNormalLevelIntro = function () {
  __("Normal level intro - Setting level intro text", RCSI.FMT_OVERLAYTEXT);
  __("\t\tSETTING OVERLAY TEXT", RCSI.FMT_OVERLAYTEXT);
  OverlayText.content_ar = OverlayText.content_ar.concat(OverlayText.getCurrentLevelDescription(), [
    {
      text: STRING.CURRENT_SCORE + " " + Game.currentScore,
      color: Game.curLevelData.textColorHighlight,
    },
    GAME.TEXT_BLANKLINE,
    {
      text: STRING.COLLECT_TEXT,
      color: Game.curLevelData.textColorHighlight,
    },
    GAME.TEXT_BLANKLINE,
    {
      text: STRING.AVOID_TEXT,
      color: Game.curLevelData.textColorHighlight,
    },
    GAME.TEXT_BLANKLINE,
  ]);

  OverlayText.updateLevelIntroSpecialLineNumbers();
};

/**
 * @function blankOutHitToStart
 * @static
 *
 * @description
 * ##### Render invisible any 'hit to start' or 'hit to replay' text
 * Usually when 'hit to start' or 'hit to replay' is shown, we want to remove it after the user interacts, but without disturbing the layout of the rest of the text. So here we find/replace the text if it exists in the current overlay content.
 */
OverlayText.blankOutHitToStart = function () {
  var i,
    blankString = "";

  if (OverlayText.content_ar?.length) {
    for (i = 0; i < OverlayText.content_ar.length; i++) {
      if (OverlayText.content_ar[i] === STRING.HIT_TO_START || OverlayText.content_ar[i] === STRING.HIT_TO_REPLAY) {
        OverlayText.content_ar[i] = blankString;
      } else if (
        OverlayText.content_ar[i].text === STRING.HIT_TO_START ||
        OverlayText.content_ar[i].text === STRING.HIT_TO_REPLAY
      ) {
        OverlayText.content_ar[i].text = blankString;
      }
    }
  }
};

/**
 * @function setGameOver
 * @static
 *
 * @description
 * ##### Create the 'game over' text
 * Directly overwrites the `OverlayText.content_ar` with new text objects.
 */
OverlayText.setGameOver = function (_reason) {
  var reasonText;

  OverlayText.setEmpty();

  switch (_reason) {
    case GAMEOVER_REASON.GAME_COMPLETED:
      reasonText = STRING.GAMEOVER_GAMECOMPLETED_TEXT;
      break;
    case GAMEOVER_REASON.HEALTH_DEPLETED:
      reasonText = STRING.GAMEOVER_HEALTHDEPLETED_TEXT;
      break;
    case GAMEOVER_REASON.TIMES_UP:
      reasonText = STRING.GAMEOVER_TIMESUP_TEXT;
      break;
  }

  if (_reason !== GAMEOVER_REASON.GAME_COMPLETED) {
    OverlayText.content_ar = OverlayText.content_ar.concat([
      { text: STRING.GAMEOVER_TEXT, color: Game.curLevelData.textColor },
      GAME.TEXT_BLANKLINE,
    ]);
  }

  OverlayText.content_ar = OverlayText.content_ar.concat([
    {
      text: reasonText,
      color: Game.curLevelData.textColorHighlight,
      flashing: true,
    },
    {
      text: STRING.FINAL_SCORE + " " + Game.currentScore,
      color: Game.curLevelData.textColorHighlight,
    },
  ]);

  if (_reason !== GAMEOVER_REASON.GAME_COMPLETED) {
    OverlayText.content_ar = OverlayText.content_ar.concat([
      {
        text: STRING.REMAINING + " " + Game.collectableRemaining + "/" + Game.collectableTotal,
        color: Game.curLevelData.textColor,
        flashing: true,
      },
    ]);
  }

  OverlayText.content_ar = OverlayText.content_ar.concat([
    GAME.TEXT_BLANKLINE,
    GAME.TEXT_BLANKLINE,
    { text: STRING.HIT_TO_REPLAY, color: Game.curLevelData.textColorHighlight },
  ]);
};

export { OverlayText };
