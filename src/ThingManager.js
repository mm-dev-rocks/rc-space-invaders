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
 */

import {
  __,
  circleAreaFromRadius,
  degreesToVector,
  getRandomItemFromArray,
  hexOpacityToRGBA,
  modulo,
  pointIsInRect,
  randomFloatBetween,
  randomIntBetween,
  vectorRotateByDegrees,
  vectorAdd,
  vectorSubtract,
  vectorMultiply,
  vectorGetDotProduct,
  vectorGetMagnitude,
  vectorGetUnitNormal,
  vectorScalarMultiply,
  vectorToDegrees,
} from "./utils.js";

import { RCSI } from "./RCSI/CONST.js";
import { THING_SUBTYPE, THING_TYPE } from "./RCSI/ENUM.js";
import * as GAME from "./RCSI/GAME.js";
import * as TIMINGS from "./RCSI/TIMINGS.js";

import { Player } from "./Player.js";
import { Game } from "./Game.js";
import { InternalTimer } from "./InternalTimer.js";
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
 * @function addGroupToRadiusRanges
 * @static
 *
 * @description
 * ##### Check the range of radii for a group of things
 * Over the entire game we want to know what the smallest and highest radii of things is. This info is then used to decide which sound effects to add to an thing:
 * - Smallest things will have the highest-pitch version of SFX
 * - Largest things will have the lowest-pitch version of SFX
 *
 * @param {object} _data - An object describing a group of things, originating from a `LEVEL_DATA/*.js` file
 */
ThingManager.addGroupToRadiusRanges = function (_data) {
  if (!ThingManager.radiusMin || _data.radiusRange[0] < ThingManager.radiusMin) {
    ThingManager.radiusMin = _data.radiusRange[0];
  }
  if (!ThingManager.radiusMax || _data.radiusRange[1] > ThingManager.radiusMax) {
    ThingManager.radiusMax = _data.radiusRange[1];
  }
  __("ThingManager.radiusMin: " + ThingManager.radiusMin);
  __("ThingManager.radiusMax: " + ThingManager.radiusMax);
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
  ThingManager.surfaceAreaOfGroup = 0;
  for (i = 0; i < _data.total; i++) {
    ThingManager.spawn(_data);
  }
  __(
    "ThingManager.surfaceAreaOfGroup: " +
      Math.round(ThingManager.surfaceAreaOfGroup).toLocaleString() +
      "\t" +
      _data.type,
    RCSI.FMT_INFO,
  );
};

/**
 * @function getRandomVector
 * @static
 *
 * @description
 * ##### Get a random vector for an thing, based on its allowable range of movement as described in its group data
 *
 * @param {number} _degreesMin - Smallest possible angle of direction in degrees
 * @param {number} _degreesMax - Largest possible angle of direction in degrees
 *
 * @return {object} A normalised vector
 */
ThingManager.getRandomVector = function (_degreesMin, _degreesMax) {
  _degreesMin += 90;
  _degreesMax += 90;

  return degreesToVector(randomIntBetween(_degreesMin, _degreesMax));
};

/**
 * @function getSoundIDFromRadius
 * @static
 *
 * @description
 * ##### Choose sound based on size of thing
 *
 * @param {number} _r - Thing radius
 * @param {array} _orderedSfx_ar - An array of IDs for sounds which may represent this thing. The sounds will all be the same SFX, each processed to a different pitch. They should be ordered in descending pitch order.
 *
 * @return {string} A sound ID
 */
