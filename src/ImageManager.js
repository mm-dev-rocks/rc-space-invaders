/**
 * @license GPL-3.0-only
 *
 * @author Mark Mayes / mm-dev
 *
 *
 * @module ImageManager
 *
 * @description
 * ## Pre-load required images
 *
 * - Cache as `<image>` elements
 */

import { RCSI } from "./RCSI/CONST.js";
import { __, manualEvent } from "./utils.js";

class ImageManager {
  /** @type {Array} */ static data_ar;
  /** @type {Array} */ static preload_ar;
  /** @type {Function} */ static preloadCallback;
  /** @type {Object} */ static allImages_ob;
}

/**
 * @function init
 * @static
 *
 * @description
 * ##### Initialise the image manager
 *
 * @param {Object} _ob - Data object with following properties:
 *
 * @property {Array} _ob.image_ar - Array of image data (each image has at least `id` and `file` and possibly other
 * metadata, see `/RCSI/IMAGE_DATA.js`)
 *
 * @property {Function} _ob.preloadCallback - Function to call when all images have loaded
 */
ImageManager.init = function (_ob) {
  var i, itemData, image_tmp;

  ImageManager.data_ar = _ob.image_ar;
  ImageManager.preloadCallback = _ob.preloadCallback;
  ImageManager.preload_ar = [];
  ImageManager.allImages_ob = {};

  // Loop through array of image files.
  // create image objects from them, add them to the preload_ar, and watch for them to finish loading.
  for (i = 0; i < ImageManager.data_ar.length; i++) {
    itemData = ImageManager.data_ar[i];
    if (ImageManager.allImages_ob[itemData.id]) {
      __("" + itemData.id + ": already exists - skipping preload", RCSI.FMT_IMAGEMANAGER);
    } else {
      image_tmp = document.createElement("img");
      image_tmp.src = itemData.file;
      image_tmp.addEventListener("load", ImageManager.onImageLoad);
      image_tmp.data = itemData;
      __("INITIALISING: " + itemData.file, RCSI.FMT_IMAGEMANAGER);
      ImageManager.preload_ar.push(image_tmp);
    }
  }
};

/**
 * @function getImageByID
 * @static
 *
 * @description
 * ##### Get an image and associated data
 *
 * @param {String} _id - The image ID as used during initialisation
 *
 * @returns {Object} Containing an HTMLImageElement and associated metadata
 */
ImageManager.getImageByID = function (_id) {
  return ImageManager.allImages_ob[_id];
};

/**
 * @function updatePreloadStatus
 * @static
 *
 * @description
 * ##### Update status of preloaded images
 *
 * Check whether all images are now loaded and call the `preloadCallback` function if so
 *
 * @param {HTMLImageElement} _el - An image element that has just updated its loading status
 */
ImageManager.updatePreloadStatus = function (_el) {
  var i;

  for (i = 0; i < ImageManager.preload_ar.length; i++) {
    if (ImageManager.preload_ar[i] === _el) {
      ImageManager.preload_ar.splice(i, 1);
      __("LOADED: " + _el.data.id, RCSI.FMT_IMAGEMANAGER);
      break;
    }
  }

  manualEvent(document, "itempreload", {
    imageItemsLoaded: ImageManager.data_ar.length - ImageManager.preload_ar.length,
  });

  if (ImageManager.preload_ar.length === 0) {
    if (ImageManager.preloadCallback) {
      ImageManager.preloadCallback();
    }
  }
};

/**
 * @function onImageLoad
 * @static
 *
 * @description
 * ##### Process an image load event
 *
 * Update the `allImages_ob` object with final data
 *
 * @param {Event} _event - A load event
 */
ImageManager.onImageLoad = function (_event) {
  var image_el = _event.target,
    id = image_el.data.id;

  ImageManager.allImages_ob[id] = image_el.data;
  ImageManager.allImages_ob[id].image_el = image_el;

  ImageManager.updatePreloadStatus(image_el);
};

export { ImageManager };
