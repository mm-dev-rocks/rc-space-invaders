/**
 * @license GPL-3.0-only
 *
 * @author Mark Mayes / mm-dev
 *
 *
 * @module RcSpaceInvaders
 *
 * @description
 * ## Everything starts here
 * - This file is the JS entry point, where the code starts
 * - The process is:
 *   `index.html` -> `main.js` -> IIFE -> App starts
 * - Although this file is called `main.js` by convention, this, the main module, is referred to as `window.RcSpaceInvaders` throughout the app.
 *
 */

import * as JSONFILE_IDS from "./RCSI/JSONFILE_IDS.js";

import { AssetPreloader } from "./AssetPreloader.js";
import { Game } from "./Game.js";
import { LoadingIndicator } from "./LoadingIndicator.js";
import { JsonManager } from "./JsonManager.js";

import { __ } from "./utils.js";

/**
 * @function createApp
 *
 * @description
 * ##### Create the main app, a simple outer wrapper for the game
 * - Import any URL hash parameters we're interested in
 * - Start the asset preloader and listen for an event telling us when it's finished
 */
var createApp = function () {
  AssetPreloader.init();
  LoadingIndicator.init();

  document.addEventListener("assetsloaded", onAssetsLoaded);
};

/**
 * @function onAssetsLoaded
 *
 * @description
 * ##### Assets have finished loading
 * - Grab version number info from an imported JSON file
 * - Initialise the game
 */
var onAssetsLoaded = function () {
  window["RcSpaceInvaders"].versionInfo = JSON.parse(JsonManager.getJsonByID(JSONFILE_IDS.JSON_VERSIONINFO));
  __("versionInfo: " + JSON.stringify(window["RcSpaceInvaders"].versionInfo));
  Game.init();
};

/**
 * @function init
 *
 * @description
 * ##### Main initialisation
 * - To be called from the HTML page eg `RcSpaceInvaders.init()`
 */
export var init = function () {
  createApp();
};