ThingManager.getSoundIDFromRadius = function (_r, _orderedSfx_ar) {
  var soundID,
    radiusRange = ThingManager.radiusMax - ThingManager.radiusMin,
    radiusGroupSize = radiusRange / _orderedSfx_ar.length,
    sfxPositionInRange = Math.floor((_r - ThingManager.radiusMin) / radiusGroupSize);

  if (isNaN(sfxPositionInRange)) {
    sfxPositionInRange = 0;
  }

  soundID = _orderedSfx_ar[sfxPositionInRange];
  //__('ThingManager.radiusMax: ' + ThingManager.radiusMax);
  //__('ThingManager.radiusMin: ' + ThingManager.radiusMin);
  //__('_r: ' + _r);
  //__('radiusRange: ' + radiusRange);
  //__('radiusGroupSize: ' + radiusGroupSize);
  //__('sfxPositionInRange: ' + sfxPositionInRange);
  //__('soundID: ' + soundID);
  return soundID;
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
        //speed: Math.max(
        randomFloatBetween(_data.speedRange[0], _data.speedRange[1]) / GAME.PIXEL_SCALE,
        GAME.STATIC_THING_SPEED,
      ),
      vector: ThingManager.getRandomVector(_data.directionRange[0], _data.directionRange[1]),
      radius: randomFloatBetween(_data.radiusRange[0], _data.radiusRange[1]),
      gradient: _data.gradient,
      gradientFadePoint: _data.gradientFadePoint,
      useDefaultStroke: _data.useDefaultStroke,
      damageSfx: _data.damageSfx,
      // Used for a short time after collisions
      //addedSpeed: 0,
      explodingFramesCounter: 0,
      hasEnteredGameplayArea: false,
    };

  thing.speed = thing.nativeSpeed;

  if (_data.type === THING_TYPE.BACKGROUND) {
    bounds_rect = Layout.background_rect;
  } else if (_data.type === THING_TYPE.FLOATING) {
    bounds_rect = Layout.floating_rect;
  } else {
    bounds_rect = Layout.gameplay_rect;
  }

  if (_data.type === THING_TYPE.BACKGROUND || _data.type === THING_TYPE.FLOATING) {
    // BACKGROUND / FLOATING
    x = randomFloatBetween(bounds_rect.left + thing.radius, bounds_rect.right - thing.radius);
    y = randomFloatBetween(bounds_rect.top + thing.radius, bounds_rect.bottom - thing.radius);
  } else {
    // AVOID / COLLECT
    x = randomFloatBetween(bounds_rect.left + thing.radius, bounds_rect.right - thing.radius);
    y = randomFloatBetween(bounds_rect.bottom + thing.radius * 2, bounds_rect.bottom * 2 + thing.radius * 2);

    if (_data.type === THING_TYPE.AVOID) {
      // AVOIDABLE
      thing.damageSafetyCounter = 0;
    } else if (_data.type === THING_TYPE.COLLECT) {
      //if (_data.type === THING_TYPE.COLLECT) {
      // COLLECTABLE
      thing.soundID = ThingManager.getSoundIDFromRadius(thing.radius, _data.collectSfx_ar);
    }

    if (thing.color) {
      thing.explodingColor = hexOpacityToRGBA(thing.color, GAME.EXPLODING_THING_ALPHA);
    }

    thing.explodeFrameAngleIncrease = randomFloatBetween(
      GAME.EXPLODING_FRAMES_ANGLE_INCREASE_MIN,
      GAME.EXPLODING_FRAMES_ANGLE_INCREASE_MAX,
    );
    thing.explodeFrameAngleIncrease *= -1;

    thing.explodingFramesReduceSpeedMultiplier = randomFloatBetween(
      GAME.EXPLODING_FRAMES_REDUCE_SPEED_MULTIPLIER_MIN,
      GAME.EXPLODING_FRAMES_REDUCE_SPEED_MULTIPLIER_MAX,
    );

    thing.explodingFramesReduceRadiusMultiplier = randomFloatBetween(
      GAME.EXPLODING_FRAMES_REDUCE_RADIUS_MULTIPLIER_MIN,
      GAME.EXPLODING_FRAMES_REDUCE_RADIUS_MULTIPLIER_MAX,
    );
  }

  // Ensure this happens afer stuff like `getSoundIDFromRadius()`
  thing.radius *= Layout.proportionalMultiplier;

  // Rotation
  thing.rotation = vectorToDegrees(thing.vector);
  if (Array.isArray(_data.rotationSpeedRange)) {
    thing.rotationSpeed = randomFloatBetween(_data.rotationSpeedRange[0], _data.rotationSpeedRange[1]);
    if (Math.random() < 0.5) {
      thing.rotationSpeed *= -1;
    }
  }

  // Special shapes
  if (_data.subtype === THING_SUBTYPE.FLOWER || _data.subtype === THING_SUBTYPE.STAR) {
    thing.numAppendages = randomIntBetween(_data.numAppendagesRange[0], _data.numAppendagesRange[1]);
    thing.shapeCenterRadiusDivisor = _data.shapeCenterRadiusDivisor;
    if (thing.rotationSpeed !== undefined) {
      // rotation value is used in the `Display.draw*()` drawing of
      // appendages (eg, flower petals,points of a star), rotating the appendages makes the shape appear to rotate, but
      // too fast, hence the following division
      thing.rotationSpeed /= thing.numAppendages;
    }
  }

  if (Array.isArray(_data.shapeCenterColor_ar)) {
    thing.shapeCenterColor = getRandomItemFromArray(_data.shapeCenterColor_ar);
  }

  thing.pos = { x: x, y: y };

  ThingManager.things.push(thing);
};

