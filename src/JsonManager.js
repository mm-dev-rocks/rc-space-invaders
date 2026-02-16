// SPDX-License-Identifier: GPL-3.0-only
/*
  Pipe Dream (RCSI)

  JsonManager:
  - Pre-load required json files

*/

import { RCSI } from "./RCSI/CONST.js";
import { __, manualEvent } from "./utils.js";

class JsonManager {
  /** @type {Object} */ static allJson_ob;
  /** @type {Function} */ static preloadCallback;
  /** @type {Array} */ static data_ar;
  /** @type {Array} */ static preload_ar;
}

/**
 * @function init
 * @static
 *
 * @description
 * ##### Initialise the JSON manager
 *
 * @param {Object} _ob - Data object with following properties:
 *
 * @property {Array} _ob.json_ar - Array of JSON data (each item has `id` and `file`)
 *
 * @property {Function} _ob.preloadCallback - Function to call when all JSON files have loaded
 */
JsonManager.init = function (_ob) {
  var i, json_tmp;

  JsonManager.data_ar = _ob.json_ar;
  JsonManager.preloadCallback = _ob.preloadCallback;
  JsonManager.preload_ar = [];
  JsonManager.allJson_ob = {};

  // Loop through array of json files
  // Create file objects from them, add them to the preload_ar, and watch for them to finish loading
  for (i = 0; i < JsonManager.data_ar.length; i++) {
    if (JsonManager.allJson_ob[JsonManager.data_ar[i].id]) {
      __("" + JsonManager.data_ar[i].id + ": already exists - skipping preload", RCSI.FMT_JSONMANAGER);
    } else {
      json_tmp = new XMLHttpRequest();
      json_tmp.open("GET", JsonManager.data_ar[i].file);
      json_tmp.id = JsonManager.data_ar[i].id;
      __("INITIALISING: " + JsonManager.data_ar[i].file, RCSI.FMT_JSONMANAGER);
      json_tmp.addEventListener("load", JsonManager.onJsonLoad);
      json_tmp.send();
      JsonManager.preload_ar.push(json_tmp);
    }
  }
};

/**
 * @function getJsonByID
 * @static
 *
 * @description
 * ##### Get some JSON
 *
 * @param {String} _id - The JSON ID as used during initialisation
 *
 * @returns {String} A JSON string
 */
JsonManager.getJsonByID = function (_id) {
  return JsonManager.allJson_ob[_id];
};

/**
 * @function onJsonLoad
 * @static
 *
 * @description
 * ##### Process a JSON load event
 *
 * - Update the `allJson_ob` object with final data
 *
 * - Check whether all JSON files are now loaded and call the `preloadCallback` function if so
 *
 * @param {Event} _event - A load event
 */
JsonManager.onJsonLoad = function (_event) {
  var i,
    id = _event.target.id,
    json_request = _event.target;

  for (i = 0; i < JsonManager.preload_ar.length; i++) {
    if (JsonManager.preload_ar[i] === json_request) {
      JsonManager.allJson_ob[id] = JsonManager.preload_ar[i].responseText;
      JsonManager.preload_ar.splice(i, 1);
      __("LOADED: " + id, RCSI.FMT_JSONMANAGER);
      break;
    }
  }

  json_request = null;

  manualEvent(document, "itempreload", {
    jsonItemsLoaded: JsonManager.data_ar.length - JsonManager.preload_ar.length,
  });

  if (JsonManager.preload_ar.length === 0) {
    // all jsons loaded
    if (JsonManager.preloadCallback) {
      JsonManager.preloadCallback();
    }
  }
};

export { JsonManager };
