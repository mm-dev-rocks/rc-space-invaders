/**
 * @license GPL-3.0-only
 *
 * @author Mark Mayes / mm-dev
 *
 *
 * @module FullscreenManager
 *
 * @description
 * ## Handling fullscreen requests can be a little complex so it gets its own class
 */

import { RCSI } from "./RCSI/CONST.js";

import { __ } from "./utils.js";

class FullscreenManager {
	// TODO document getter
  static get isFullscreen() {
    return (
      document.webkitIsFullScreen ||
      document.mozFullScreen ||
      document.msFullscreenElement !== undefined
    );
  }
}

/**
 * @function init
 * @static
 *
 * @description
 * ##### Initialise the manager
 *
 * @param {object} _ob
 * @param {boolean} _ob.userPrefersFullscreen - Used to keep track of user preference during this session
 */
FullscreenManager.init = function (_ob) {
  // Default to whatever the parameter specifies
  FullscreenManager.userPrefersFullscreen = _ob.userPrefersFullscreen;
  FullscreenManager.methodName_ar = [
    "requestFullscreen",
    "mozRequestFullScreen",
    "webkitRequestFullscreen",
    "msRequestFullscreen",
  ];
};

/**
 * @function tryMethodCall
 * @static
 *
 * @description
 * ##### Try calling a method to set a DOM element to fullscreen
 * Different browsers use different methods to go fullscreen, so we may need to try a few before something works.
 *
 * @param {HTMLElement} _target_el
 * @param {string} _methodName - The method to try
 * @param {string} _description - Used in any error messages produced during this attempt
 */
FullscreenManager.tryMethodCall = function (
  _target_el,
  _methodName,
  _description
) {
  try {
    _target_el[_methodName]().catch(function (err) {
      __(
        `\tError in promise ${_description}: ${err.message} (${err.name})`,
        RCSI.FMT_ERROR
      );
    });
  } catch (err) {
    __(
      `\tError attempting ${_description}: ${err.message} (${err.name})`,
      RCSI.FMT_ERROR
    );
  } finally {
    setTimeout(function () {
      __(
        "\tdocument.fullscreenElement: " + document.fullscreenElement,
        RCSI.FMT_FULLSCREEN
      );
      __(
        "\tFullscreenManager.isFullscreen: " + FullscreenManager.isFullscreen,
        RCSI.FMT_FULLSCREEN
      );
    }, 100);
  }
};

/**
 * @function setState
 * @static
 *
 * @description
 * ##### Enter or exit fullscreen mode
 *
 * @param {object} _ob
 * @param {boolean} _ob.userInitiated `true` if the user specifically asked for this state (eg by clicking the icon), used to remember their preference and override any future requests by the app if they go against the preference
 * @param {boolean} _ob.wantsFullscreen `true` if calling for fullscreen, `false` if wanting to exit fullscreen
 * @param {HTMLElement} _ob.el The element to try to make fullscreen
 */
FullscreenManager.setState = function (_ob) {
  __(
    "FullscreenManager.setState(" + JSON.stringify(_ob) + ")::",
    RCSI.FMT_FULLSCREEN
  );
  var i, methodNameToTry;

  if (_ob?.userInitiated) {
    // By clicking the fullscreen icon, the user is expressing a preference so
    // retain it for the rest of the session
    FullscreenManager.userPrefersFullscreen = _ob.wantsFullscreen;
    __("\tUser sets fullscreen preference", RCSI.FMT_FULLSCREEN);
  }

  __(
    "\tFullscreenManager.userPrefersFullscreen: " +
      FullscreenManager.userPrefersFullscreen,
    RCSI.FMT_FULLSCREEN
  );
  __(
    "\tFullscreenManager.isFullscreen: " + FullscreenManager.isFullscreen,
    RCSI.FMT_FULLSCREEN
  );

  if (_ob.wantsFullscreen && !FullscreenManager.userPrefersFullscreen) {
    __("\tUser has disabled fullscreen, ignoring request", RCSI.FMT_FULLSCREEN);
  } else if (!_ob.wantsFullscreen && FullscreenManager.userPrefersFullscreen) {
    __("\tUser has asked for fullscreen, ignoring request", RCSI.FMT_FULLSCREEN);
  } else {
    if (document.fullscreenEnabled) {
      if (_ob.wantsFullscreen) {
        if (!FullscreenManager.isFullscreen) {
          // Try to go fullscreen
          for (i = 0; i < FullscreenManager.methodName_ar.length; i++) {
            methodNameToTry = FullscreenManager.methodName_ar[i];
            if (typeof _ob?.el[methodNameToTry] === "function") {
              __(
                "\tAttempting fullscreen using `" + methodNameToTry + "`",
                RCSI.FMT_FULLSCREEN
              );
              FullscreenManager.tryMethodCall(
                _ob.el,
                methodNameToTry,
                "attempting fullscreen mode"
              );
              break;
            }
          }
        } else {
          __(
            "\t" + document.fullscreenElement + " is already fullscreen",
            RCSI.FMT_FULLSCREEN
          );
        }
      } else {
        // Try to exit fullscreen
        __("\tExiting fullscreen", RCSI.FMT_FULLSCREEN);
        FullscreenManager.tryMethodCall(
          document,
          "exitFullscreen",
          "attempting to exit fullscreen mode"
        );
      }
    } else {
      __(
        "\tFullscreen mode is not available in this document",
        RCSI.FMT_FULLSCREEN
      );
    }
  }

  __(
    "\tFullscreenManager.userPrefersFullscreen: " +
      FullscreenManager.userPrefersFullscreen,
    RCSI.FMT_FULLSCREEN
  );
  __(
    "\tFullscreenManager.isFullscreen: " + FullscreenManager.isFullscreen,
    RCSI.FMT_FULLSCREEN
  );
};

export { FullscreenManager };
