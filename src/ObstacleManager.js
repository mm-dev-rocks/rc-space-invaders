/**
 * @license GPL-3.0-only
 *
 * @author Mark Mayes / mm-dev
 *
 *
 * @module ObstacleManager
 *
 * @description
 * ## Handles obstacle-related jobs
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
import { OBSTACLE_SUBTYPE, OBSTACLE_TYPE } from "./RCSI/ENUM.js";
import * as GAME from "./RCSI/GAME.js";
import * as TIMINGS from "./RCSI/TIMINGS.js";

import { Player } from "./Player.js";
import { Game } from "./Game.js";
import { InternalTimer } from "./InternalTimer.js";
import { Layout } from "./Layout.js";

class ObstacleManager {
  /** @type {Array} */ static obstacles;
}

/**
 * @function reset
 * @static
 *
 * @description
 * ##### Wipes all obstacles and related data, to be used before starting a new level
 */
ObstacleManager.reset = function () {
  ObstacleManager.deleteObstacles();
};

/**
 * @function deleteObstacles
 * @static
 *
 * @description
 * ##### Empty the obstacles array so that old obstacles can be garbage collected
 */
ObstacleManager.deleteObstacles = function () {
  ObstacleManager.obstacles = [];
};

/**
 * @function addGroupToRadiusRanges
 * @static
 *
 * @description
 * ##### Check the range of radii for a group of obstacles
 * Over the entire game we want to know what the smallest and highest radii of obstacles is. This info is then used to decide which sound effects to add to an obstacle:
 * - Smallest obstacles will have the highest-pitch version of SFX
 * - Largest obstacles will have the lowest-pitch version of SFX
 *
 * @param {object} _data - An object describing a group of obstacles, originating from a `LEVEL_DATA/*.js` file
 */
ObstacleManager.addGroupToRadiusRanges = function (_data) {
  if (!ObstacleManager.radiusMin || _data.radiusRange[0] < ObstacleManager.radiusMin) {
    ObstacleManager.radiusMin = _data.radiusRange[0];
  }
  if (!ObstacleManager.radiusMax || _data.radiusRange[1] > ObstacleManager.radiusMax) {
    ObstacleManager.radiusMax = _data.radiusRange[1];
  }
  __("ObstacleManager.radiusMin: " + ObstacleManager.radiusMin);
  __("ObstacleManager.radiusMax: " + ObstacleManager.radiusMax);
};

/**
 * @function addGroup
 * @static
 *
 * @description
 * ##### Add a group of obstacles to the game
 * Loops through the group, calling `spawn()` repeatedly until `_data.total` obstacles of this group type have been added.
 *
 * @param {object} _data - An object describing a group of obstacles, originating from a `LEVEL_DATA/*.js` file
 */
