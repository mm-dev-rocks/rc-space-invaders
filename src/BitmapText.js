/**
 * @license GPL-3.0-only
 *
 * @author Mark Mayes / mm-dev
 *
 *
 * @module BitmapText
 *
 * @description
 * ## Low-level text drawing
 * The `Text` class farms out text-drawing operations to this class.
 * - `ImageManager.allImages_ob` stores data on the bitmap font spritesheet images
 * - The data (originating from {@link PD/IMAGE_DATA.js}) lists allowed multiples for each font, so eg a font might be allowed to be displayed at 2x, 4x, 8x of its original size
 * - The spritesheet images store 1-bit fonts at their smallest sizes
 * - The best-fitting multiple is stored as `BitmapText.spritesheetScale` for use by this and other classes
 * - If no font/multiple can be found to fit the desired number of characters in this viewport, use the smallest font and set `BitmapText.useShortVersions = true`
 */

import { PD } from "./PD/CONST.js";
import * as GAME from "./PD/GAME.js";
import * as STRING from "./PD/STRING.js";

import { ImageManager } from "./ImageManager.js";
import { Display } from "./Display.js";
import { Layout } from "./Layout.js";

import { __, getOffscreenOrNormalCanvas } from "./utils.js";

class BitmapText {}

/**
 * @function init
 * @static
 *
 * @description
 * ##### Create some `canvas` elements and references to their `context`s
 * `BitmapText.stringCacheCanvas`
 * - When drawing a string this canvas is used as a buffer before drawing to the main canvas.
 *
 * `BitmapText.coloredStringBufferCanvas`
 * - The bitmap font is black pixels on a transparent background. This canvas is used with `globalCompositeOperation = 'destination-atop'` to re-colour the black pixels, according to the level settings.
 */
BitmapText.init = function () {
  BitmapText.coloredStringBufferCanvas = getOffscreenOrNormalCanvas();
  BitmapText.coloredStringBufferCtx =
    BitmapText.coloredStringBufferCanvas.getContext("2d", {
      willReadFrequently: true,
      desynchronized: true,
    });
  BitmapText.coloredStringBufferCtx.imageSmoothingEnabled = false;

  BitmapText.stringCacheCanvas = getOffscreenOrNormalCanvas();
  BitmapText.stringCacheCtx = BitmapText.stringCacheCanvas.getContext("2d", {
    willReadFrequently: true,
    desynchronized: true,
  });
  BitmapText.stringCacheCtx.imageSmoothingEnabled = false;
};

/**
 * @function recreateCharCacheCanvas
 * @static
 *
 * @description
 * ##### Recreate the temporary canvas used for the cached bitmap characters
 */
BitmapText.recreateCharCacheCanvas = function () {
  if (BitmapText.charCacheCanvas) {
    BitmapText.charCacheCanvas = null;
    delete BitmapText.charCacheCanvas;
  }
  BitmapText.charCacheCanvas = getOffscreenOrNormalCanvas();
  BitmapText.charCacheCanvas.width = BitmapText.drawnCharWidth;
  BitmapText.charCacheCanvas.height = BitmapText.drawnCharHeight;
  BitmapText.charCacheCanvasCtx = BitmapText.charCacheCanvas.getContext("2d", {
    willReadFrequently: true,
    desynchronized: true,
  });
  BitmapText.charCacheCanvasCtx.imageSmoothingEnabled = false;
};

/**
 * @function precacheAllCharacters
 * @static
 *
 * @description
 * ##### Build a cache of all available characters
 * - List of available characters is defined in `GAME.CHARS_IN_SPRITESHEET_AR`
 * - Each character is drawn to a `canvas` and stored in `BitmapText.charCanvasCache`, indexed by its character
 * - So eg the letter 'C' would be stored as `BitmapText.charCanvasCache['C']`
 *
 * ##### Unknown characters
 * We want to gracefully handle characters which don't appear in the
 * spritesheet.
 *
 * STRING.UNKNOWN_CHARACTER is a special string we use to represent them.
 *
 * BitmapText.unknownCharacterSpritesheetCoords are some coordinates outside the
 * bitmap font image, meaning they return an empty image (which is in effect
 * a `space` character).
 *
 * Intentional `space` characters are treated as an unknown character, so we
 * don't have to include them on the spritesheet and waste space.
 */