/**
 * @function increaseVectorAngle
 * @static
 *
 * @description
 * ##### Adjust an thing's vector to incrementally spin the thing
 * Directly adjusts the vector property of the object.
 *
 * @param {object} _thing
 * @param {number} _inc - A negative or positive number, in degrees, by which to adjust the vector
 */
ThingManager.increaseVectorAngle = function (_thing, _inc) {
  var degrees = vectorToDegrees(_thing.vector) + _inc;
  _thing.vector = degreesToVector(degrees);
};

/**
 * @function incrementExplosionAnimation
 * @static
 *
 * @description
 * ##### Process the next frame of the thing explosion animation
 * At the end of the animation, mark the thing as deleted.
 *
 * @param {object} _thing
 */
ThingManager.incrementExplosionAnimation = function (_thing) {
  ThingManager.increaseVectorAngle(_thing, _thing.explodeFrameAngleIncrease);
  _thing.radius *= _thing.explodingFramesReduceRadiusMultiplier;
  _thing.speed *= _thing.explodingFramesReduceSpeedMultiplier;
  if (_thing.explodingFramesCounter < 1) {
    _thing.isDeleted = true;
  }
};

/**
 * @function wrapAroundRectangle
 * @static
 *
 * @description
 * ##### Wrap an thing at the boundaries of a rectangle
 * Behaviour varies based on thing type.
 *
 * @param {object} _thing
 * @param {object} _rect - A rectangle with top, right, bottom, left properties
 */
ThingManager.wrapAroundRectangle = function (_thing, _rect) {
  var hasWrapped,
    diameter = _thing.radius * 2,
    // floating/bg things always wrap in both portrait and landscape
    wrapBothAspects = _thing.type === THING_TYPE.BACKGROUND || _thing.type === THING_TYPE.FLOATING,
    // Avoidable objects might cross boundaries while travelling in the wrong direction, but we still need them to wrap
    ignoreDirectionOfTravel = _thing.type === THING_TYPE.AVOID;

  wrapWidth = _rect.right - _rect.left + diameter * 2;
  wrapHeight = _rect.bottom - _rect.top + diameter * 2;

  // Handle left/right edges
  if (wrapBothAspects) {
    if (_thing.pos.x + diameter < _rect.left && (_thing.vector.x < 0 || ignoreDirectionOfTravel)) {
      _thing.pos.x += wrapWidth;
      hasWrapped = true;
    } else if (_thing.pos.x - diameter > _rect.right && (_thing.vector.x > 0 || ignoreDirectionOfTravel)) {
      _thing.pos.x -= wrapWidth;
      hasWrapped = true;
    }
  }

  // Handle top/bottom edges
  if (_thing.pos.y + diameter < _rect.top && (_thing.vector.y < 0 || ignoreDirectionOfTravel)) {
    _thing.pos.y += wrapHeight;
    hasWrapped = true;
  } else if (_thing.pos.y - diameter > _rect.bottom && (_thing.vector.y > 0 || ignoreDirectionOfTravel)) {
    _thing.pos.y -= wrapHeight;
    hasWrapped = true;
  }

  if (hasWrapped) {
    // if mid-explosion when wrap happens, cancel explosion
    if (_thing.explodingFramesCounter > 0) {
      _thing.isDeleted = true;
    }
    _thing.rotation = vectorToDegrees(_thing.vector);
  }
};

