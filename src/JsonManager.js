// SPDX-License-Identifier: GPL-3.0-only
/*
  Pipe Dream (PD)

  JsonManager:
  - Pre-load required json files

*/

import { PD } from "./PD/CONST.js";
import { __, manualEvent } from "./utils.js";

class JsonManager {}

JsonManager.init = function (ob) {
  var i, json_tmp;

  JsonManager.data_ar = ob.json_ar;
  JsonManager.preloadCallback = ob.preloadCallback;
  JsonManager.preload_ar = [];
  JsonManager.allJson_ob = {};

  // loop through array of json files
  // create file objects from them, add them to the preload_ar
  // and watch for them to finish loading
  for (i = 0; i < JsonManager.data_ar.length; i++) {
    if (JsonManager.allJson_ob[JsonManager.data_ar[i].id]) {
      __(
        "" + JsonManager.data_ar[i].id + ": already exists - skipping preload",
        PD.FMT_JSONMANAGER
      );
    } else {
      json_tmp = new XMLHttpRequest();
      json_tmp.open("GET", JsonManager.data_ar[i].file);
      json_tmp.id = JsonManager.data_ar[i].id;
      __("INITIALISING: " + JsonManager.data_ar[i].file, PD.FMT_JSONMANAGER);
      json_tmp.addEventListener("load", JsonManager.onJsonLoad);
      json_tmp.send();
      JsonManager.preload_ar.push(json_tmp);
    }
  }
};

JsonManager.getJsonByID = function (id) {
  return JsonManager.allJson_ob[id];
};

JsonManager.onJsonLoad = function (event) {
  var i,
    id = event.target.id,
    json_request = event.target;

  for (i = 0; i < JsonManager.preload_ar.length; i++) {
    if (JsonManager.preload_ar[i] === json_request) {
      JsonManager.allJson_ob[id] = JsonManager.preload_ar[i].responseText;
      JsonManager.preload_ar.splice(i, 1);
      __("LOADED: " + id, PD.FMT_JSONMANAGER);
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
