/**
 * @license GPL-3.0-only
 *
 * @author Mark Mayes / mm-dev
 *
 *
 * @module ThingManager
 *
 * @description
 * ## Handles thing-related jobs
 * 'Things' are all non-player, in-game items including:
 * - Background stars
 * - Enemies
 * - Bullets
 */

import { __, degreesToVector, getRandomItemFromArray, randomFloatBetween, randomIntBetween } from "./utils.js";

import { THING_TYPE } from "./RCSI/ENUM.js";
import * as GAME from "./RCSI/GAME.js";

import { Game } from "./Game.js";
import { Layout } from "./Layout.js";

class ThingManager {
  /** @type {Array} */ static things;
}

/**
 * @function reset
 * @static
 *
 * @description
 * ##### Wipes all things and related data, to be used before starting a new level
 */
ThingManager.reset = function () {
  ThingManager.deleteThings();
};

/**
 * @function deleteThings
 * @static
 *
 * @description
 * ##### Empty the things array so that old things can be garbage collected
 */
ThingManager.deleteThings = function () {
  ThingManager.things = [];
};

/**
 * @function addGroup
 * @static
 *
 * @description
 * ##### Add a group of things to the game
 * Loops through the group, calling `spawn()` repeatedly until `_data.total` things of this group type have been added.
 *
 * @param {object} _data - An object describing a group of things, originating from a `LEVEL_DATA/*.js` file
 */
ThingManager.addGroup = function (_data) {
  __("ThingManager.addGroup()::");
  __("\t_data.total: " + _data.total);
  var i;

  for (i = 0; i < _data.total; i++) {
    ThingManager.spawn(_data);
  }
};

/**
 * @function getRandomVector
 * @static
 *
 * @description
 * ##### Get a random vector for a thing, based on its allowable range of movement as described in its group data
 *
 * @param {number} _degreesMin - Smallest possible angle of direction in degrees
 * @param {number} _degreesMax - Largest possible angle of direction in degrees
 *
 * @return {object} A normalised vector
 */
ThingManager.getRandomVector = function (_degreesMin, _degreesMax) {
  return degreesToVector(randomIntBetween(_degreesMin, _degreesMax));
};

/**
 * @function spawn
 * @static
 *
 * @description
 * ##### Creates an individual thing object and adds it to `ThingManager.things` array
 * Sets various properties depending on the type of thing.
 *
 * @param {object} _data - An object describing a group of things, originating from a `LEVEL_DATA/*.js` file
 */
ThingManager.spawn = function (_data) {
  var x,
    y,
    bounds_rect,
    thing = {
      type: _data.type,
      subtype: _data.subtype,
      color: Array.isArray(_data.color_ar) ? getRandomItemFromArray(_data.color_ar) : undefined,
      nativeSpeed: Math.max(
        randomFloatBetween(_data.speedRange[0], _data.speedRange[1]) / GAME.PIXEL_SCALE,
        GAME.STATIC_THING_SPEED,
      ),
      vector: ThingManager.getRandomVector(_data.directionRange[0], _data.directionRange[1]),
      radius: randomFloatBetween(_data.radiusRange[0], _data.radiusRange[1]),
    };

  thing.speed = thing.nativeSpeed;

  if (_data.type === THING_TYPE.BACKGROUND) {
    bounds_rect = Layout.background_rect;
  } else {
    bounds_rect = Layout.gameplay_rect;
  }

  if (_data.type === THING_TYPE.BACKGROUND) {
    // BACKGROUND
    x = randomFloatBetween(bounds_rect.left + thing.radius, bounds_rect.right - thing.radius);
    y = randomFloatBetween(bounds_rect.top + thing.radius, bounds_rect.bottom - thing.radius);
  } else {
    // OTHER
    x = randomFloatBetween(bounds_rect.left + thing.radius, bounds_rect.right - thing.radius);
    y = randomFloatBetween(bounds_rect.bottom + thing.radius * 2, bounds_rect.bottom * 2 + thing.radius * 2);
  }

  thing.pos = { x: x, y: y };

  ThingManager.things.push(thing);
};

/**
 * @function bounceInRectangle
 * @static
 *
 * @description
 * ##### Bounce a thing off the walls of a rectangle
 *
 * @param {object} _thing
 * @param {object} _rect - A rectangle with top, right, bottom, left properties
 */
ThingManager.bounceInRectangle = function (_thing, _rect) {
  var hasBounced = false;

  if (_thing.pos.x < _rect.left + _thing.radius) {
    _thing.vector.x *= -1;
    _thing.pos.x = _rect.left + _thing.radius;
    hasBounced = true;
  } else if (_thing.pos.x > _rect.right - _thing.radius) {
    _thing.vector.x *= -1;
    _thing.pos.x = _rect.right - _thing.radius;
    hasBounced = true;
  }
};

/**
 * @function addAllBackground
 * @static
 *
 * @description
 * ##### Add all the groups of background things
 * - Background things (stars) appear underneath everything else and don't interact with the player
 * - Calls `addGroup()` for each group
 */
ThingManager.addAllBackground = function () {
  var i;
  for (i = 0; i < Game.curLevelData.things.length; i++) {
    if (Game.curLevelData.things[i].type === THING_TYPE.BACKGROUND) {
      ThingManager.addGroup(Game.curLevelData.things[i]);
    }
  }
};

/**
 * @function update
 * @static
 *
 * @description
 * ##### Loop through all things, updating their positions and other properties
 *
 * @param {number} _frames - Number of frames passed since last update, in case the engine isn't keeping up with our desired frame rate and we need perform multiple operations to keep things as smooth/consistent as possible
 */
ThingManager.update = function (_frames) {
  var i,
    thing,
    totalThings = ThingManager.things.length;

  for (i = totalThings - 1; i >= 0; i--) {
    thing = ThingManager.things[i];

    if (thing.type === THING_TYPE.BACKGROUND) {
      ThingManager.wrapAroundRectangle(thing, Layout.background_rect);
    } else if (!thing.isDeleted) {
      //  if (thing.speed > thing.nativeSpeed) {
      //    thing.speed *= GAME.THING_RETURNTONORMALSPEED_RATE;
      //    if (thing.speed < thing.nativeSpeed) {
      //      thing.speed = thing.nativeSpeed;
      //    }
    }

    if (!thing.isDeleted) {
      thing.pos.x += thing.vector.x * thing.speed * _frames;
      thing.pos.y += thing.vector.y * thing.speed * _frames;
    }
  }
};

/**
 * @function wrapAroundRectangle
 * @static
 *
 * @description
 * ##### Wrap a thing at the boundaries of a rectangle
 * Behaviour varies based on thing type.
 * IN THIS GAME ONLY THE STARS WRAP, SO WE ONLY NEED TO HANDLE THE TOP/BOTTOM EDGES
 *
 * @param {object} _thing
 * @param {object} _rect - A rectangle with top, right, bottom, left properties
 */
ThingManager.wrapAroundRectangle = function (_thing, _rect) {
  var hasWrapped,
    diameter = _thing.radius * 2,
    wrapHeight = _rect.bottom - _rect.top + diameter * 2;

  // Handle top/bottom edges
  if (_thing.pos.y + diameter < _rect.top && _thing.vector.y < 0) {
    _thing.pos.y += wrapHeight;
    hasWrapped = true;
  } else if (_thing.pos.y - diameter > _rect.bottom && _thing.vector.y > 0) {
    _thing.pos.y -= wrapHeight;
    hasWrapped = true;
  }
};

export { ThingManager };