// TODO This comment needs a lot of work
/**
 * @function bounceOffPlayer
 * @static
 *
 * @description
 * ##### Calculate effects of a collision between the player and an thing
 *
 *
 * This is an **elastic collision**, no energy is lost in the collision ie its a 'perfect'/unrealistic collision.
 *
 * ###### Conservation of momentum
 *
 * Momentum is the product of mass and velocity:
 *   `p = m * v`
 *
 * ```
 * (Player.radius * Player.speed) + (_thing.radius * Thing.speed)
 * =
 * (Player.radius * Player.speedAfter) + (_thing.radius * Thing.speedAfter)
 * ```
 *
 * ###### Conservation of kinetic energy
 *
 * Kinetic energy of an object is half its mass times the square of its velocity:
 *   `ke = (0.5 * m) * (v * v)`
 *
 * ```
 * ((0.5 * Player.radius) * (Player.speed * Player.speed)) + ((0.5 * _thing.radius) * (Thing.speed * Thing.speed))
 * =
 * ((0.5 * Player.radius) * (Player.speedAfter * Player.speedAfter)) + ((0.5 * _thing.radius) * (Thing.speedAfter * Thing.speedAfter))
 * ```
 *
 * So after collision:
 * ```
 * Player.speedAfter = (Player.speed * (Player.radius - _thing.radius)) + (2 * _thing.radius * Thing.speed) / (Player.radius + _thing.radius)
 * Thing.speedAfter = (Thing.speed * (_thing.radius - Player.radius)) + (2 * Player.radius * Player.speed) / (Player.radius + _thing.radius)
 * ```
 *
 * Project the **velocity vectors** of the 2 objects (player and thing) onto the vectors which are **normal** (perpendicular) and **tangent** to the surface of the collision.
 *
 * So for each velocity (player and thing) we have 2 components:
 * - Normal component: These undergo a 1-dimensional collison, computed using the formulas above
 * - Tangential component: Unchanged by the collision, as there is no force along the line tangent to the collision surface
 *
 * Then the **unit normal vector** is multiplied by the **scalar normal velocity** after the collision, to get a vector which has a direction normal to the collision surface, and a magnitude which is the normal component of the velocity after the collision.
 *
 * The same is done with the **unit tangent vector** and the **scalar tangential velocity**
 *
 * Finally the new velocity vectors are found by adding the normal velocity and tangential velocity for each object.
 *
 *
 * 1. Find **unit normal** and **unit tangent** vectors
 * Unit normal:
 * - Has magnitude of 1
 * - Direction is normal (perpendicular) to the surfaces of the objects at the point of collision
 * Unit tangent:
 * - Has magnitude of 1
 * - Direction is tangent to the surfaces of the objects at the point of collision
 *
 * First find a normal vector:
 * - A vector whose components are the difference between the coordinates of the centres of the circles
 * `normalVector = { x: _thing.pos.x - Player.pos.x, y: _thing.pos.y - Player.pos.y };`
 *
 * Next get the unit vector of `normalVector`:
 * ```
 * normalVectorMagnitude = Math.sqrt(
 *   (normalVector.x * normalVector.x) +
 *   (normalVector.y * normalVector.y)
 * );
 * unitNormalVector = {
 *   x: normalVector.x / normalVectorMagnitude,
 *   y: normalVector.y / normalVectorMagnitude
 * }
 * // OR
 * normalVectorMagnitude = vectorGetMagnitude(normalVector);
 * unitNormalVector = vectorScalarMultiply(normalVector, normalVectorMagnitude);
 * ```
 *
 * Next get the unit vector of `tangentVector`:
 * - x component is equal to the negative of the y component of the unit normal vector
 * - y component is equal to the xcomponent of the unit normal vector
 * ```
 * unitTangentVector = {
 *   x: -1 * unitNormalVector.y,
 *   y: unitNormalVector.x
 * }
 * ```
 *
 *
 * 2. Create the initial (before the collision) velocity vectors **ALREADY DONE** (Player/thing vectors)
 *
 *
 * 3. After the collision:
 * - The tangential component of the velocities is unchanged
 * - The normal component of the velocities can be found using the 1D collision formulas above
 *
 * So for the player and thing velocity vectors we need to resolve them into normal and tangential components. To do this, project the velocity vectors  onto the unit normal and unit tangent vectors by computing the dot product.
 *
 * ```
 * normalVectorPlayerMagnitude = vectorGetDotProduct(unitNormalVector, Player.velocityVector);
 * tangentVectorPlayerMagnitude = vectorGetDotProduct(unitTangentVector, Player.velocityVector);
 *
 * normalVectorThingMagnitude = vectorGetDotProduct(unitNormalVector, _thing.velocityVector);
 * tangentVectorThingMagnitude = vectorGetDotProduct(unitTangentVector, _thing.velocityVector);
 * ```
 *
 *
 * 4. Find new (after collision) tangential velocities, which are simply equal to the old ones:
 * ```
 * tangentVectorPlayerMagnitudeAfter = tangentVectorPlayerMagnitude;
 * tangentVectorThingMagnitudeAfter = tangentVectorThingMagnitude;
 * ```
 *
 * 5. Find the new normal velocities using the 1D collision formulas from earlier
 * ```
 * normalVectorPlayerMagnitudeAfter =
 *   ((normalVectorPlayerMagnitude * (Player.radius - _thing.radius)) +
 *   (2 * _thing.radius * normalVectorThingMagnitude)) /
 *   (Player.radius + _thing.radius)
 *
 * normalVectorThingMagnitudeAfter =
 *   ((normalVectorThingMagnitude * (_thing.radius - Player.radius)) +
 *   (2 * Player.radius * normalVectorPlayerMagnitude)) /
 *   (Player.radius + _thing.radius)
 * ```
 *
 * 6. Convert the scalar normal and tangential velocities into vectors:
 * - Multiply the unit normal vector by the scalar normal velocity (magnitude) to get a vector which is normal to the surfaces at the point of collision with a magnitude equal to the normal component of the velocity.
 * - Multiply the unit tangential vector by the scalar tangential velocity (magnitude) to get a vector which is tangential to the surfaces at the point of collision with a magnitude equal to the tangential component of the velocity.
 *
 * ```
 * normalVectorPlayerAfter = vectorScalarMultiply(unitNormalVector, normalVectorPlayerMagnitudeAfter);
 * tangentVectorPlayerAfter = vectorScalarMultiply(unitTangentVector, tangentVectorPlayerMagnitudeAfter);
 * normalVectorThingAfter = vectorScalarMultiply(unitNormalVector, normalVectorThingMagnitudeAfter);
 * tangentVectorThingAfter = vectorScalarMultiply(unitTangentVector, tangentVectorThingMagnitudeAfter);
 * ```
 *
 * 7. Find the final velocity vectors by adding the normal and tangential components for each object
 *
 * ```
 * playerVelocityVectorAfter = vectorAdd(normalVectorPlayerAfter, tangentVectorPlayerAfter);
 * playerVectorMagnitudeAfter = vectorGetMagnitude(playerVelocityVectorAfter);
 * playerUnitVectorAfter = {
 *   x: playerVelocityVectorAfter.x / playerVectorMagnitudeAfter,
 *   y: playerVelocityVectorAfter.y / playerVectorMagnitudeAfter,
 * };
 *
 * thingVelocityVectorAfter = vectorAdd(normalVectorThingAfter, tangentVectorThingAfter);
 * thingVectorMagnitudeAfter = vectorGetMagnitude(thingVelocityVectorAfter);
 * thingUnitVectorAfter = {
 *   x: thingVelocityVectorAfter.x / thingVectorMagnitudeAfter,
 *   y: thingVelocityVectorAfter.y / thingVectorMagnitudeAfter,
 * };
 * ```
 *
 * These are velocity vectors (including magnitude) so need to be broken down into unit vectors and magnitude for use on the player and thing
 *
 *
 * @param {object} _thing - The collided-with thing
 *
 * @returns {object} A vector which is used to move the control stick and give the effect of the player being knocked
 */
