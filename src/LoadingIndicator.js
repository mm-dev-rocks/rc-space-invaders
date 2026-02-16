/**
 * @license GPL-3.0-only
 *
 * @author Mark Mayes / mm-dev
 *
 *
 * @module LoadingIndicator
 *
 * @description
 * ## A simple loading progress bar
 */

import { __, removeChildFromParent } from "./utils.js";

import * as STRING from "./RCSI/STRING.js";
import * as CLASSNAMES from "./RCSI/CLASSNAMES.js";

class LoadingIndicator {}

/**
 * @function init
 * @static
 *
 * @description
 * ##### Create the graphical elements, add event listeners and set to 0%
 */
LoadingIndicator.init = function () {
  LoadingIndicator.el = document.createElement("div");
  LoadingIndicator.el.id = "loading-indicator";
  document.body.appendChild(LoadingIndicator.el);

  LoadingIndicator.text_el = document.createElement("p");
  LoadingIndicator.text_el.innerHTML = STRING.ASSETS_LOADING;
  LoadingIndicator.el.appendChild(LoadingIndicator.text_el);

  LoadingIndicator.bg_el = document.createElement("span");
  LoadingIndicator.el.appendChild(LoadingIndicator.bg_el);

  LoadingIndicator.bar_el = document.createElement("em");
  LoadingIndicator.el.appendChild(LoadingIndicator.bar_el);

  document.addEventListener("assetsloaded", LoadingIndicator.onPageLoaded);
  document.addEventListener("assetsloadstarted", LoadingIndicator.onPageLoadStarted);
  document.addEventListener("assetsloadupdate", LoadingIndicator.onUpdate);

  LoadingIndicator.setPercentage(0);
};

/**
 * @function setPercentage
 * @static
 *
 * @description
 * ##### Update the percentage of loading that has completed so far
 * Visually changes the size of the inidcator bar by altering its `paddingRight` property
 *
 * @param {number} _percentDone
 */
LoadingIndicator.setPercentage = function (_percentDone) {
  var scaledPercent = (100 - _percentDone) / LoadingIndicator.CSSWIDTH_SCALE;
  LoadingIndicator.bar_el.style.paddingRight = scaledPercent + "%";
};

LoadingIndicator.show = function () {
  LoadingIndicator.el.classList.remove(CLASSNAMES.HIDDEN);
};

LoadingIndicator.hide = function () {
  removeChildFromParent(LoadingIndicator.el);
};

LoadingIndicator.onPageLoaded = function () {
  LoadingIndicator.hide();
};

LoadingIndicator.onPageLoadStarted = function () {
  LoadingIndicator.setPercentage(0);
  LoadingIndicator.show();
};

LoadingIndicator.onUpdate = function (event) {
  LoadingIndicator.setPercentage(event.detail._percentDone);
};

LoadingIndicator.CSSWIDTH_SCALE = 2; // eg. 2 if 'full' width should be 50% (100/2)

export { LoadingIndicator };
