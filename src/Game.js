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
 * - Oversees the player, obstacles, level timer, text etc
 * - Most functionality is farmed out to other classes
 */

import * as CLASSNAMES from "./RCSI/CLASSNAMES.js";
import { RCSI } from "./RCSI/CONST.js";
import {
  ASPECT_RATIO,
  FADE_DIRECTION,
  GAMEOVER_REASON,
  OBSTACLE_TYPE,
  TIMER_ID,
} from "./RCSI/ENUM.js";
import * as GAME from "./RCSI/GAME.js";
import * as LEVELS from "./RCSI/LEVELS.js";
import * as SOUND_IDS from "./RCSI/SOUND_IDS.js";
import * as TIMINGS from "./RCSI/TIMINGS.js";

import { Controller } from "./Controller.js";
import { Display } from "./Display.js";
import { FullscreenManager } from "./FullscreenManager.js";
import { InternalTimer } from "./InternalTimer.js";
import { Layout } from "./Layout.js";
import { LevelTransition } from "./LevelTransition.js";
import { ObstacleManager } from "./ObstacleManager.js";
import { OverlayText } from "./OverlayText.js";
import { Player } from "./Player.js";
import { SoundManagerHowler } from "./SoundManagerHowler.js";
import { Timers } from "./Timers.js";

import {
  __,
  getSquaredDistanceBetweenPoints,
  pointIsInRect,
  setHashParam,
  vectorGetMagnitude,
} from "./utils.js";

class Game {}

/**
 * @function init
 * @static
 *
 * @description
 * ##### Set up the basics, initialise other modules
 */
Game.init = function () {
  __("Game.init()::", RCSI.FMT_GAME);
  Game.container_el = document.createElement("div");
  Game.container_el.classList.add(CLASSNAMES.GAME);
  document.getElementById(RCSI.EL_IDS.APP_WRAPPER).appendChild(Game.container_el);

  //Game.initEventHandlers();
  //Game.initSound();
  //Game.initFpsCounter();
  //Game.calculateGlobalCollectObstacleRadiusRange();

  //// Default to preferring fullscreen at start of game
  //FullscreenManager.init({ userPrefersFullscreen: true });
  //// `Display.init()` starts several things including (via `Text.init()`) measuring/selection of bitmap font size and pre-caching of bitmap characters
  //Display.init();
  //Player.init();
  //Controller.init();
  //LevelTransition.init();

  //Game.resetAndStartFirstLevel();
};

/**
 * @function initEventHandlers
 * @static
 *
 * @description
 * ##### Start listening for events:
 * - Touch / move pointer
 * - Tap
 * - Resize
 */
Game.initEventHandlers = function () {
  Game.deviceIsTouchEnabled = "ontouchstart" in document.documentElement;

  window.addEventListener("resize", Game.onResize);
  // `passive` needs to be specified as false as some devices default to it being true, meaning `preventDefault()` won't work and problems can occur with default browser events
  if (Game.deviceIsTouchEnabled) {
    Game.tapEventName = "touchstart";
    document.addEventListener("touchmove", Game.onPointerMove, {
      passive: false,
    });
  } else {
    Game.tapEventName = "mousedown";
    document.addEventListener("mousemove", Game.onPointerMove, {
      passive: false,
    });
  }

  document.addEventListener(Game.tapEventName, Game.onTap, {
    passive: false,
  });
};

/**
 * @function initSound
 * @static
 *
 * @description
 * ##### Enable/disable sound based on URL hash parameter or default to 'enabled'
 */
Game.initSound = function () {
  if (window.RcSpaceInvaders.hashParams?.mute) {
    Game.soundIsEnabled = false;
  } else {
    Game.soundIsEnabled = true;
  }
  Game.setSoundEnabledState(Game.soundIsEnabled);
};

/**
 * @function initFpsCounter
 * @static
 *
 * @description
 * ##### Hide/show the FPS counter based on URL hash parameter
 */