ThingManager.bounceOffPlayer = function (_thing) {
  var normalVector = {
      x: _thing.pos.x - Player.pos.x,
      y: _thing.pos.y - Player.pos.y,
    },
    normalVectorMagnitude = vectorGetMagnitude(normalVector),
    unitNormalVector = vectorScalarMultiply(normalVector, 1 / normalVectorMagnitude),
    //
    unitTangentVector = {
      x: -1 * unitNormalVector.y,
      y: unitNormalVector.x,
    },
    thingVelocityVector = vectorScalarMultiply(_thing.vector, _thing.speed),
    normalVectorPlayerMagnitude = vectorGetDotProduct(unitNormalVector, Player.velocityVector),
    tangentVectorPlayerMagnitude = vectorGetDotProduct(unitTangentVector, Player.velocityVector),
    normalVectorThingMagnitude = vectorGetDotProduct(unitNormalVector, thingVelocityVector),
    tangentVectorThingMagnitude = vectorGetDotProduct(unitTangentVector, thingVelocityVector),
    //
    tangentVectorPlayerMagnitudeAfter = tangentVectorPlayerMagnitude,
    tangentVectorThingMagnitudeAfter = tangentVectorThingMagnitude,
    normalVectorPlayerMagnitudeAfter =
      (normalVectorPlayerMagnitude * (Player.radius - _thing.radius) + 2 * _thing.radius * normalVectorThingMagnitude) /
      (Player.radius + _thing.radius),
    normalVectorThingMagnitudeAfter =
      (normalVectorThingMagnitude * (_thing.radius - Player.radius) + 2 * Player.radius * normalVectorPlayerMagnitude) /
      (Player.radius + _thing.radius),
    normalVectorPlayerAfter = vectorScalarMultiply(unitNormalVector, normalVectorPlayerMagnitudeAfter),
    tangentVectorPlayerAfter = vectorScalarMultiply(unitTangentVector, tangentVectorPlayerMagnitudeAfter),
    normalVectorThingAfter = vectorScalarMultiply(unitNormalVector, normalVectorThingMagnitudeAfter),
    tangentVectorThingAfter = vectorScalarMultiply(unitTangentVector, tangentVectorThingMagnitudeAfter),
    playerVelocityVectorAfter = vectorAdd(normalVectorPlayerAfter, tangentVectorPlayerAfter),
    playerVectorMagnitudeAfter = vectorGetMagnitude(playerVelocityVectorAfter),
    playerUnitVectorAfter = {
      x: playerVelocityVectorAfter.x / playerVectorMagnitudeAfter,
      y: playerVelocityVectorAfter.y / playerVectorMagnitudeAfter,
    },
    thingVelocityVectorAfter = vectorAdd(normalVectorThingAfter, tangentVectorThingAfter),
    thingVectorMagnitudeAfter = vectorGetMagnitude(thingVelocityVectorAfter),
    thingUnitVectorAfter = {
      x: thingVelocityVectorAfter.x / thingVectorMagnitudeAfter,
      y: thingVelocityVectorAfter.y / thingVectorMagnitudeAfter,
    };

  // Reverse object position to help avoid overlapping clashes
  _thing.pos.x -= _thing.vector.x * _thing.speed;
  _thing.pos.y -= _thing.vector.y * _thing.speed;
  //
  _thing.vector = thingUnitVectorAfter;
  //_thing.speed += thingVectorMagnitudeAfter;
  _thing.speed = thingVectorMagnitudeAfter;

  //__("normalVector: " + JSON.stringify(normalVector)),
  //  __("normalVectorMagnitude: " + JSON.stringify(normalVectorMagnitude)),
  //  __("unitNormalVector: " + JSON.stringify(unitNormalVector)),
  //  __("unitTangentVector: " + JSON.stringify(unitTangentVector)),
  //  __(
  //    "playerVectorMagnitudeAfter: " +
  //      JSON.stringify(playerVectorMagnitudeAfter)
  //  );
  //__("playerUnitVectorAfter: " + JSON.stringify(playerUnitVectorAfter));
  //__(
  //  "thingVectorMagnitudeAfter: " +
  //    JSON.stringify(thingVectorMagnitudeAfter)
  //);
  //__("thingUnitVectorAfter: " + JSON.stringify(thingUnitVectorAfter));
  //__("_thing.vector: " + JSON.stringify(_thing.vector));
  //__("_thing.speed: " + JSON.stringify(_thing.speed));

  return vectorScalarMultiply(
    //  playerUnitVectorAfter,
    playerVelocityVectorAfter,
    playerVectorMagnitudeAfter,
  );
};