BitmapText.precacheAllCharacters = function () {
  var i,
    currentChar,
    spritesheetRows =
      (BitmapText.spritesheetImage.height / BitmapText.drawnCharHeight) *
      BitmapText.spritesheetScale,
    spritesheetTotalChars = GAME.BITMAPFONT_SPRITESHEET_COLS * spritesheetRows;

  BitmapText.charCanvasCache = {};

  BitmapText.unknownCharacterSpritesheetCoords = {
    x: 0 - BitmapText.drawnCharWidth,
    y: 0 - BitmapText.drawnCharHeight,
  };

  for (i = 0; i < spritesheetTotalChars; i++) {
    currentChar = GAME.CHARS_IN_SPRITESHEET_AR[i];
    if (currentChar !== undefined) {
      BitmapText.cacheCharacter(currentChar);
    }
  }
  BitmapText.cacheCharacter(STRING.UNKNOWN_CHARACTER);
};

/**
 * @function chooseBestFittingFont
 * @static
 *
 * @description
 * ##### Choose a font and scaling based on viewport dimensions
 * Calculate character sizes that allow us to fit the desired number of characters (`GAME.CHARS_IN_CANVAS_WIDTH` and `GAME.CHARS_IN_CANVAS_HEIGHT`) on the main canvas.
 */
BitmapText.chooseBestFittingFont = function () {
  var i,
    currentFontKey,
    currentFontData,
    bestFittingFontData,
    fullLineWidth,
    fullLineHeight,
    characterArea,
    smallestFontData,
    currentMultiple,
    multiples,
    default_multiples = [1],
    largestArea = 0;

  for (currentFontKey in ImageManager.allImages_ob) {
    currentFontData = ImageManager.allImages_ob[currentFontKey];
    if (currentFontData.hasOwnProperty("letterSpacing")) {
      multiples = currentFontData.multiples || default_multiples;
      for (i = 0; i < multiples.length; i++) {
        currentMultiple = multiples[i];

        fullLineWidth =
          (currentFontData.width + currentFontData.letterSpacing) *
          GAME.CHARS_IN_CANVAS_WIDTH;
        fullLineHeight =
          (currentFontData.height + currentFontData.lineSpacing) *
          GAME.CHARS_IN_CANVAS_HEIGHT;
        characterArea = currentFontData.width * currentFontData.height;

        fullLineWidth *= currentMultiple;
        fullLineHeight *= currentMultiple;
        characterArea *= currentMultiple;

        if (currentFontData.isSmallestFont) {
          smallestFontData = currentFontData;
        }

        if (
          fullLineWidth <= Layout.canvasWidth &&
          fullLineHeight <= Layout.canvasHeight &&
          characterArea > largestArea
        ) {
          bestFittingFontData = currentFontData;
          largestArea = characterArea;
          BitmapText.spritesheetScale = currentMultiple;
        }
      }
    }
  }

  if (!bestFittingFontData) {
    __("CANVAS TOO SMALL FOR ALL TEXT", PD.FMT_TEXT);
    BitmapText.useShortVersions = true;
    bestFittingFontData = smallestFontData;
    BitmapText.spritesheetScale = 1;
  } else {
    BitmapText.useShortVersions = false;
  }
  __(
    "BitmapText.useShortVersions: " + BitmapText.useShortVersions,
    PD.FMT_TEXT
  );

  BitmapText.drawnCharWidth = bestFittingFontData.width;
  BitmapText.letterSpacing = bestFittingFontData.letterSpacing;
  BitmapText.fullCharWidth =
    bestFittingFontData.width + bestFittingFontData.letterSpacing;

  BitmapText.drawnCharHeight = bestFittingFontData.height;
  BitmapText.lineSpacing = bestFittingFontData.lineSpacing;
  BitmapText.lineHeight =
    bestFittingFontData.height + bestFittingFontData.lineSpacing;

  BitmapText.drawnCharWidth *= BitmapText.spritesheetScale;
  BitmapText.letterSpacing = Math.ceil(
    BitmapText.spritesheetScale / GAME.SCALED_TEXT_SPACINGROWTH_DIVISOR
  );
  BitmapText.fullCharWidth *= BitmapText.spritesheetScale;

  BitmapText.drawnCharHeight *= BitmapText.spritesheetScale;
  BitmapText.lineSpacing = Math.ceil(
    BitmapText.spritesheetScale / GAME.SCALED_TEXT_SPACINGROWTH_DIVISOR
  );
  BitmapText.lineHeight *= BitmapText.spritesheetScale;

  BitmapText.spritesheetImage = ImageManager.getImageByID(
    bestFittingFontData.id
  ).image_el;

  __(
    "BitmapText.spritesheetImage.width: " + BitmapText.spritesheetImage.width,
    PD.FMT_TEXT
  );

  __(
    "BitmapText.spritesheetImage.height: " + BitmapText.spritesheetImage.height,
    PD.FMT_TEXT
  );

  __(
    "BitmapText.spritesheetScale: " + BitmapText.spritesheetScale,
    PD.FMT_TEXT
  );

  __("BitmapText.drawnCharWidth: " + BitmapText.drawnCharWidth, PD.FMT_TEXT);
  __("BitmapText.letterSpacing: " + BitmapText.letterSpacing, PD.FMT_TEXT);
  __("BitmapText.fullCharWidth: " + BitmapText.fullCharWidth, PD.FMT_TEXT);

  __("BitmapText.drawnCharHeight: " + BitmapText.drawnCharHeight, PD.FMT_TEXT);
  __("BitmapText.lineSpacing: " + BitmapText.lineSpacing, PD.FMT_TEXT);
  __("BitmapText.lineHeight: " + BitmapText.lineHeight, PD.FMT_TEXT);

  __("bestFittingFontData.id: " + bestFittingFontData.id, PD.FMT_TEXT);

  __(
    "Max chars in this width: " +
      Layout.canvasWidth /
        (bestFittingFontData.width + bestFittingFontData.letterSpacing),
    PD.FMT_TEXT
  );
  __(
    "Max chars in this height: " +
      Layout.canvasHeight /
        (bestFittingFontData.height + bestFittingFontData.lineSpacing),
    PD.FMT_TEXT
  );
};