Game.initFpsCounter = function () {
  InternalTimer.init();
  Game.showFps = false;
  if (window.RcSpaceInvaders.hashParams?.fps) {
    Game.showFps = true;
  }
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
    levelDataKeys = Object.keys(LEVELS.LEVEL_DATA);

  document.removeEventListener(Game.tapEventName, Game.resetAndStartFirstLevel);
  Game.isInGameOver = false;

  OverlayText.blankOutHitToStart();

  Game.levelData = LEVELS.LEVEL_DATA;
  // `INTRO` isn't a real level so we need to subtract 1 to allow for it
  Game.lastLevelIndex = levelDataKeys.length - 1;
  // And `totalLevels` isn't zero-indexed...
  Game.totalLevels = levelDataKeys.length - 1;
  Game.levelIndex = 0;
  Game.levelsCompletedThisSession = 0;
  Game.skipToLevelIndex = 0;
  for (i = 0; i < levelDataKeys.length; i++) {
    curLevelId = levelDataKeys[i];
    if (window.RcSpaceInvaders.hashParams[curLevelId.toLowerCase()]) {
      __("\tMATCH", RCSI.FMT_GAME);
      Game.levelIndex = i;
      Game.skipToLevelIndex = i;
      // Don't break, if there's more than 1 level id in the hash find the highest
      //break;
    }
  }

  // Centre the pointer so everything based on it starts in a sensible state
  Game.pointerPos = {
    x: Layout.canvasWidth / 2,
    y: Layout.canvasHeight / 2,
  };

  Game.currentScore = 0;

  Game.setupCurrentLevel();
};

/*
 *
 * TODO
 * How to label this group?
 *
 */

/**
 * @function setSoundEnabledState
 * @static
 *
 * @description
 * ##### Enable/disable audio
 * - Add a parameter to the URL hash to remember the preference
 * - Pass the state into `SoundManagerHowler.setMuteState()`
 *
 * @param {boolean} _enabled - The desired state
 */
Game.setSoundEnabledState = function (_enabled) {
  Game.soundIsEnabled = _enabled;

  if (!Game.soundIsEnabled) {
    setHashParam(RCSI.IMPORTABLE_HASH_PARAMS, "mute", true);
  } else {
    // Omitting the param value deletes it
    setHashParam(RCSI.IMPORTABLE_HASH_PARAMS, "mute");
  }

  SoundManagerHowler.setMuteState(!Game.soundIsEnabled);
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

  Layout.update({
    gameplayAreaToCanvasLateralRatio:
      Game.curLevelData.gameplayAreaToCanvasLateralRatio,
  });
  Controller.updateLayout();
  Display.updateLayout();
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
  // For accurate performance logging, in FireFox about:config
  // `privacy.reduceTimerPrecision` must be `false`

  // This flag is checked by other classes to decide if it's time to log to
  /// console (if it happened on every tick it spams the console and becomes
  /// unreadable)
  // Comment out to disable performance logging
  //if (Game.frameCount % 200 === 0) {
  //  Game.doPerfLog = true;
  //  __("---");
  //} else {
  //  Game.doPerfLog = false;
  //}

  Game.pointerIsOverActiveArea = false;
  Game.pointerIsOverSoundToggleIcon = false;
  Game.pointerIsOverFullscreenToggleIcon = false;

  if (pointIsInRect(Game.pointerPos, Controller.activeArea_rect)) {
    Game.pointerIsOverActiveArea = true;
  } else if (pointIsInRect(Game.pointerPos, Layout.soundToggleIcon_rect)) {
    Game.pointerIsOverSoundToggleIcon = true;
  } else if (pointIsInRect(Game.pointerPos, Layout.fullscreenToggleIcon_rect)) {
    Game.pointerIsOverFullscreenToggleIcon = true;
  }

  Controller.updatePointerPos(Game.pointerPos);
  Controller.updateLateralMultiplier();

  Player.update();
  ObstacleManager.update(_frames);

  if (!Game.isInLevelIntro && !Game.isInLevelOutro && !Game.isInGameOver) {
    Game.updateTimer();
    if (Game.collectableRemaining === 0) {
      Game.doLevelCompleted();
    }
  } else if (Game.isInLevelOutro) {
    LevelTransition.nextFrame();
  }

  // TODO Needs own function
  if (Game.textIsFading) {
    Game.introTextFadeAlpha += Game.introTextFadeStepSize;
    if (Game.introTextFadeStepSize > 0) {
      // Fading in
      if (Game.introTextFadeAlpha >= 1) {
        Game.introTextFadeAlpha = 1;
        Game.textIsFading = false;
      }
    } else {
      // Fading out
      if (Game.introTextFadeAlpha <= 0) {
        Game.introTextFadeAlpha = 0;
        Game.textIsFading = false;
        OverlayText.setEmpty();
      }
    }
  }

  Display.update();
};
//
///**
// * @function iterateLevelOutro
// * @static
// *
// * @description
// * ##### Perform the next step of the level outro sequence
// * - Move from old level background colour to the next level colour
// */
//Game.iterateLevelOutro = function () {
//  var rgb_ar;
//
//  if (Game.levelTransitionTotalFrames > 0) {
//    // Background colour
//    Game.transitionFromBgColorRGBA = addFadeStepToRGB(
//      Game.transitionFromBgColorRGBA,
//      Game.fadeStepBetweenRGBColors_ar
//    );
//    //__(
//    //  "Game.transitionFromBgColorRGBA: " +
//    //    JSON.stringify(Game.transitionFromBgColorRGBA)
//    //);
//    rgb_ar = rgbToRGB_ar(Game.transitionFromBgColorRGBA);
//
//    // Controller speed damping
//    Controller.speedDamp += Game.controllerSpeedDampTransitionStep;
//
//    ObstacleManager.levelOutroRemoveNextBackgroundObstacles(Game.levelOutroBgObstaclesToRemovePerFrame);
//
//    // Continue sequence
//    Game.levelTransitionTotalFrames--;
//  } else {
//    rgb_ar = rgbToRGB_ar(Game.transitionToBgColorRGBA);
//  }
//
//  Display.setBackgroundColor(rgbToHex(...rgb_ar));
//};