/**
 * @function bounceInRectangle
 * @static
 *
 * @description
 * ##### Bounce an thing off the walls of a rectangle
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
  if (hasBounced) {
    _thing.rotation = vectorToDegrees(_thing.vector);
  }
};

/**
 * @function addAllBackground
 * @static
 *
 * @description
 * ##### Add all the groups of background things
 * - Background things appear underneath everything else and don't interact with the player
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
 * @function addAllCollectAndAvoid
 * @static
 *
 * @description
 * ##### Add all the groups of collectable and avoidable things
 * - Both of these thing types are drawn in the same 'layer' between background and floating things
 * - Calls `addGroup()` for each group
 */
ThingManager.addAllCollectAndAvoid = function () {
  var i, curThingGroup;
  for (i = 0; i < Game.curLevelData.things.length; i++) {
    curThingGroup = Game.curLevelData.things[i];
    if (curThingGroup.type === THING_TYPE.COLLECT || curThingGroup.type === THING_TYPE.AVOID) {
      ThingManager.addGroup(curThingGroup);
    }
  }
};

// TODO Update comment
/**
 * @function explodeAllAvoids
 * @static
 *
 * @description
 * ##### Starts explosion animations for all avoidable objects
 * Used at the end of a completed level to wipe out the objects.
 */
