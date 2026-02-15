/**
 * @license GPL-3.0-only
 *
 * @author Mark Mayes / mm-dev
 *
 *
 * @module Game
 *
 * @description
 * ## High-level management of the game
 * - Oversees the player, things, level timer, text etc
 * - Most functionality is farmed out to other classes
 */

import * as CLASSNAMES from "./RCSI/CLASSNAMES.js";
import { RCSI } from "./RCSI/CONST.js";
import * as GAME from "./RCSI/GAME.js";
import * as LEVELS from "./RCSI/LEVELS.js";

import { Display } from "./Display.js";
import { ThingManager } from "./ThingManager.js";
import { Player } from "./Player.js";

import { __ } from "./utils.js";
import { Layout } from "./Layout.js";
import { InternalTimer } from "./InternalTimer.js";
import { KEY_ACTIONS } from "./RCSI/ENUM.js";

class Game {
  /** @type {number} */ static currentScore;
  /** @type {number} */ static levelIndex;
  /** @type {number} */ static lastLevelIndex;
  /** @type {number} */ static resize_timeout;

  /** @type {String} */ static curLevelId;

  /** @type {HTMLElement} */ static container_el;

  /** @type {boolean} */ static isInGameOver;
  /** @type {boolean} */ static isOnFrontPage;

  /** @type {Object} */ static allLevelsData;
  /** @type {Object} */ static curLevelData;
}

/**
 * @function init
 *
 * @description
 * ##### Set up the basics, initialise other modules
 */
Game.init = function () {
  __("Game.init()::", RCSI.FMT_GAME);
  Game.container_el = document.createElement("div");
  Game.container_el.classList.add(CLASSNAMES.GAME);
  document.getElementById(RCSI.EL_IDS.APP_WRAPPER)?.appendChild(Game.container_el);

  Game.initEventHandlers();
  // `Display.init()` starts several things including (via `Text.init()`) measuring/selection of bitmap font size and pre-caching of bitmap characters
  Display.init();
  Player.init();

  InternalTimer.init();

  Game.resetAndStartFirstLevel();
};

/**
 * @function initEventHandlers
 * @static
 *
 * @description
 * ##### Start listening for events:
 * - Resize
 * - Keypresses
 */
Game.initEventHandlers = function () {
  window.addEventListener("resize", Game.onResize);
  document.addEventListener("keydown", Game.onKeyDown);
  document.addEventListener("keyup", Game.onKeyUp);
};

/**
 * @function resetAndStartFirstLevel
 * @static
 *
 * @description
 * ##### Set up and start the first level
 * - This might not be level 1 as a URL hash parameter may indicate skipping to another level, but it's still the first level of this gameplay session
 * - This may be happening after a previous game finished and the player wants another go
 * - Reset score to 0
 */
Game.resetAndStartFirstLevel = function () {
  __("Game.resetAndStartFirstLevel()::", RCSI.FMT_GAME);

  var i,
    curLevelId,
    allLevelsDataKeys = Object.keys(LEVELS.LEVEL_DATA);

  Game.isInGameOver = false;

  Game.allLevelsData = LEVELS.LEVEL_DATA;
  Game.levelIndex = 0;
  Game.lastLevelIndex = allLevelsDataKeys.length - 1;
  for (i = 0; i < allLevelsDataKeys.length; i++) {
    curLevelId = allLevelsDataKeys[i];
  }

  Game.currentScore = 12345;

  Game.setupCurrentLevel();
};

/**
 * @function updateByFrameCount
 * @static
 *
 * @description
 * ##### Update the elements which make up the game
 *
 * @param {number} _frames - How many frames have passed since last update - ideally will be 1, but will be more when the engine is struggling to hit the target frame rate
 */
Game.updateByFrameCount = function (_frames) {
  Player.update();
  ThingManager.update(_frames);

  Display.update();
};

/**
 * @function onResize
 * @static
 *
 * @description
 * ##### Update layout and measurements when the viewport is resized
 */
Game.onResize = function () {
  clearTimeout(Game.resize_timeout);
  Game.resize_timeout = setTimeout(Game.updateLayout, GAME.ONRESIZE_UPDATE_DELAY_MS);
};

/**
 * @function onKeyDown
 * @static
 *
 * @description
 * ##### Handle key presses
 */
Game.onKeyDown = function (event) {
  __(`event.key: ${event.key}`);
  __(`event.code: ${event.code}`);
  if (GAME.KEYS.hasOwnProperty(event.code)) {
    switch (GAME.KEYS[event.code]) {
      case KEY_ACTIONS.MOVE_LEFT:
        Player.startMoveLeft();
        break;
      case KEY_ACTIONS.MOVE_RIGHT:
        Player.startMoveRight();
        break;
      case KEY_ACTIONS.FIRE:
        break;
      default:
        break;
    }
    event.preventDefault();
    event.stopPropagation();
  }
};

/**
 * @function onKeyUp
 * @static
 *
 * @description
 * ##### Handle key release
 */
Game.onKeyUp = function (event) {
  if (GAME.KEYS.hasOwnProperty(event.code)) {
    switch (GAME.KEYS[event.code]) {
      case KEY_ACTIONS.MOVE_LEFT:
      case KEY_ACTIONS.MOVE_RIGHT:
      case KEY_ACTIONS.FIRE:
        break;
      case KEY_ACTIONS.START_GAME:
        if (Game.levelIndex == 0) {
          __("START GAME");
          Game.levelIndex++;
          Game.setupCurrentLevel();
        }
        break;
      default:
        break;
    }
    event.preventDefault();
    event.stopPropagation();
  }
};

/**
 * @function setupCurrentLevel
 * @static
 *
 * @description
 * ##### Everything to do with getting the current level ready to play
 * - Get the ID and data for the level
 * - Call methods in other modules to update them
 * - Add the (non-interactive) background things
 * - Reset the game timer
 */
Game.setupCurrentLevel = function () {
  __("Game.setupCurrentLevel()::", RCSI.FMT_GAME);

  Game.curLevelId = Object.keys(Game.allLevelsData)[Game.levelIndex];
  Game.curLevelData = Game.allLevelsData[Game.curLevelId];
  if (Game.levelIndex === 0) {
    Game.isOnFrontPage = true;
  } else {
    Game.isOnFrontPage = false;
  }
  Game.updateLayout();

  Player.setupForLevel();
  Display.setupForLevel();

  ThingManager.reset();
  ThingManager.addAllBackground();
  ThingManager.addAllEnemy();

  InternalTimer.startTicking();
};

/**
 * @function updateLayout
 * @static
 *
 * @description
 * ##### Ensure layout is in sync with the viewport
 * Calls similar methods in other modules.
 */
Game.updateLayout = function () {
  __("Game.updateLayout()::", RCSI.FMT_GAME);

  Layout.update();
  Display.updateLayout();
};

export { Game };
