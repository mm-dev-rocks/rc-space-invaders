/**
 * @license GPL-3.0-only
 *
 * @author Mark Mayes / mm-dev
 *
 *
 * @module AssetPreloader
 *
 * @description
 * ## Preloads all asset files used in the game
 * - Images
 * - Sounds
 * - JSON
 * 
 * Broadcasts events during the process so that other classes can keep track:
 * - `assetsloadupdate` - A single item has just loaded, including a percentage of items loaded so far
 * - `assetsloaded` - All items have finished loading
 */



import { RCSI } from "./RCSI/CONST.js";

import { __, manualEvent } from "./utils.js";

import { ImageManager } from "./ImageManager.js";
import { SoundManagerHowler } from "./SoundManagerHowler.js";
import { JsonManager } from "./JsonManager.js";

class AssetPreloader {}

/**
 * @function init
 * @static 
 *
 * @description
 * ##### Initialise the preloader
 * - Add all objects to be preloaded
 * - Calculate totals
 * - Set up event listener for items loading
 */
AssetPreloader.init = function () {
  AssetPreloader.sound_ar = RCSI.SOUND_DATA.SOUND_AR;
  AssetPreloader.image_ar = RCSI.IMAGE_DATA.IMAGE_AR;
  AssetPreloader.json_ar = RCSI.JSONFILES_DATA.JSON_AR;

  // Use respective managers to preload their assets
  SoundManagerHowler.init({ sound_ar: AssetPreloader.sound_ar });
  ImageManager.init({ image_ar: AssetPreloader.image_ar });
  JsonManager.init({ json_ar: AssetPreloader.json_ar });

  // set counters and watch preload events
  AssetPreloader.totalItems =
    AssetPreloader.sound_ar.length +
    AssetPreloader.image_ar.length +
    AssetPreloader.json_ar.length;

  AssetPreloader.soundsDone = 0;
  AssetPreloader.imagesDone = 0;
  AssetPreloader.jsonsDone = 0;

  document.addEventListener("itempreload", AssetPreloader.onItemDone);
};

/**
 * @function onItemDone
 * @static 
 *
 * @description
 * ##### An item has finished loading
 * - Update count of total items loaded
 * - Calculate count as a percentage (based on number of items ie _size is not considered_)
 * - Broadcast the details in an `assetsloadupdate` event to be used eg by `LoadingIndicator`
 * - Call `onComplete()` when all done
 *
 * @param {Event} event
 * @param {object} event.detail
 * @param {string} [event.detail.audioItemsLoaded] Count of audio items loaded so far
 * @param {string} [event.detail.imageItemsLoaded] Count of image items loaded so far
 * @param {string} [event.detail.jsonItemsLoaded] Count of JSON items loaded so far
 */
AssetPreloader.onItemDone = function (event) {
  var totalItemsDone, percentDone;

  if (event.detail.audioItemsLoaded) {
    AssetPreloader.soundsDone = event.detail.audioItemsLoaded;
  } else if (event.detail.imageItemsLoaded) {
    AssetPreloader.imagesDone = event.detail.imageItemsLoaded;
  } else if (event.detail.jsonItemsLoaded) {
    AssetPreloader.jsonsDone = event.detail.jsonItemsLoaded;
  }

  totalItemsDone =
    AssetPreloader.soundsDone +
    AssetPreloader.imagesDone +
    AssetPreloader.jsonsDone;

  percentDone = (totalItemsDone / AssetPreloader.totalItems) * 100;
  //__("percentDone: " + percentDone, RCSI.LOG_FORMAT_INFO);
  if (percentDone === 100) {
    AssetPreloader.onComplete();
  }

  manualEvent(document, "assetsloadupdate", { percentDone: percentDone });
};

/**
 * @function onComplete
 * @static 
 *
 * @description
 * ##### Everything has finished preloading
 * Broadcast an `assetsloaded` event.
 */
AssetPreloader.onComplete = function () {
  __("PRELOAD COMPLETE", RCSI.LOG_FORMAT_INFO);
  manualEvent(document, "assetsloaded");
};

export { AssetPreloader };