ThingManager.explodeAllAvoids = function () {
  ThingManager.levelOutroExplodeNextWaitFrames = Math.floor(
    InternalTimer.secondsToFrames(TIMINGS.LEVELOUTRO_THING_EXPLOSIONS_TOTALTIME_MS / 1000) / Game.avoidTotal,
  );

  __("ThingManager.levelOutroExplodeNextWaitFrames: " + ThingManager.levelOutroExplodeNextWaitFrames);

  ThingManager.levelOutroExplodeNext();
};

// TODO Comment
ThingManager.levelOutroRemoveNextBackgroundThings = function (_numToRemove) {
  var i,
    thing,
    count = 0;

  for (i = ThingManager.things.length - 1; i >= 0; i--) {
    thing = ThingManager.things[i];
    if (thing.type === THING_TYPE.BACKGROUND) {
      ThingManager.things.splice(i, 1);
      count++;
      if (count === _numToRemove) {
        break;
      }
    }
  }
};

// TODO Comment
ThingManager.levelOutroExplodeNext = function () {
  var i, thing;

  if (Game.isInLevelOutro) {
    for (i = ThingManager.things.length - 1; i >= 0; i--) {
      thing = ThingManager.things[i];
      if (thing.type === THING_TYPE.AVOID && thing.explodingFramesCounter === 0) {
        thing.explodingFramesCounter = GAME.EXPLODING_FRAMES_TOTAL;
        break;
      }
    }

    ThingManager.levelOutroExplodeNextFrameCount = ThingManager.levelOutroExplodeNextWaitFrames;
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
    //t1,
    thing,
    totalThings = ThingManager.things.length;

  for (i = totalThings - 1; i >= 0; i--) {
    thing = ThingManager.things[i];

    //if (thing.type === THING_TYPE.BACKGROUND) {
    ThingManager.wrapAroundRectangle(thing, Layout.background_rect);
    //} else if (!thing.isDeleted) {

    //  if (thing.speed > thing.nativeSpeed) {
    //    thing.speed *= GAME.THING_RETURNTONORMALSPEED_RATE;
    //    if (thing.speed < thing.nativeSpeed) {
    //      thing.speed = thing.nativeSpeed;
    //    }
    //  }

    //  // At start of level things are placed outside the gameplay area so that they gradually enter
    //  // We don't want wrapping to happen during that time as it pops the things instantly into view
    //  if (thing.hasEnteredGameplayArea) {
    //    ThingManager.wrapAroundRectangle(thing, Layout.gameplay_rect);
    //  } else {
    //    if (pointIsInRect(thing.pos, Layout.gameplay_rect)) {
    //      thing.hasEnteredGameplayArea = true;
    //    }
    //  }
    //  ThingManager.bounceInRectangle(thing, Layout.gameplay_rect);
    //}

    if (!thing.isDeleted) {
      thing.pos.x += thing.vector.x * thing.speed * _frames;
      thing.pos.y += thing.vector.y * thing.speed * _frames;

      if (thing.rotationSpeed !== undefined) {
        thing.rotation += thing.rotationSpeed;
        // Use real modulo function (in JS, `%` is 'remainder', not true
        // modulo, meaning it doesn't handle negative values in the way we
        // need) to wrap rotation and keep it between 0-360
        thing.rotation = modulo(thing.rotation, 360);
      }
    }
  }
};

export { ThingManager };