ObstacleManager.addGroup = function (_data) {
  __("ObstacleManager.addGroup()::");
  __("\t_data.total: " + _data.total);
  var i;
  ObstacleManager.surfaceAreaOfGroup = 0;
  for (i = 0; i < _data.total; i++) {
    ObstacleManager.spawn(_data);
  }
  __(
    "ObstacleManager.surfaceAreaOfGroup: " +
      Math.round(ObstacleManager.surfaceAreaOfGroup).toLocaleString() +
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
 * ##### Get a random vector for an obstacle, based on its allowable range of movement as described in its group data
 *
 * @param {number} _degreesMin - Smallest possible angle of direction in degrees
 * @param {number} _degreesMax - Largest possible angle of direction in degrees
 *
 * @return {object} A normalised vector
 */
ObstacleManager.getRandomVector = function (_degreesMin, _degreesMax) {
  _degreesMin += 90;
  _degreesMax += 90;

  return degreesToVector(randomIntBetween(_degreesMin, _degreesMax));
};

/**
 * @function getSoundIDFromRadius
 * @static
 *
 * @description
 * ##### Choose sound based on size of obstacle
 *
 * @param {number} _r - Obstacle radius
 * @param {array} _orderedSfx_ar - An array of IDs for sounds which may represent this obstacle. The sounds will all be the same SFX, each processed to a different pitch. They should be ordered in descending pitch order.
 *
 * @return {string} A sound ID
 */
ObstacleManager.getSoundIDFromRadius = function (_r, _orderedSfx_ar) {
  var soundID,
    radiusRange = ObstacleManager.radiusMax - ObstacleManager.radiusMin,
    radiusGroupSize = radiusRange / _orderedSfx_ar.length,
    sfxPositionInRange = Math.floor((_r - ObstacleManager.radiusMin) / radiusGroupSize);

  if (isNaN(sfxPositionInRange)) {
    sfxPositionInRange = 0;
  }

  soundID = _orderedSfx_ar[sfxPositionInRange];
  //__('ObstacleManager.radiusMax: ' + ObstacleManager.radiusMax);
  //__('ObstacleManager.radiusMin: ' + ObstacleManager.radiusMin);
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
 * ##### Creates an individual obstacle object and adds it to `ObstacleManager.obstacles` array
 * Sets various properties depending on the type of obstacle.
 *
 * @param {object} _data - An object describing a group of obstacles, originating from a `LEVEL_DATA/*.js` file
 */
ObstacleManager.spawn = function (_data) {
  var x,
    y,
    bounds_rect,
    obstacle = {
      type: _data.type,
      subtype: _data.subtype,
      color: Array.isArray(_data.color_ar) ? getRandomItemFromArray(_data.color_ar) : undefined,
      nativeSpeed: Math.max(
        //speed: Math.max(
        randomFloatBetween(_data.speedRange[0], _data.speedRange[1]) / GAME.PIXEL_SCALE,
        GAME.STATIC_OBSTACLE_SPEED,
      ),
      vector: ObstacleManager.getRandomVector(_data.directionRange[0], _data.directionRange[1]),
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

  obstacle.speed = obstacle.nativeSpeed;

  if (_data.type === OBSTACLE_TYPE.BACKGROUND) {
    bounds_rect = Layout.background_rect;
  } else if (_data.type === OBSTACLE_TYPE.FLOATING) {
    bounds_rect = Layout.floating_rect;
  } else {
    bounds_rect = Layout.gameplay_rect;
  }

  if (_data.type === OBSTACLE_TYPE.BACKGROUND || _data.type === OBSTACLE_TYPE.FLOATING) {
    // BACKGROUND / FLOATING
    x = randomFloatBetween(bounds_rect.left + obstacle.radius, bounds_rect.right - obstacle.radius);
    y = randomFloatBetween(bounds_rect.top + obstacle.radius, bounds_rect.bottom - obstacle.radius);
  } else {
    // AVOID / COLLECT
    x = randomFloatBetween(bounds_rect.left + obstacle.radius, bounds_rect.right - obstacle.radius);
    y = randomFloatBetween(bounds_rect.bottom + obstacle.radius * 2, bounds_rect.bottom * 2 + obstacle.radius * 2);

    if (_data.type === OBSTACLE_TYPE.AVOID) {
      // AVOIDABLE
      obstacle.damageSafetyCounter = 0;
    } else if (_data.type === OBSTACLE_TYPE.COLLECT) {
      //if (_data.type === OBSTACLE_TYPE.COLLECT) {
      // COLLECTABLE
      obstacle.soundID = ObstacleManager.getSoundIDFromRadius(obstacle.radius, _data.collectSfx_ar);
    }

    if (obstacle.color) {
      obstacle.explodingColor = hexOpacityToRGBA(obstacle.color, GAME.EXPLODING_OBSTACLE_ALPHA);
    }

    obstacle.explodeFrameAngleIncrease = randomFloatBetween(
      GAME.EXPLODING_FRAMES_ANGLE_INCREASE_MIN,
      GAME.EXPLODING_FRAMES_ANGLE_INCREASE_MAX,
    );
    obstacle.explodeFrameAngleIncrease *= -1;

    obstacle.explodingFramesReduceSpeedMultiplier = randomFloatBetween(
      GAME.EXPLODING_FRAMES_REDUCE_SPEED_MULTIPLIER_MIN,
      GAME.EXPLODING_FRAMES_REDUCE_SPEED_MULTIPLIER_MAX,
    );

    obstacle.explodingFramesReduceRadiusMultiplier = randomFloatBetween(
      GAME.EXPLODING_FRAMES_REDUCE_RADIUS_MULTIPLIER_MIN,
      GAME.EXPLODING_FRAMES_REDUCE_RADIUS_MULTIPLIER_MAX,
    );
  }

  // Ensure this happens afer stuff like `getSoundIDFromRadius()`
  obstacle.radius *= Layout.proportionalMultiplier;

  // Rotation
  obstacle.rotation = vectorToDegrees(obstacle.vector);
  if (Array.isArray(_data.rotationSpeedRange)) {
    obstacle.rotationSpeed = randomFloatBetween(_data.rotationSpeedRange[0], _data.rotationSpeedRange[1]);
    if (Math.random() < 0.5) {
      obstacle.rotationSpeed *= -1;
    }
  }

  // Special shapes
  if (_data.subtype === OBSTACLE_SUBTYPE.FLOWER || _data.subtype === OBSTACLE_SUBTYPE.STAR) {
    obstacle.numAppendages = randomIntBetween(_data.numAppendagesRange[0], _data.numAppendagesRange[1]);
    obstacle.shapeCenterRadiusDivisor = _data.shapeCenterRadiusDivisor;
    if (obstacle.rotationSpeed !== undefined) {
      // rotation value is used in the `Display.draw*()` drawing of
      // appendages (eg, flower petals,points of a star), rotating the appendages makes the shape appear to rotate, but
      // too fast, hence the following division
      obstacle.rotationSpeed /= obstacle.numAppendages;
    }
  }

  if (Array.isArray(_data.shapeCenterColor_ar)) {
    obstacle.shapeCenterColor = getRandomItemFromArray(_data.shapeCenterColor_ar);
  }

  obstacle.pos = { x: x, y: y };

  ObstacleManager.obstacles.push(obstacle);
};

/**
 * @function increaseVectorAngle
 * @static
 *
 * @description
 * ##### Adjust an obstacle's vector to incrementally spin the obstacle
 * Directly adjusts the vector property of the object.
 *
 * @param {object} _obstacle
 * @param {number} _inc - A negative or positive number, in degrees, by which to adjust the vector
 */
ObstacleManager.increaseVectorAngle = function (_obstacle, _inc) {
  var degrees = vectorToDegrees(_obstacle.vector) + _inc;
  _obstacle.vector = degreesToVector(degrees);
};

/**
 * @function incrementExplosionAnimation
 * @static
 *
 * @description
 * ##### Process the next frame of the obstacle explosion animation
 * At the end of the animation, mark the obstacle as deleted.
 *
 * @param {object} _obstacle
 */
ObstacleManager.incrementExplosionAnimation = function (_obstacle) {
  ObstacleManager.increaseVectorAngle(_obstacle, _obstacle.explodeFrameAngleIncrease);
  _obstacle.radius *= _obstacle.explodingFramesReduceRadiusMultiplier;
  _obstacle.speed *= _obstacle.explodingFramesReduceSpeedMultiplier;
  if (_obstacle.explodingFramesCounter < 1) {
    _obstacle.isDeleted = true;
  }
};

/**
 * @function wrapAroundRectangle
 * @static
 *
 * @description
 * ##### Wrap an obstacle at the boundaries of a rectangle
 * Behaviour varies based on obstacle type.
 *
 * @param {object} _obstacle
 * @param {object} _rect - A rectangle with top, right, bottom, left properties
 */
ObstacleManager.wrapAroundRectangle = function (_obstacle, _rect) {
  var hasWrapped,
    diameter = _obstacle.radius * 2,
    // floating/bg obstacles always wrap in both portrait and landscape
    wrapBothAspects = _obstacle.type === OBSTACLE_TYPE.BACKGROUND || _obstacle.type === OBSTACLE_TYPE.FLOATING,
    // Avoidable objects might cross boundaries while travelling in the wrong direction, but we still need them to wrap
    ignoreDirectionOfTravel = _obstacle.type === OBSTACLE_TYPE.AVOID;

  wrapWidth = _rect.right - _rect.left + diameter * 2;
  wrapHeight = _rect.bottom - _rect.top + diameter * 2;

  // Handle left/right edges
  if (wrapBothAspects) {
    if (_obstacle.pos.x + diameter < _rect.left && (_obstacle.vector.x < 0 || ignoreDirectionOfTravel)) {
      _obstacle.pos.x += wrapWidth;
      hasWrapped = true;
    } else if (_obstacle.pos.x - diameter > _rect.right && (_obstacle.vector.x > 0 || ignoreDirectionOfTravel)) {
      _obstacle.pos.x -= wrapWidth;
      hasWrapped = true;
    }
  }

  // Handle top/bottom edges
  if (_obstacle.pos.y + diameter < _rect.top && (_obstacle.vector.y < 0 || ignoreDirectionOfTravel)) {
    _obstacle.pos.y += wrapHeight;
    hasWrapped = true;
  } else if (_obstacle.pos.y - diameter > _rect.bottom && (_obstacle.vector.y > 0 || ignoreDirectionOfTravel)) {
    _obstacle.pos.y -= wrapHeight;
    hasWrapped = true;
  }

  if (hasWrapped) {
    // if mid-explosion when wrap happens, cancel explosion
    if (_obstacle.explodingFramesCounter > 0) {
      _obstacle.isDeleted = true;
    }
    _obstacle.rotation = vectorToDegrees(_obstacle.vector);
  }
};

// TODO This comment needs a lot of work
/**
 * @function bounceOffPlayer
 * @static
 *
 * @description
 * ##### Calculate effects of a collision between the player and an obstacle
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
 * (Player.radius * Player.speed) + (_obstacle.radius * Obstacle.speed)
 * =
 * (Player.radius * Player.speedAfter) + (_obstacle.radius * Obstacle.speedAfter)
 * ```
 *
 * ###### Conservation of kinetic energy
 *
 * Kinetic energy of an object is half its mass times the square of its velocity:
 *   `ke = (0.5 * m) * (v * v)`
 *
 * ```
 * ((0.5 * Player.radius) * (Player.speed * Player.speed)) + ((0.5 * _obstacle.radius) * (Obstacle.speed * Obstacle.speed))
 * =
 * ((0.5 * Player.radius) * (Player.speedAfter * Player.speedAfter)) + ((0.5 * _obstacle.radius) * (Obstacle.speedAfter * Obstacle.speedAfter))
 * ```
 *
 * So after collision:
 * ```
 * Player.speedAfter = (Player.speed * (Player.radius - _obstacle.radius)) + (2 * _obstacle.radius * Obstacle.speed) / (Player.radius + _obstacle.radius)
 * Obstacle.speedAfter = (Obstacle.speed * (_obstacle.radius - Player.radius)) + (2 * Player.radius * Player.speed) / (Player.radius + _obstacle.radius)
 * ```
 *
 * Project the **velocity vectors** of the 2 objects (player and obstacle) onto the vectors which are **normal** (perpendicular) and **tangent** to the surface of the collision.
 *
 * So for each velocity (player and obstacle) we have 2 components:
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
 * `normalVector = { x: _obstacle.pos.x - Player.pos.x, y: _obstacle.pos.y - Player.pos.y };`
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
 * 2. Create the initial (before the collision) velocity vectors **ALREADY DONE** (Player/obstacle vectors)
 *
 *
 * 3. After the collision:
 * - The tangential component of the velocities is unchanged
 * - The normal component of the velocities can be found using the 1D collision formulas above
 *
 * So for the player and obstacle velocity vectors we need to resolve them into normal and tangential components. To do this, project the velocity vectors  onto the unit normal and unit tangent vectors by computing the dot product.
 *
 * ```
 * normalVectorPlayerMagnitude = vectorGetDotProduct(unitNormalVector, Player.velocityVector);
 * tangentVectorPlayerMagnitude = vectorGetDotProduct(unitTangentVector, Player.velocityVector);
 *
 * normalVectorObstacleMagnitude = vectorGetDotProduct(unitNormalVector, _obstacle.velocityVector);
 * tangentVectorObstacleMagnitude = vectorGetDotProduct(unitTangentVector, _obstacle.velocityVector);
 * ```
 *
 *
 * 4. Find new (after collision) tangential velocities, which are simply equal to the old ones:
 * ```
 * tangentVectorPlayerMagnitudeAfter = tangentVectorPlayerMagnitude;
 * tangentVectorObstacleMagnitudeAfter = tangentVectorObstacleMagnitude;
 * ```
 *
 * 5. Find the new normal velocities using the 1D collision formulas from earlier
 * ```
 * normalVectorPlayerMagnitudeAfter =
 *   ((normalVectorPlayerMagnitude * (Player.radius - _obstacle.radius)) +
 *   (2 * _obstacle.radius * normalVectorObstacleMagnitude)) /
 *   (Player.radius + _obstacle.radius)
 *
 * normalVectorObstacleMagnitudeAfter =
 *   ((normalVectorObstacleMagnitude * (_obstacle.radius - Player.radius)) +
 *   (2 * Player.radius * normalVectorPlayerMagnitude)) /
 *   (Player.radius + _obstacle.radius)
 * ```
 *
 * 6. Convert the scalar normal and tangential velocities into vectors:
 * - Multiply the unit normal vector by the scalar normal velocity (magnitude) to get a vector which is normal to the surfaces at the point of collision with a magnitude equal to the normal component of the velocity.
 * - Multiply the unit tangential vector by the scalar tangential velocity (magnitude) to get a vector which is tangential to the surfaces at the point of collision with a magnitude equal to the tangential component of the velocity.
 *
 * ```
 * normalVectorPlayerAfter = vectorScalarMultiply(unitNormalVector, normalVectorPlayerMagnitudeAfter);
 * tangentVectorPlayerAfter = vectorScalarMultiply(unitTangentVector, tangentVectorPlayerMagnitudeAfter);
 * normalVectorObstacleAfter = vectorScalarMultiply(unitNormalVector, normalVectorObstacleMagnitudeAfter);
 * tangentVectorObstacleAfter = vectorScalarMultiply(unitTangentVector, tangentVectorObstacleMagnitudeAfter);
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
 * obstacleVelocityVectorAfter = vectorAdd(normalVectorObstacleAfter, tangentVectorObstacleAfter);
 * obstacleVectorMagnitudeAfter = vectorGetMagnitude(obstacleVelocityVectorAfter);
 * obstacleUnitVectorAfter = {
 *   x: obstacleVelocityVectorAfter.x / obstacleVectorMagnitudeAfter,
 *   y: obstacleVelocityVectorAfter.y / obstacleVectorMagnitudeAfter,
 * };
 * ```
 *
 * These are velocity vectors (including magnitude) so need to be broken down into unit vectors and magnitude for use on the player and obstacle
 *
 *
 * @param {object} _obstacle - The collided-with obstacle
 *
 * @returns {object} A vector which is used to move the control stick and give the effect of the player being knocked
 */
ObstacleManager.bounceOffPlayer = function (_obstacle) {
  var normalVector = {
      x: _obstacle.pos.x - Player.pos.x,
      y: _obstacle.pos.y - Player.pos.y,
    },
    normalVectorMagnitude = vectorGetMagnitude(normalVector),
    unitNormalVector = vectorScalarMultiply(normalVector, 1 / normalVectorMagnitude),
    //
    unitTangentVector = {
      x: -1 * unitNormalVector.y,
      y: unitNormalVector.x,
    },
    obstacleVelocityVector = vectorScalarMultiply(_obstacle.vector, _obstacle.speed),
    normalVectorPlayerMagnitude = vectorGetDotProduct(unitNormalVector, Player.velocityVector),
    tangentVectorPlayerMagnitude = vectorGetDotProduct(unitTangentVector, Player.velocityVector),
    normalVectorObstacleMagnitude = vectorGetDotProduct(unitNormalVector, obstacleVelocityVector),
    tangentVectorObstacleMagnitude = vectorGetDotProduct(unitTangentVector, obstacleVelocityVector),
    //
    tangentVectorPlayerMagnitudeAfter = tangentVectorPlayerMagnitude,
    tangentVectorObstacleMagnitudeAfter = tangentVectorObstacleMagnitude,
    normalVectorPlayerMagnitudeAfter =
      (normalVectorPlayerMagnitude * (Player.radius - _obstacle.radius) +
        2 * _obstacle.radius * normalVectorObstacleMagnitude) /
      (Player.radius + _obstacle.radius),
    normalVectorObstacleMagnitudeAfter =
      (normalVectorObstacleMagnitude * (_obstacle.radius - Player.radius) +
        2 * Player.radius * normalVectorPlayerMagnitude) /
      (Player.radius + _obstacle.radius),
    normalVectorPlayerAfter = vectorScalarMultiply(unitNormalVector, normalVectorPlayerMagnitudeAfter),
    tangentVectorPlayerAfter = vectorScalarMultiply(unitTangentVector, tangentVectorPlayerMagnitudeAfter),
    normalVectorObstacleAfter = vectorScalarMultiply(unitNormalVector, normalVectorObstacleMagnitudeAfter),
    tangentVectorObstacleAfter = vectorScalarMultiply(unitTangentVector, tangentVectorObstacleMagnitudeAfter),
    playerVelocityVectorAfter = vectorAdd(normalVectorPlayerAfter, tangentVectorPlayerAfter),
    playerVectorMagnitudeAfter = vectorGetMagnitude(playerVelocityVectorAfter),
    playerUnitVectorAfter = {
      x: playerVelocityVectorAfter.x / playerVectorMagnitudeAfter,
      y: playerVelocityVectorAfter.y / playerVectorMagnitudeAfter,
    },
    obstacleVelocityVectorAfter = vectorAdd(normalVectorObstacleAfter, tangentVectorObstacleAfter),
    obstacleVectorMagnitudeAfter = vectorGetMagnitude(obstacleVelocityVectorAfter),
    obstacleUnitVectorAfter = {
      x: obstacleVelocityVectorAfter.x / obstacleVectorMagnitudeAfter,
      y: obstacleVelocityVectorAfter.y / obstacleVectorMagnitudeAfter,
    };

  // Reverse object position to help avoid overlapping clashes
  _obstacle.pos.x -= _obstacle.vector.x * _obstacle.speed;
  _obstacle.pos.y -= _obstacle.vector.y * _obstacle.speed;
  //
  _obstacle.vector = obstacleUnitVectorAfter;
  //_obstacle.speed += obstacleVectorMagnitudeAfter;
  _obstacle.speed = obstacleVectorMagnitudeAfter;

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
  //  "obstacleVectorMagnitudeAfter: " +
  //    JSON.stringify(obstacleVectorMagnitudeAfter)
  //);
  //__("obstacleUnitVectorAfter: " + JSON.stringify(obstacleUnitVectorAfter));
  //__("_obstacle.vector: " + JSON.stringify(_obstacle.vector));
  //__("_obstacle.speed: " + JSON.stringify(_obstacle.speed));

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
 * ##### Bounce an obstacle off the walls of a rectangle
 *
 * @param {object} _obstacle
 * @param {object} _rect - A rectangle with top, right, bottom, left properties
 */
ObstacleManager.bounceInRectangle = function (_obstacle, _rect) {
  var hasBounced = false;

  if (_obstacle.pos.x < _rect.left + _obstacle.radius) {
    _obstacle.vector.x *= -1;
    _obstacle.pos.x = _rect.left + _obstacle.radius;
    hasBounced = true;
  } else if (_obstacle.pos.x > _rect.right - _obstacle.radius) {
    _obstacle.vector.x *= -1;
    _obstacle.pos.x = _rect.right - _obstacle.radius;
    hasBounced = true;
  }
  if (hasBounced) {
    _obstacle.rotation = vectorToDegrees(_obstacle.vector);
  }
};

/**
 * @function addAllBackground
 * @static
 *
 * @description
 * ##### Add all the groups of background obstacles
 * - Background obstacles appear underneath everything else and don't interact with the player
 * - Calls `addGroup()` for each group
 */
ObstacleManager.addAllBackground = function () {
  var i;
  for (i = 0; i < Game.curLevelData.obstacles.length; i++) {
    if (Game.curLevelData.obstacles[i].type === OBSTACLE_TYPE.BACKGROUND) {
      ObstacleManager.addGroup(Game.curLevelData.obstacles[i]);
    }
  }
};

/**
 * @function addAllFloating
 * @static
 *
 * @description
 * ##### Add all the groups of floating obstacles
 * - Floating obstacles appear above everything else and don't interact with the player
 * - Calls `addGroup()` for each group
 */
ObstacleManager.addAllFloating = function () {
  var i;
  for (i = 0; i < Game.curLevelData.obstacles.length; i++) {
    if (Game.curLevelData.obstacles[i].type === OBSTACLE_TYPE.FLOATING) {
      ObstacleManager.addGroup(Game.curLevelData.obstacles[i]);
    }
  }
};

/**
 * @function addAllCollectAndAvoid
 * @static
 *
 * @description
 * ##### Add all the groups of collectable and avoidable obstacles
 * - Both of these obstacle types are drawn in the same 'layer' between background and floating obstacles
 * - Calls `addGroup()` for each group
 */
ObstacleManager.addAllCollectAndAvoid = function () {
  var i, curObstacleGroup;
  for (i = 0; i < Game.curLevelData.obstacles.length; i++) {
    curObstacleGroup = Game.curLevelData.obstacles[i];
    if (curObstacleGroup.type === OBSTACLE_TYPE.COLLECT || curObstacleGroup.type === OBSTACLE_TYPE.AVOID) {
      ObstacleManager.addGroup(curObstacleGroup);
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
ObstacleManager.explodeAllAvoids = function () {
  ObstacleManager.levelOutroExplodeNextWaitFrames = Math.floor(
    InternalTimer.secondsToFrames(TIMINGS.LEVELOUTRO_OBSTACLE_EXPLOSIONS_TOTALTIME_MS / 1000) / Game.avoidTotal,
  );

  __("ObstacleManager.levelOutroExplodeNextWaitFrames: " + ObstacleManager.levelOutroExplodeNextWaitFrames);

  ObstacleManager.levelOutroExplodeNext();
};

// TODO Comment
ObstacleManager.levelOutroRemoveNextBackgroundObstacles = function (_numToRemove) {
  var i,
    obstacle,
    count = 0;

  for (i = ObstacleManager.obstacles.length - 1; i >= 0; i--) {
    obstacle = ObstacleManager.obstacles[i];
    if (obstacle.type === OBSTACLE_TYPE.BACKGROUND) {
      ObstacleManager.obstacles.splice(i, 1);
      count++;
      if (count === _numToRemove) {
        break;
      }
    }
  }
};

// TODO Comment
ObstacleManager.levelOutroExplodeNext = function () {
  var i, obstacle;

  if (Game.isInLevelOutro) {
    for (i = ObstacleManager.obstacles.length - 1; i >= 0; i--) {
      obstacle = ObstacleManager.obstacles[i];
      if (obstacle.type === OBSTACLE_TYPE.AVOID && obstacle.explodingFramesCounter === 0) {
        obstacle.explodingFramesCounter = GAME.EXPLODING_FRAMES_TOTAL;
        break;
      }
    }

    ObstacleManager.levelOutroExplodeNextFrameCount = ObstacleManager.levelOutroExplodeNextWaitFrames;
  }
};

/**
 * @function update
 * @static
 *
 * @description
 * ##### Loop through all obstacles, updating their positions and other properties
 *
 * @param {number} _frames - Number of frames passed since last update, in case the engine isn't keeping up with our desired frame rate and we need perform multiple operations to keep things as smooth/consistent as possible
 */
ObstacleManager.update = function (_frames) {
  var i,
    //t1,
    obstacle,
    totalObstacles = ObstacleManager.obstacles.length;

  for (i = totalObstacles - 1; i >= 0; i--) {
    obstacle = ObstacleManager.obstacles[i];

    //if (obstacle.type === OBSTACLE_TYPE.BACKGROUND) {
    ObstacleManager.wrapAroundRectangle(obstacle, Layout.background_rect);
    //} else if (!obstacle.isDeleted) {

    //  if (obstacle.speed > obstacle.nativeSpeed) {
    //    obstacle.speed *= GAME.OBSTACLE_RETURNTONORMALSPEED_RATE;
    //    if (obstacle.speed < obstacle.nativeSpeed) {
    //      obstacle.speed = obstacle.nativeSpeed;
    //    }
    //  }

    //  // At start of level obstacles are placed outside the gameplay area so that they gradually enter
    //  // We don't want wrapping to happen during that time as it pops the obstacles instantly into view
    //  if (obstacle.hasEnteredGameplayArea) {
    //    ObstacleManager.wrapAroundRectangle(obstacle, Layout.gameplay_rect);
    //  } else {
    //    if (pointIsInRect(obstacle.pos, Layout.gameplay_rect)) {
    //      obstacle.hasEnteredGameplayArea = true;
    //    }
    //  }
    //  ObstacleManager.bounceInRectangle(obstacle, Layout.gameplay_rect);
    //}

    if (!obstacle.isDeleted) {
      obstacle.pos.x += obstacle.vector.x * obstacle.speed * _frames;
      obstacle.pos.y += obstacle.vector.y * obstacle.speed * _frames;

      if (obstacle.rotationSpeed !== undefined) {
        obstacle.rotation += obstacle.rotationSpeed;
        // Use real modulo function (in JS, `%` is 'remainder', not true
        // modulo, meaning it doesn't handle negative values in the way we
        // need) to wrap rotation and keep it between 0-360
        obstacle.rotation = modulo(obstacle.rotation, 360);
      }
    }
  }
};

export { ObstacleManager };
