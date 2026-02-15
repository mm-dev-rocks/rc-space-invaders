/**
 * @license GPL-3.0-only
 *
 * @author Mark Mayes / mm-dev
 *
 *
 * @module Sprite
 *
 * @description
 * ## Draw sprites from a sprite sheet
 */

import { Display } from "./Display.js";
import { ImageManager } from "./ImageManager.js";
import { __, getOffscreenOrNormalCanvas } from "./utils.js";

class Sprite {
  /** @type {Object} */ static frameCanvasCache;
  /** @type {Object} */ static frameCountById;
  /** @type {HTMLCanvasElement | OffscreenCanvas | null} */ static frameCacheCanvas;
  /** @type {RenderingContext | OffscreenCanvasRenderingContext2D | null} */ static frameCacheCanvasCtx;
  /** @type {HTMLCanvasElement | OffscreenCanvas | null} */ static coloredFrameBufferCanvas;
  /** @type {RenderingContext | OffscreenCanvasRenderingContext2D | null} */ static coloredFrameBufferCtx;
}

/**
 * @function init
 * @static
 *
 * @description
 * ##### Create some `canvas` elements and references to their `context`s
 * - When drawing a string this canvas is used as a buffer before drawing to the main canvas.
 *
 * `Sprite.coloredFrameBufferCanvas`
 * - The bitmap font is black pixels on a transparent background. This canvas is used with `globalCompositeOperation = 'destination-atop'` to re-colour the black pixels, according to the level settings.
 */
Sprite.init = function () {
  Sprite.coloredFrameBufferCanvas = getOffscreenOrNormalCanvas();
  Sprite.coloredFrameBufferCtx = Sprite.coloredFrameBufferCanvas.getContext("2d", {
    willReadFrequently: true,
    desynchronized: true,
  });
  Sprite.coloredFrameBufferCtx.imageSmoothingEnabled = false;
};

/**
 * @function precacheSheet
 * @static
 *
 * @description
 * ##### Build a cache of all available frames from a spritesheet
 *
 * PRESUMPTION: Sheet will be vertically stacked
 *
 * - List of available frames is derived from `IMAGE_DATA.js`
 * - Each frame is drawn to a `canvas` and stored in `Sprite.frameCanvasCache`, indexed by its zero-indexed frame
 *   number
 *
 * @param {string} _spritesheetImageId - The ID of the image as per IMAGE_DATA
 */
Sprite.precacheSheet = function (_spritesheetImageId) {
  var i,
    sheetImage_el = ImageManager.allImages_ob[_spritesheetImageId].image_el,
    // `data.height` is the height of each frame
    totalFrames = sheetImage_el.height / sheetImage_el.data.height;

  // Create if not yet doneframeCanvasCache
  Sprite.frameCanvasCache ??= {};
  Sprite.frameCountById ??= {};

  Sprite.frameCanvasCache[_spritesheetImageId] = {};
  Sprite.frameCountById[_spritesheetImageId] = totalFrames;

  for (i = 0; i < totalFrames; i++) {
    Sprite.cacheFrame(_spritesheetImageId, i);
  }
};

/**
 * @function cacheFrame
 * @static
 *
 * @description
 * ##### Get a frame from the spritesheet and cache it to `Sprite.frameCanvasCache[_char]`
 *
 * @param {string} _spritesheetImageId - The ID of the image as per IMAGE_DATA
 * @param {number} _frameIndex - The frame to cache
 */
Sprite.cacheFrame = function (_spritesheetImageId, _frameIndex) {
  __(`Sprite.cacheFrame: (${_spritesheetImageId}, ${_frameIndex})`);
  var spritesheetImage = ImageManager.allImages_ob[_spritesheetImageId].image_el,
    spritesheetPosY = spritesheetImage.data.height * _frameIndex;

  Sprite.recreateFrameCacheCanvas(spritesheetImage.data.width, spritesheetImage.data.height);
  Sprite.frameCacheCanvasCtx.drawImage(
    spritesheetImage,
    0,
    spritesheetPosY,
    spritesheetImage.data.width,
    spritesheetImage.data.height,
    0,
    0,
    spritesheetImage.data.width,
    spritesheetImage.data.height,
  );
  Sprite.frameCanvasCache[_spritesheetImageId][_frameIndex] = Sprite.frameCacheCanvas;
};

/**
 * @function recreateFrameCacheCanvas
 * @static
 *
 * @description
 * ##### Recreate the temporary canvas used for the cached bitmap characters
 */
Sprite.recreateFrameCacheCanvas = function (_width, _height) {
  if (Sprite.frameCacheCanvas) {
    Sprite.frameCacheCanvas = null;
  }
  Sprite.frameCacheCanvas = getOffscreenOrNormalCanvas();
  Sprite.frameCacheCanvas.width = _width;
  Sprite.frameCacheCanvas.height = _height;
  Sprite.frameCacheCanvasCtx = Sprite.frameCacheCanvas.getContext("2d", {
    willReadFrequently: true,
    desynchronized: true,
  });
  Sprite.frameCacheCanvasCtx.imageSmoothingEnabled = false;
};

/**
 * @function setColoredFrameBuffer
 * @static
 *
 * @description
 * ##### Get a frame and recolour it
 *
 * @param {string} _spritesheetImageId - The ID of the image as per IMAGE_DATA
 * @param {number} _frameIndex - The frame to cache
 * @param {string} _color - The fill colour for the frame
 */
Sprite.setColoredFrameBuffer = function (_spritesheetImageId, _frameIndex, _color) {
  var spritesheetImage = ImageManager.allImages_ob[_spritesheetImageId].image_el,
    imageToColor = Sprite.frameCanvasCache[_spritesheetImageId][_frameIndex];

  // Fill a buffer with the solid color we want the text to be
  Sprite.coloredFrameBufferCtx.clearRect(0, 0, spritesheetImage.width, spritesheetImage.height);
  Sprite.coloredFrameBufferCtx.fillStyle = _color;
  Sprite.coloredFrameBufferCtx.fillRect(0, 0, spritesheetImage.width, spritesheetImage.height);

  // Draw buffered text on the colour in a way ('destination-atop') that chops
  // off all the transparent pixels, so ends up looking like a solid mask
  // in the shape of the text
  Sprite.coloredFrameBufferCtx.globalCompositeOperation = "destination-atop";
  Sprite.coloredFrameBufferCtx.drawImage(imageToColor, 0, 0);
};

export { Sprite };