/*
 *
 *
 * Methods which perform secondary tasks or help with other tasks
 *
 */

/**
 * @function addScoreForLevel
 * @static
 *
 * @description
 * ##### Level completed, calculate points scored and add them to the total
 * - Points are added for every second remaining (so the player is rewarded for finishing quickly)
 * - Points per second are increased according to how many successive levels have been played during this session
 */
Game.addScoreForLevel = function () {
  __("Game.addScoreForLevel()", RCSI.FMT_GAME);
  // TODO Can this local var be deleted?
  var successiveLevelsThisSession = Game.levelIndex - Game.skipToLevelIndex + 1,
    levelScoreMultiplier =
      Game.levelsCompletedThisSession * GAME.SCORE_PER_LEVEL_MULTIPLIER;

  Game.scoreForLevel = Math.round(
    Game.timeRemaining * GAME.SCORE_PER_SEC_REMAINING * levelScoreMultiplier
  );
  __(
    "\tsuccessiveLevelsThisSession: " + successiveLevelsThisSession,
    RCSI.FMT_GAME
  );
  __(
    "\tGame.levelsCompletedThisSession: " + Game.levelsCompletedThisSession,
    RCSI.FMT_GAME
  );
  __("\tlevelScoreMultiplier: " + levelScoreMultiplier, RCSI.FMT_GAME);
  __("\tscoreForLevel: " + Game.scoreForLevel, RCSI.FMT_GAME);

  __("\tGame.currentScore: " + Game.currentScore, RCSI.FMT_GAME);
  Game.currentScore += Game.scoreForLevel;
  __("\tGame.currentScore: " + Game.currentScore, RCSI.FMT_GAME);
};

/**
 * @function getSquaredObstacleDistanceFromPlayer
 * @static
 *
 * @description
 * ##### Find the squared distance between the centre of the player and the centre of an obstacle
 * Finding the distance usually involves expensive `Math.sqrt()` calls, and this function gets called a lot. So remove the square root step, and in comparisons square the distance we want to compare.
 *
 * @param {object} _obstacle
 *
 * @returns {number} The (squared) distance in pixels
 */
Game.getSquaredObstacleDistanceFromPlayer = function (_obstacle) {
  var distance;
  if (Layout.sessionAspectRatio === ASPECT_RATIO.LANDSCAPE) {
    distance = getSquaredDistanceBetweenPoints(_obstacle.pos, {
      x: Player.pos.x,
      y: Player.pos.y - Controller.lateralOffset,
    });
  } else {
    distance = getSquaredDistanceBetweenPoints(_obstacle.pos, {
      x: Player.pos.x - Controller.lateralOffset,
      y: Player.pos.y,
    });
  }
  return distance;
  //return distance + Display.playerOutlineThickness;
};

/**
 * @function playerHitObstacle
 * @static
 *
 * @description
 * ##### Player has hit an obstacle, act accordingly depending on `_obstacle.type`
 * - 'Avoid' obstacle: bounce and damage the player
 * - 'Collect' obstacle: eat the obstacle and decrement `Game.collectableRemaining`
 *
 * @param {object} _obstacle
 */
