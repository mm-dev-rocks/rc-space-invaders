/**
 * @license GPL-3.0-only
 *
 * @author Mark Mayes / mm-dev
 *
 *
 * @module InternalTimer
 *
 * @description
 * ## Handles ticks/frames
 * - `requestAnimationFrame()` is used to call a function before the next browser repaint --- this function performs all updates to the state of the game (hopefully) inbetween repaints
 * - Every time an update happens, we record the timestamp in `InternalTimer.lastTick_ms`
 * - When we next update, we see how much time has elapsed since the last update
 * - From this, we can calculate how many of our ideal-world (`GAME.FRAME_MS`) frames have passed
 * - If we aren't quite keeping up with the ideal frame rate, eg 2 frames' worth of time has passed since our last update, we can try to keep things looking smooth by moving obstacles twice as far as during a single-frame update
 */

import { PD } from "./PD/CONST.js";
import * as GAME from "./PD/GAME.js";

import { Game } from "./Game.js";

import { __ } from "./utils.js";

class InternalTimer {}

/**
 * @function init
 * @static 
 *
 * @description
 * ##### Main init
 */
InternalTimer.init = function () {
  InternalTimer.frameCount = 0;

  InternalTimer.fpsRecent_ar = [];
  InternalTimer.currentFps = GAME.TARGET_FPS;
};

/**
 * @function startTicking
 * @static 
 *
 * @description
 * ##### Start the internal clock
 */
InternalTimer.startTicking = function () {
  __("InternalTimer.startTicking()::", PD.FMT_GAME);

  // set initial tick timestamp
  requestAnimationFrame(function (_timestamp_ms) {
    InternalTimer.lastTick_ms = _timestamp_ms;
  });
  // start ticking
  InternalTimer.nextTick();
};

/**
 * @function tick
 * @static 
 *
 * @description
 * ##### This function is given as a callback for `requestAnimationFrame()`
 * - Calculate how many frames have passed since the last tick
 * - Increment the internal frame count variable
 * - Call the main game update function `Game.updateByFrameCount()`, passing it the number of frames
 * - Start the next tick
 *
 * @param {DOMHighResTimeStamp} _timestamp_ms - The time of the previous frame's rendering (automatically passed in by `requestAnimationFrame()`)
 */
InternalTimer.tick = function (_timestamp_ms) {
  var framesSinceLastTick,
    sinceLastTick_ms = _timestamp_ms - InternalTimer.lastTick_ms;

  if (sinceLastTick_ms > GAME.FRAME_MS) {
    InternalTimer.lastTick_ms = _timestamp_ms;
    framesSinceLastTick = Math.floor(sinceLastTick_ms / GAME.FRAME_MS);
    //__('framesSinceLastTick: ' + framesSinceLastTick, PD.FMT_GAME);

    InternalTimer.frameCount += framesSinceLastTick;

    Game.updateByFrameCount(framesSinceLastTick);

    InternalTimer.updateFpsAverage(1000 / sinceLastTick_ms);
  }

  // TODO remove this check and handle inbetween levels properly while animation continues
  //if (Game.isInPlay) {
    InternalTimer.nextTick();
  //}
};

/**
 * @function nextTick
 * @static 
 *
 * @description
 * ##### Call `requestAnimationFrame()` for the next opportunity to run `InternalTimer.tick()`
 */
InternalTimer.nextTick = function () {
  cancelAnimationFrame(InternalTimer.tickAnimationFrameRef);
  InternalTimer.tickAnimationFrameRef = requestAnimationFrame(
    InternalTimer.tick
  );
};

/**
 * @function updateFpsAverage
 * @static 
 *
 * @description
 * ##### Keep a rolling average of how many frames per second we are achieving
 * - On each `InternalTimer.tick()` an estimate of FPS for the latest frame is calculated and passed in to this function
 * - The most recent few (`GAME.FPSDISPLAY_AVERAGE_FRAMES_SPAN`) fps timings are kept in an array
 * - The array is summed and the sum is divided by the array length to get an average (mean) which is stored as `InternalTimer.currentFps`
 *
 * @param {number} _latestFps - The most recent FPS reading
 */
InternalTimer.updateFpsAverage = function (_latestFps) {
  var i,
    sum = 0;

  // Add latest reading to front of the array. Adding at the end (with `pop`)
  // would mean we keep chopping off the most recent values when we fix
  // `length`.
  InternalTimer.fpsRecent_ar.unshift(_latestFps);

  // Chop old values off the end of the array
  InternalTimer.fpsRecent_ar.length = Math.min(
    InternalTimer.fpsRecent_ar.length,
    GAME.FPSDISPLAY_AVERAGE_FRAMES_SPAN
  );

  for (i = 0; i < InternalTimer.fpsRecent_ar.length; i++) {
    sum += InternalTimer.fpsRecent_ar[i];
  }
  // Get average (mean) value of array
  InternalTimer.currentFps = Math.floor(
    sum / InternalTimer.fpsRecent_ar.length
  );
};

/**
 * @function secondsToFrames
 * @static 
 *
 * @description
 * ##### Convert seconds to number of frames
 * Eg when an animation wants to run for 10secs, how many frames should it last for?
 *
 * @param {number} _secs - How many seconds to convert
 *
 * @returns {number} The **estimated** number of frames it will take for `_secs` seconds to expire
 */
InternalTimer.secondsToFrames = function(_secs) {
  return Math.ceil(_secs * InternalTimer.currentFps);
};

export { InternalTimer };
