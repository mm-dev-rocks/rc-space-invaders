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
import * as IMAGE_IDS from "./RCSI/IMAGE_IDS.js";
import * as STRING from "./RCSI/STRING.js";

import { Game } from "./Game.js";
import { Layout } from "./Layout.js";
import { ImageManager } from "./ImageManager.js";

class ThingManager {
  /** @type {Array} */ static things;
  /** @type {Object} */ static enemyImageData;
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
  let i, j;

  if (_data.type === THING_TYPE.ENEMY) {
    __("\t_data.pattern: " + _data.pattern);
    // Enemies are represented in a `pattern` string for visual description of grouping
    // ENEMY_BLANK = "-", ENEMY_PRESENT = "X";
    // Eg:
    // -XXX-XXX-XXX-
    // XXXXXXXXXXXXX
    // --XX--X--XX--

    if (!ThingManager.enemyImageData) {
      ThingManager.enemyImageData = ImageManager.allImages_ob[IMAGE_IDS.ENEMY_SPRITESHEET_8x8].image_el.data;
    }

    let x = 0,
      y = 0,
      xStep = (ThingManager.enemyImageData.width + GAME.ENEMY_DRAW_PAD) * GAME.ENEMY_DRAW_SCALE,
      yStep = (ThingManager.enemyImageData.height + GAME.ENEMY_DRAW_PAD) * GAME.ENEMY_DRAW_SCALE;

    const rows = _data.pattern.split("\n");
    for (i = 0; i < rows.length; i++) {
      const cols = rows[i].split("");
      for (j = 0; j < cols.length; j++) {
        const char = cols[j];
        if (char === STRING.ENEMY_BLANK) {
          // Just move along to leave a space
          x += xStep;
        } else if (char === STRING.ENEMY_PRESENT) {
          ThingManager.spawn(Object.assign({ fixedStartX: x, fixedStartY: y }, _data));
          x += xStep;
        }
      }
      x = 0;
      y += yStep;
    }
  } else {
    __("\t_data.total: " + _data.total);
    for (i = 0; i < _data.total; i++) {
      ThingManager.spawn(_data);
    }
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
    x = randomFloatBetween(bounds_rect.left + thing.radius, bounds_rect.right - thing.radius);
    y = randomFloatBetween(bounds_rect.top + thing.radius, bounds_rect.bottom - thing.radius);
  } else if (_data.type === THING_TYPE.ENEMY) {
    __(`ENEMY!!!`);
    x = bounds_rect.left + _data.fixedStartX;
    y = bounds_rect.top + _data.fixedStartY;
  } else {
    // OTHER
    x = randomFloatBetween(bounds_rect.left + thing.radius, bounds_rect.right - thing.radius);
    y = randomFloatBetween(bounds_rect.bottom + thing.radius * 2, bounds_rect.bottom * 2 + thing.radius * 2);
  }

  thing.pos = { x: x, y: y };

  ThingManager.things.push(thing);
};

/**
 * @function enemyBounceInRectangle
 * @static
 *
 * @description
 * ##### Bounce an enemy thing off the walls of a rectangle
 * Enemies move in unison, so when one bounces, they all change direction
 *
 * @param {object} _thing
 * @param {object} _rect - A rectangle with top, right, bottom, left properties
 */
ThingManager.enemyBounceInRectangle = function (_thing, _rect) {
  var i,
    currentThing,
    overlapSideBy = 0,
    hasBounced = false;

  if (_thing.pos.x < _rect.left + _thing.radius) {
    hasBounced = true;
    overlapSideBy = _rect.left + _thing.radius - _thing.pos.x;
    //overlapSideBy = _thing.radius;
  } else if (_thing.pos.x > _rect.right - _thing.radius) {
    hasBounced = true;
    overlapSideBy = 0 - (_thing.pos.x - (_rect.right - _thing.radius));
    //overlapSideBy = 0 - _thing.radius;
  }
  if (hasBounced) {
    for (i = 0; i < ThingManager.things.length; i++) {
      currentThing = ThingManager.things[i];
      if (currentThing.type === THING_TYPE.ENEMY) {
        currentThing.vector.x *= -1;
        currentThing.pos.x += overlapSideBy;
        currentThing.pos.y += (ThingManager.enemyImageData.height + GAME.ENEMY_DRAW_PAD) * GAME.ENEMY_DRAW_SCALE;
      }
    }
  }
  return hasBounced;
};

/**
 * @function addAllEnemy
 * @static
 *
 * @description
 * ##### Add all the groups of enemy things
 * - Calls `addGroup()` for each group
 */
ThingManager.addAllEnemy = function () {
  __("ThingManager.addAllEnemy");
  var i;
  for (i = 0; i < Game.curLevelData.things.length; i++) {
    __(`Game.curLevelData.things[i].type: ${Game.curLevelData.things[i].type}`);
    if (Game.curLevelData.things[i].type === THING_TYPE.ENEMY) {
      ThingManager.addGroup(Game.curLevelData.things[i]);
    }
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
    totalThings = ThingManager.things.length,
    enemyBounceHappened = false;

  for (i = totalThings - 1; i >= 0; i--) {
    thing = ThingManager.things[i];

    if (thing.type === THING_TYPE.BACKGROUND) {
      ThingManager.wrapAroundRectangle(thing, Layout.background_rect);
    } else if (!thing.isDeleted && !enemyBounceHappened) {
      enemyBounceHappened = ThingManager.enemyBounceInRectangle(thing, Layout.gameplay_rect);
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