Game.playerHitObstacle = function (_obstacle) {
  var playerBounceVector;

  if (_obstacle.type === OBSTACLE_TYPE.AVOID) {
    // bounce obstacle
    playerBounceVector = ObstacleManager.bounceOffPlayer(_obstacle);
    
    // 'Bounce' player by pretending the pointer has moved... for the next
    // few // (GAME.DAMAGED_FRAMES_TOTAL) frames, mouse/touch input is ignored,
    // meaning the // fake pointer position is used as an aim for the controller
    // stick
    Game.pointerPos.x += playerBounceVector.x;
    Game.pointerPos.y += playerBounceVector.y;

    if (_obstacle.damageSafetyCounter === 0) {
      _obstacle.damageSafetyCounter = InternalTimer.secondsToFrames(
        GAME.DAMAGE_SAFETY_SECS_TOTAL
      );

      if (!Game.isInLevelOutro && !Game.isInGameOver) {
        Game.damagePlayer(vectorGetMagnitude(playerBounceVector));

        SoundManagerHowler.playSoundById(
          _obstacle.damageSfx || SOUND_IDS.SFX_DAMAGE
        );
      }
    }
  } else if (_obstacle.type === OBSTACLE_TYPE.COLLECT) {
    // Ignore if mid-explosion
    if (_obstacle.explodingFramesCounter < 1) {
      Game.playerEats(_obstacle);
      Game.collectableRemaining--;
    }
  }
};

/**
 * @function playerEats
 * @static
 *
 * @description
 * ##### Player has eaten an obstacle
 * - Set the `Player.playerEatsFramesCounter` above `0` to initiate the flashing/animation
 * - Set `Player.eatenColor` to the colour of the obstacle, to be used in the above animation
 * - Play a sound effect
 *
 * @param {object} _obstacle
 */
Game.playerEats = function (_obstacle) {
  Player.playerEatsFramesCounter = InternalTimer.secondsToFrames(
    GAME.PLAYEREATS_SECS_TOTAL
  );
  Player.eatenColor = _obstacle.color;
  SoundManagerHowler.playSoundById(_obstacle.soundID);
  // no longer active / has been collected, so start animating it away
  _obstacle.radius *= GAME.EATEN_OBSTACLE_INITIAL_GROWTH;

  _obstacle.explodingFramesCounter = GAME.EXPLODING_FRAMES_TOTAL;
  // increase size of player (eat/absorb the obstacle)
  Player.radius += _obstacle.radius / Player.growthDivisor;
};

/**
 * @function damagePlayer
 * @static
 *
 * @description
 * ##### Player has collided with an 'avoid' obstacle
 * - Set the `Player.damagedFramesCounter` above `0` to initiate the flashing/animation
 * - Set `Controller.damageAddedSlipperiness` to make the controls more slippery/inaccurate until the above counter has come back down to `0`
 * - Play a sound effect
 * - Check if health has hit zero, in which case end the game
 *
 *
 * @param {number} _bounceMagnitude - Strength of the collision that caused damage
 */
Game.damagePlayer = function (_bounceMagnitude) {
  var adjustedBounceMagnitude =
    _bounceMagnitude / GAME.PLAYER_LOSSOFCONTROL_MAGNITUDE_DIVISOR;

  //__("_bounceMagnitude: " + _bounceMagnitude, RCSI.FMT_GAME);
  //__("adjustedBounceMagnitude: " + adjustedBounceMagnitude, RCSI.FMT_GAME);

  Player.damagedFramesCounter = Math.min(
    Math.ceil(adjustedBounceMagnitude * InternalTimer.currentFps),
    InternalTimer.secondsToFrames(GAME.PLAYER_LOSSOFCONTROL_MAX_SECS)
  );
  Controller.damageAddedSlipperiness = adjustedBounceMagnitude;
  Player.health--;
  if (Player.health <= 0) {
    Player.health = 0;
    __("HEALTH GONE", RCSI.FMT_GAME);
    Game.end(GAMEOVER_REASON.HEALTH_DEPLETED);
  }
};

/*
 *
 *
 * Event handlers
 *
 */

/**
 * @function onResize
 * @static
 *
 * @description
 * ##### Update layout and measurements when the viewport is resized
 */
Game.onResize = function () {
  clearTimeout(Game.resize_timeout);
  Game.resize_timeout = setTimeout(
    Game.updateLayout,
    GAME.ONRESIZE_UPDATE_DELAY_MS
  );
};

/**
 * @function onPointerMove
 * @static
 *
 * @description
 * ##### Update the position of the pointer
 * - Used for mouse pointer movement and also touch/drag movements
 * - Position may need to be scaled to match the canvas if the canvas is drawn small and scaled up (`GAME.PIXEL_SCALE`)
 *
 * @param {Event} event - Either a `touchmove` or a `mousemove` event
 */
Game.onPointerMove = function (event) {
  if (event.touches) {
    //Game.updatePointerPos(event.touches[0].pageX, event.touches[0].pageY);
    Game.pointerPos = {
      x: event.touches[0].pageX / GAME.PIXEL_SCALE,
      y: event.touches[0].pageY / GAME.PIXEL_SCALE,
    };
  } else {
    //Game.updatePointerPos(event.pageX, event.pageY);
    Game.pointerPos = {
      x: event.pageX / GAME.PIXEL_SCALE,
      y: event.pageY / GAME.PIXEL_SCALE,
    };
  }

  event.preventDefault();
};

