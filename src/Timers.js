/**
 * @license GPL-3.0-only
 *
 * @author Mark Mayes / mm-dev
 *
 *
 * @module Timers
 *
 * @description
 * ## Wrapper functions for handling timers
 */


class Timers {}

/**
 * @function setByID
 * @static 
 *
 * @description
 * ##### Set a timeout and assign it an ID so that it can be easily cleared
 *
 * @param {string} _id - The timer ID
 * @param {object[]} _timeoutArgs - An array of arguments, exactly as would be passed to a native `setTimeout()` call
 */
Timers.setByID = function(_id, ..._timeoutArgs) {
  //logMsg("Timers::setByID()" + _id);
  //logMsg("_timeoutArgs: " + _timeoutArgs);
  Timers[_id] = setTimeout(..._timeoutArgs);
};

/**
 * @function clearByID
 * @static 
 *
 * @description
 * ##### Clear a timeout based on its ID
 *
 * @param {string} _id - The timer ID
 */
Timers.clearByID = function(_id) {
  //logMsg("Timers::clearByID()" + _id);
  clearTimeout(Timers[_id]);
};

export {Timers};