/**
 * @function getCharCoordsInSpritesheet
 * @static
 *
 * @description
 * ##### Find the index of a character in the spritesheet, then use the index to get its coordinates
 * Charactes are indexed in the spritesheet in left-to-right, top-to-bottom order so eg:
 * ```
 * ABCDEFGH
 * IJKLMNOP
 * ```
 * are indexed as:
 * ```
 * 0, 1, 2, 3, 4, 5, 6, 7, 8,
 * 9, 10, 11, 12, 13, 14, 15, 16
 * ```
 *
 * @param {string} _char - The character to find
 *
 * @returns {object} Coordinates `{x, y}` of where the character appears in the spritesheet
 */
BitmapText.getCharCoordsInSpritesheet = function (_char) {
  var indexInSpritesheet = GAME.CHARS_IN_SPRITESHEET_AR.indexOf(_char),
    coords = BitmapText.unknownCharacterSpritesheetCoords;
  if (indexInSpritesheet !== -1) {
    coords = BitmapText.charCoordsFromSpritesheetIndex(indexInSpritesheet);
  }
  return coords;
};

/**
 * @function charCoordsFromSpritesheetIndex
 * @static
 *
 * @description
 * ##### Given an index, find the coordinates of a character in the spritesheet
 *
 * @param {number} _index - The index of the character in the spritesheet
 *
 * @returns {object} Coordinates `{x, y}` of where the character appears in the spritesheet
 */
BitmapText.charCoordsFromSpritesheetIndex = function (_index) {
  var col = _index % GAME.BITMAPFONT_SPRITESHEET_COLS,
    row = Math.floor(_index / GAME.BITMAPFONT_SPRITESHEET_COLS);

  return {
    x: (col * BitmapText.drawnCharWidth) / BitmapText.spritesheetScale,
    y: (row * BitmapText.drawnCharHeight) / BitmapText.spritesheetScale,
  };
};

/**
 * @function lineToBitmap
 * @static
 *
 * @description
 * ##### Convert a line of text to a bitmap and draw it to the main canvas
 * - First it is drawn 3 times at different offsets to form the text 'shadow'
 * - Then a coloured version is made and stacked on top to create the main coloured text
 *
 * @param {string} _str - The single-line string to be converted to a bitmap
 * @param {number} _x - X coordinate where it should be drawn to
 * @param {number} _y - Y coordinate where it should be drawn to
 * @param {string} _color - Desired colour
 * @param {string} _shadowColor - Colour for shadow
 */
BitmapText.lineToBitmap = function (_str, _x, _y, _color, _shadowColor) {
  var i,
    stringWidth = BitmapText.fullCharWidth * _str.length;

  BitmapText.stringCacheCanvas.width = stringWidth;
  BitmapText.stringCacheCanvas.height = BitmapText.drawnCharHeight;

  BitmapText.coloredStringBufferCanvas.width = stringWidth;
  BitmapText.coloredStringBufferCanvas.height = BitmapText.drawnCharHeight;

  // Fill up `BitmapText.stringCacheCanvas` with this line of text, rendered in
  // the black bitmap font
  for (i = 0; i < _str.length; i++) {
    BitmapText.drawCharacterToStringCache(
      _str.charAt(i),
      i * BitmapText.fullCharWidth,
      0
    );
  }

  BitmapText.drawLineShadow(_x, _y, _shadowColor);
  BitmapText.drawLineColor(_x, _y, _color);
};