//Game.updatePointerPos = function (_x, _y) {
//  Game.pointerPos = {
//    x: _x / GAME.PIXEL_SCALE,
//    y: _y / GAME.PIXEL_SCALE,
//  };
//};

/**
 * @function onTap
 * @static
 *
 * @description
 * ##### Check to see if the pointer is positioned over an active area
 * - There are no `HTMLElement`s here as everything is just pixels on a canvas, so we check based on boundaries of rectangles surrounding eg the sound icon, or fullscreen icon
 * - In case this is a touchscreen device, the pointer position needs to be updated before checking the location of the tap, so the event is first passed through `Game.onPointerMove(event)`
 *
 * @param {Event} event - Either a `touchmove` or a `mousemove` event
 */
Game.onTap = function (event) {
  __("Game.onTap()", RCSI.FMT_GAME);

  // TODO EXPERIMENT MAKE SURE ITS NOT CAUSING BUGS!!!
  Game.onPointerMove(event);
  // // Make sure pointer follows click on touchscreens
  // if (event.touches) {
  //   Game.updatePointerPos(event.touches[0].pageX, event.touches[0].pageY);
  // } else {
  //   Game.updatePointerPos(event.pageX, event.pageY);
  // }

  if (pointIsInRect(Game.pointerPos, Layout.soundToggleIcon_rect)) {
    Game.setSoundEnabledState(!Game.soundIsEnabled);
  } else if (pointIsInRect(Game.pointerPos, Layout.fullscreenToggleIcon_rect)) {
    FullscreenManager.setState({
      el: Game.container_el,
      userInitiated: true,
      wantsFullscreen: FullscreenManager.isFullscreen ? false : true,
    });
  }

  event.preventDefault();
};

/*
 *
 *
 * Methods related to times when the game is not in play, eg:
 * - In between levels
 * - During 'game over'
 *
 */

/**
 * @function clearAllLevelsFromHash
 * @static
 *
 * @description
 * ##### Clear out any level IDs from the URL hash parameters
 */
Game.clearAllLevelsFromHash = function () {
  var i,
    curLevelId,
    levelDataKeys = Object.keys(LEVELS.LEVEL_DATA);

  for (i = 0; i < levelDataKeys.length; i++) {
    curLevelId = levelDataKeys[i];
    // Missing 3rd param means 'delete this param'
    setHashParam(RCSI.IMPORTABLE_HASH_PARAMS, curLevelId.toLowerCase());
  }
};

/**
 * @function setupCurrentLevel
 * @static
 *
 * @description
 * ##### Everything to do with getting the current level ready to play
 * - Get the ID and data for the level
 * - Update the URL hash with the level ID
 * - Call methods in other modules to update them
 * - Add the (non-interactive) background and floating obstacles
 * - Add up how many collectable obstacles there are (but don't add them to the game yet)
 * - Reset the game timer
 * - Start the level intro
 */
Game.setupCurrentLevel = function () {
  __("Game.setupCurrentLevel()::", RCSI.FMT_GAME);

  Game.clearAllLevelsFromHash();
  Game.curLevelId = Object.keys(Game.levelData)[Game.levelIndex];
  setHashParam(RCSI.IMPORTABLE_HASH_PARAMS, Game.curLevelId.toLowerCase(), true);
  Game.curLevelData = Game.levelData[Game.curLevelId];
  Game.timeRemaining = Game.curLevelData.timeAllowedSecs;

  if (Game.levelIndex === 0) {
    Game.isOnFrontPage = true;
  } else {
    Game.isOnFrontPage = false;
  }

  Game.isInLevelOutro = false;
  Game.isInPlay = true;
  Game.scoreForLevel = 0;

  Game.updateLayout();

  Controller.setupForLevel();
  Player.setupForLevel();
  Display.setupForLevel();

  ObstacleManager.reset();
  ObstacleManager.addAllBackground();
  ObstacleManager.addAllFloating();

  Game.updateObstacleTypeTotals();

  Game.startLevelIntro();
};

Game.updateObstacleTypeTotals = function () {
  var i, obstacleGroupData;
  // Do some pre-game calculations on all the obstacles in the level
  Game.collectableTotal = 0;
  Game.avoidTotal = 0;
  Game.backgroundTotal = 0;
  for (i = 0; i < Game.curLevelData.obstacles.length; i++) {
    obstacleGroupData = Game.curLevelData.obstacles[i];
    if (obstacleGroupData.type === OBSTACLE_TYPE.COLLECT) {
      Game.collectableTotal += obstacleGroupData.total;
    } else if (obstacleGroupData.type === OBSTACLE_TYPE.AVOID) {
      Game.avoidTotal += obstacleGroupData.total;
    } else if (obstacleGroupData.type === OBSTACLE_TYPE.BACKGROUND) {
      Game.backgroundTotal += obstacleGroupData.total;
    }
  }
  Game.collectableRemaining = Game.collectableTotal;
};

