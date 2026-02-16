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
 * - Cache as `<image>` elements
 * - Optionally also produce and cache `ImageBitmap`s
 */

import { RCSI } from "./RCSI/CONST.js";
import { __, manualEvent } from "./utils.js";

class ImageManager {
  /** @type {Array} */ static data_ar;
  /** @type {Array} */ static preload_ar;
  /** @type {Function} */ static preloadCallback;
  /** @type {Object} */ static allImages_ob;
}

ImageManager.init = function (ob) {
  var i, itemData, image_tmp;

  ImageManager.data_ar = ob.image_ar;
  ImageManager.preloadCallback = ob.preloadCallback;
  ImageManager.preload_ar = [];
  ImageManager.allImages_ob = {};

  // loop through array of image files
  // create image objects from them, add them to the preload_ar
  // and watch for them to finish loading
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

ImageManager.getImageByID = function (id) {
  return ImageManager.allImages_ob[id];
};

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
    // all images loaded
    if (ImageManager.preloadCallback) {
      ImageManager.preloadCallback();
    }
  }
};

ImageManager.onImageLoad = function (event) {
  var image_el = event.target,
    id = image_el.data.id;

  ImageManager.allImages_ob[id] = image_el.data;
  ImageManager.allImages_ob[id].image_el = image_el;

  ImageManager.updatePreloadStatus(image_el);
};

export { ImageManager };