/**
 * @function drawLineColor
 * @static
 *
 * @description
 * ##### The main, coloured text
 *
 * @param {number} _x - X coordinate for the line
 * @param {number} _y - Y coordinate for the line
 * @param {string} _color - The fill colour for the text
 */
BitmapText.drawLineColor = function (_x, _y, _color) {
  // Fill a buffer with the solid color we want the text to be
  BitmapText.coloredStringBufferCtx.clearRect(
    0,
    0,
    BitmapText.coloredStringBufferCanvas.width,
    BitmapText.coloredStringBufferCanvas.height,
  );
  BitmapText.coloredStringBufferCtx.fillStyle = _color;
  BitmapText.coloredStringBufferCtx.fillRect(
    0,
    0,
    BitmapText.coloredStringBufferCanvas.width,
    BitmapText.coloredStringBufferCanvas.height,
  );

  // Draw buffered text on the colour in a way ('destination-atop') that chops
  // off all the transparent pixels, so ends up looking like a solid mask
  // in the shape of the text
  BitmapText.coloredStringBufferCtx.globalCompositeOperation =
    "destination-atop";
  BitmapText.coloredStringBufferCtx.drawImage(
    BitmapText.stringCacheCanvas,
    0,
    0
  );

  // Draw the solid-colour-filled bitmap text in the main context
  Display.ctx.drawImage(BitmapText.coloredStringBufferCanvas, _x, _y);

  // Back to default blend mode
  Display.ctx.globalCompositeOperation = "source-over";
};

/**
 * @function drawLineShadow
 * @static
 *
 * @description
 * ##### Draw the shadow underneath the line of text
 *
 * @param {number} _x - X coordinate for the line
 * @param {number} _y - Y coordinate for the line
 * @param {string} _color - The fill colour for the shadow
 */
BitmapText.drawLineShadow = function (_x, _y, _color) {
  // In the main context, draw the (black) cached string at 3 offsets to form the drop shadow
  BitmapText.drawLineColor(
    _x + BitmapText.spritesheetScale,
    _y + BitmapText.spritesheetScale,
    _color
  );
  BitmapText.drawLineColor(
    _x,
    _y + BitmapText.spritesheetScale,
    _color
  );
  BitmapText.drawLineColor(
    _x + BitmapText.spritesheetScale,
    _y,
    _color
  );
};

/**
 * @function drawCharacterToStringCache
 * @static
 *
 * @description
 * ##### Get a character from the cache and add it to `BitmapText.stringCacheCanvas`
 *
 * @param {string} _char - The character to add
 * @param {number} _x - X coordinate where it should be drawn to
 * @param {number} _y - Y coordinate where it should be drawn to
 */
BitmapText.drawCharacterToStringCache = function (_char, _x, _y) {
  BitmapText.stringCacheCtx.drawImage(
    BitmapText.charCanvasCache[_char] ||
      BitmapText.charCanvasCache[STRING.UNKNOWN_CHARACTER],
    _x,
    _y,
    BitmapText.drawnCharWidth,
    BitmapText.drawnCharHeight
  );
};

/**
 * @function cacheCharacter
 * @static
 *
 * @description
 * ##### Get a character from the spritesheet and cache it to `BitmapText.charCanvasCache[_char]`
 *
 * @param {string} _char - The character to cache
 */
BitmapText.cacheCharacter = function (_char) {
  //__("BitmapText.cacheCharacter: " + _char);
  var spritesheetPos = BitmapText.getCharCoordsInSpritesheet(_char);
  //__("spritesheetPos: " + JSON.stringify(spritesheetPos));

  BitmapText.recreateCharCacheCanvas();
  BitmapText.charCacheCanvasCtx.drawImage(
    BitmapText.spritesheetImage,
    spritesheetPos.x,
    spritesheetPos.y,
    BitmapText.drawnCharWidth / BitmapText.spritesheetScale,
    BitmapText.drawnCharHeight / BitmapText.spritesheetScale,
    0,
    0,
    BitmapText.drawnCharWidth,
    BitmapText.drawnCharHeight
  );
  BitmapText.charCanvasCache[_char] = BitmapText.charCacheCanvas;
  __(
    "\tBitmapText.charCanvasCache[_char]: " + BitmapText.charCanvasCache[_char],
    PD.FMT_TEXT
  );
};

export { BitmapText };