Game.calculateGlobalCollectObstacleRadiusRange = function () {
  var i,
    j,
    curLevelData,
    obstacleGroupData,
    levelDataKeys = Object.keys(LEVELS.LEVEL_DATA);

  for (i = 0; i < levelDataKeys.length; i++) {
    curLevelData = LEVELS.LEVEL_DATA[levelDataKeys[i]];
    __("curLevelData: " + curLevelData);
    for (j = 0; j < curLevelData.obstacles.length; j++) {
      obstacleGroupData = curLevelData.obstacles[j];
      __("obstacleGroupData: " + obstacleGroupData);
      if (obstacleGroupData.type === OBSTACLE_TYPE.COLLECT) {
        // Check max/min sizes for all collectable obstacles, used to choose SFX
        // based on size
        ObstacleManager.addGroupToRadiusRanges(obstacleGroupData);
      }
    }
  }
};

/**
 * @function startPlay
 * @static
 *
 * @description
 * ##### All intros etc have finished, actually start playing
 */
Game.startPlay = function () {
  __("Game.startPlay()::", RCSI.FMT_GAME);

  __(
    "ObstacleManager.surfaceAreaOfLevel: " +
      Math.round(ObstacleManager.surfaceAreaOfLevel).toLocaleString(),
    RCSI.FMT_INFO
  );

  OverlayText.setEmpty();

  Game.timeIsLow = false;

  Game.isInLevelIntro = false;
  Game.timestampOnStart = Date.now();
};

/**
 * @function nextLevel
 * @static
 *
 * @description
 * ##### Move to the next level, or if this is the last level the game is completed
 */
Game.nextLevel = function () {
  __("Game.nextLevel()::", RCSI.FMT_GAME);
  __("CANCEL click starts next level", RCSI.FMT_GAME);
  document.removeEventListener(Game.tapEventName, Game.nextLevel);
  __("\tGame.lastLevelIndex:" + Game.lastLevelIndex, RCSI.FMT_GAME);
  __("\tGame.levelIndex:" + Game.levelIndex, RCSI.FMT_GAME);
  __(
    "\tGame.levelsCompletedThisSession:" + Game.levelsCompletedThisSession,
    RCSI.FMT_GAME
  );
  __("\tGame.totalLevels:" + Game.totalLevels, RCSI.FMT_GAME);
  ObstacleManager.deleteObstacles();
  if (Game.levelsCompletedThisSession < Game.totalLevels) {
    Game.isInPlay = false;
    //if (Game.levelIndex === Game.lastLevelIndex) {
    //  // Wrap around as the player must have skipped levels using a hash param
    //  // But to 1, not 0 ass 0 is the intro non-level
    //  Game.levelIndex = 1;
    //} else {
    //  Game.levelIndex++;
    //}
    Game.levelIndex = Game.getNextLevelIndex();
    __("\tGame.levelIndex:" + Game.levelIndex, RCSI.FMT_GAME);
    Game.setupCurrentLevel();
  } else {
    Game.doComplete();
  }
};

/**
 * @function getNextLevelIndex
 * @static
 *
 * @description
 * ##### Calculate the index number of the next level
 * Usually this will just be a matter of adding 1, but sometimes levels may wrap (when the session skipped levels at the beginning).
 *
 * @returns {number} Index number for next level
 */
Game.getNextLevelIndex = function () {
  var nextLevelIndex;

  if (Game.levelIndex === Game.lastLevelIndex) {
    // Wrap around as the player must have skipped levels using a hash param
    // But to 1, not 0 ass 0 is the intro non-level
    nextLevelIndex = 1;
  } else {
    nextLevelIndex = Game.levelIndex + 1;
  }
  return nextLevelIndex;
};

/**
 * @function doComplete
 * @static
 *
 * @description
 * ##### Game completed
 * Tot up final score and inform the player
 */
Game.doComplete = function () {
  Game.addScoreForLevel();
  Game.end(GAMEOVER_REASON.GAME_COMPLETED);
};

/**
 * @function end
 * @static
 *
 * @description
 * ##### End the game
 *
 * @param {GAMEOVER_REASON} _reason - Why the game ended, used to decide what to display on the game over screen
 */
Game.end = function (_reason) {
  __("Game.end()::", RCSI.FMT_GAME);
  cancelAnimationFrame(Game.tickAnimationFrameRef);

  if (Game.isInPlay) {
    __("GAME OVER", RCSI.FMT_GAME);
    Game.displayGameOver(_reason);
  } else {
    __("ALREADY ENDED / repeat call", RCSI.FMT_GAME);
  }
};

/**
 * @function displayGameOver
 * @static
 *
 * @description
 * ##### Show the 'game over' screen
 * - Set some variables to take the game out of play
 * - Start listening for a tap to restart
 *
 * @param {GAMEOVER_REASON} _reason - Why the game ended
 */
Game.displayGameOver = function (_reason) {
  __("Game.displayGameOver()::", RCSI.FMT_GAME);
  __("\t\tSETTING OVERLAY TEXT", RCSI.FMT_GAME);
  OverlayText.setGameOver(_reason);
  SoundManagerHowler.setMuteState(true);

  Game.isInPlay = false;
  Game.isInGameOver = true;
  Game.textIsFading = false;

  Display.update();

  document.addEventListener(Game.tapEventName, Game.resetAndStartFirstLevel);
};

/**
 * @function startLevelIntro
 * @static
 *
 * @description
 * ##### Set up and display the appropriate level intro
 * - Show the level intro text
 * - If this is the first level of the session, wait for a tap
 * - If this is a subsequent level, start a timer, after which play will start auomatically
 */
Game.startLevelIntro = function () {
  __("Game.startLevelIntro()::", RCSI.FMT_GAME);
  Game.isInLevelIntro = true;

  //Game.textIsFading = false;

  OverlayText.setEmpty();

  if (!Game.isOnFrontPage) {
    OverlayText.addNormalLevelIntro();
    Game.startTextFade(FADE_DIRECTION.IN, TIMINGS.TEXT_FADEIN_SECS);
  }

  if (Game.levelIndex === Game.skipToLevelIndex) {
    __(
      "Initial level, meaning either level 1 or whichever level is skipped to via URL hash (param Game.levelIndex === Game.skipToLevelIndex)",
      RCSI.FMT_GAME
    );
    __("\t\tSETTING OVERLAY TEXT", RCSI.FMT_GAME);
    if (Game.isOnFrontPage) {
      __("\tGame.isOnFrontPage TRUE", RCSI.FMT_GAME);
      __("\tclick starts next level", RCSI.FMT_GAME);
      document.addEventListener(Game.tapEventName, Game.nextLevel);
    } else {
      __("\tGame.isOnFrontPage FALSE", RCSI.FMT_GAME);
      __("\tclick starts gameplay after a delay", RCSI.FMT_GAME);
      OverlayText.addHitToStart();
      document.addEventListener(Game.tapEventName, Game.delayedStartGameplay);
    }
  } else {
    __("Not initial level --- start gameplay after a delay", RCSI.FMT_GAME);
    Game.delayedStartGameplay();
  }

  InternalTimer.startTicking();
};

/**
 * @function delayedStartGameplay
 * @static
 *
 * @description
 * ##### Start a timer, after which gameplay will commence
 * Also initiate fullscreen mode (unless the player has indicated that they prefer not to).
 */
Game.delayedStartGameplay = function () {
  __("Game.delayedStartGameplay()::", RCSI.FMT_GAME);
  __("CANCEL click starts gameplay after a delay", RCSI.FMT_GAME);
  document.removeEventListener(Game.tapEventName, Game.delayedStartGameplay);
  FullscreenManager.setState({
    el: Game.container_el,
    wantsFullscreen: true,
  });

  OverlayText.blankOutHitToStart();

  Timers.clearByID(TIMER_ID.LEVELINTRO_ADD_OBSTACLES);
  Timers.setByID(
    TIMER_ID.LEVELINTRO_ADD_OBSTACLES,
    ObstacleManager.addAllCollectAndAvoid,
    TIMINGS.LEVEL_INTRO_ADDOBSTACLES_MS
  );

  Timers.clearByID(TIMER_ID.TEXT_FADEOUT_START);
  Timers.setByID(
    TIMER_ID.TEXT_FADEOUT_START,
    Game.startTextFade,
    TIMINGS.LEVEL_INTRO_TEXT_FADEOUT_START_MS,
    FADE_DIRECTION.OUT,
    TIMINGS.TEXT_FADEOUT_SLOW_SECS
  );

  Timers.clearByID(TIMER_ID.LEVELINTRO_END);
  Timers.setByID(
    TIMER_ID.LEVELINTRO_END,
    Game.startPlay,
    TIMINGS.LEVEL_INTROEND_MS
  );

  // Sound was temporarily disabled at game over so set it back to whatever the
  // user preference is
  SoundManagerHowler.setMuteState(!Game.soundIsEnabled);
  __("!!!! Game.soundIsEnabled: " + Game.soundIsEnabled);
};

Game.startTextFade = function (_direction, _secs) {
  Game.textIsFading = true;
  if (_direction === FADE_DIRECTION.OUT) {
    Game.introTextFadeAlpha = 1;
    Game.introTextFadeStepSize = -1 / InternalTimer.secondsToFrames(_secs);
  } else if (_direction === FADE_DIRECTION.IN) {
    Game.introTextFadeAlpha = 0;
    Game.introTextFadeStepSize = 1 / InternalTimer.secondsToFrames(_secs);
  }
};

/*
 *
 *
 * Methods which update the game state
 *
 */

/**
 * @function doLevelCompleted
 * @static
 *
 * @description
 * ##### Player completed level
 * - Add level score to the total
 * - Explode all remaining 'avoid' obstacles
 * - Show level outro text and start a timer after which the game moves to the next level
 */
Game.doLevelCompleted = function () {
  __("LEVEL COMPLETE", RCSI.FMT_GAME);
  //__("\tGame.doubleCollected: " + Game.doubleCollected, RCSI.FMT_GAME);
  //__("\tGame.collectedThisLevel: " + Game.collectedThisLevel, RCSI.FMT_GAME);
  __("\tGame.collectableRemaining: " + Game.collectableRemaining, RCSI.FMT_GAME);
  __("\tGame.collectableTotal: " + Game.collectableTotal, RCSI.FMT_GAME);
  Game.levelsCompletedThisSession++;
  Game.addScoreForLevel();
  Game.startLevelOutro();
};

/**
 * @function startLevelOutro
 * @static
 *
 * @description
 * ##### Start level outro sequence
 */
Game.startLevelOutro = function () {
  Game.isInLevelOutro = true;

  OverlayText.addCompletedLevelOutro();
  Game.startTextFade(FADE_DIRECTION.IN, TIMINGS.TEXT_FADEIN_SECS);

  Timers.clearByID(TIMER_ID.TEXT_FADEOUT_START);
  Timers.setByID(
    TIMER_ID.TEXT_FADEOUT_START,
    Game.startTextFade,
    TIMINGS.LEVEL_OUTRO_TEXT_FADEOUT_START_MS,
    FADE_DIRECTION.OUT,
    TIMINGS.TEXT_FADEOUT_SLOW_SECS
  );

  Timers.clearByID(TIMER_ID.LEVELOUTRO_END);
  Timers.setByID(
    TIMER_ID.LEVELOUTRO_END,
    Game.nextLevel,
    TIMINGS.LEVEL_OUTROEND_MS
  );

  LevelTransition.start();
};

/**
 * @function updateTimer
 * @static
 *
 * @description
 * ##### Update the gameplay timer
 * - If time is low, set the `Game.timeIsLow` flag (which will cause the timer to start flashing)
 * - If time is up, end the game
 */
Game.updateTimer = function () {
  Game.timeRemaining =
    Game.curLevelData.timeAllowedSecs -
    Math.round((Date.now() - Game.timestampOnStart) / 1000);
  if (Game.timeRemaining <= 0) {
    Game.timeRemaining = 0;
    __("TIME UP", RCSI.FMT_GAME);
    Game.end(GAMEOVER_REASON.TIMES_UP);
  } else if (Game.timeRemaining <= GAME.TIME_LOW_SECONDS) {
    Game.timeIsLow = true;
  }
};

/**
 * @function checkPlayerHit
 * @static
 *
 * @description
 * ##### Check to see if the player is hitting an obstacle
 * - Simple circular collision detection: check if distance between 2 centre points is lower than the sum of the 2 objects' radii
 * - If we have a hit, call `Game.playerHitObstacle(_obstacle)`
 *
 * We actually check the **squared** distance between the points, as it's more efficient (by avoiding Math.sqrt()), and this method gets called hundreds of times per frame. So we must square the distance we use in the comparison too, before passing it to `Game.getSquaredObstacleDistanceFromPlayer()`.
 *
 * Modern CPUs are fast but this (possibly premature) optimisation isn't complicated so seems like low-hanging fruit, might win us a frame or 2 on slower devices.
 *
 * @param {object} _obstacle - Obstacle to check
 */
Game.checkPlayerHit = function (_obstacle) {
  var combinedRadius = Player.drawnRadius + _obstacle.radius;
  if (
    Game.getSquaredObstacleDistanceFromPlayer(_obstacle) <
    combinedRadius * combinedRadius
  ) {
    Game.playerHitObstacle(_obstacle);
  }
};

export { Game };
