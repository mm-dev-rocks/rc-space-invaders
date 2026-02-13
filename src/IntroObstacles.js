/**
 * @license GPL-3.0-only
 *
 * @author Mark Mayes / mm-dev
 *
 *
 * @module IntroObstacles
 *
 * @description
 * ## Draw special versions of obstacles used in level introductions
 */

import { RCSI } from "./RCSI/CONST.js";
import { OBSTACLE_TYPE } from "./RCSI/ENUM.js";
import * as GAME from "./RCSI/GAME.js";

import { Display } from "./Display.js";
import { Game } from "./Game.js";
import { Layout } from "./Layout.js";
import { Text } from "./Text.js";

import { __ } from "./utils.js";

class IntroObstacles {}

/**
 * @function setupForLevel
 * @static
 *
 * @description
 * ##### Reset some variables
 */
IntroObstacles.setupForLevel = function () {
  __("IntroObstacles.setupForLevel()", RCSI.FMT_DISPLAY);
  IntroObstacles.textHasBeenPadded = false;
};

/**
 * @function updateSizes
 * @static
 *
 * @description
 * ##### Keep sizes correct in relation to the viewport
 */
IntroObstacles.updateSizes = function () {
  __("IntroObstacles.updateSizes()", RCSI.FMT_DISPLAY);
  IntroObstacles.itemRadius = Math.round(
    Text.drawnCharHeight
  );
  //IntroObstacles.itemRadius = Math.round(
  //  GAME.LEVEL_INTRO_CIRCLE_RADIUS_PX * Layout.proportionalMultiplier
  //);
};

/**
 * @function drawGroup
 * @static 
 *
 * @description
 * ##### Draw a group of static obstacles for the level intro screen, eg 'all the avoid obstacles for level 2'
 *
 * @param {object} _data
 * @param {number} _data.startX - X coordinate of where to start drawing the group
 * @param {number} _data.startY - Y coordinate of where to start drawing the group
 * @param {object[]} _data.obstacle_ar - A specially formulated array (created by `IntroObstacles.getDataArrayForType()` of objects containing info on how to draw the special versions of the obstacles

 */
IntroObstacles.drawGroup = function (_data) {
  var i,
    obstacle,
    x = 0,
    y = 0,
    stepX = IntroObstacles.itemRadius,
    stepY = IntroObstacles.itemRadius,
    rows = Math.floor(
      _data.obstacle_ar.length / GAME.INTRO_OBSTACLE_GROUP_COLS
    );

  // Offset `y` so group of obstacles is vertically centred
  y -= (rows / 2) * stepY;

  for (i = 0; i < _data.obstacle_ar.length; i++) {
    obstacle = _data.obstacle_ar[i];
    if (i > 0 && i % GAME.INTRO_OBSTACLE_GROUP_COLS == 0) {
      y += stepY;
      x = 0;
    }

    obstacle.type = OBSTACLE_TYPE.LEVELINTRO;
    obstacle.pos = {
      x: Math.round(_data.startX + x),
      y: Math.round(_data.startY + y),
    };

    Display.drawObstacle(obstacle);

    x += stepX;
  }
};

/**
 * @function getGroupWidth
 * @static
 *
 * @description
 * ##### Calculate the width of a group of intro obstacles to help with layout
 *
 * @param {object} _data
 * @param {object[]} _data.obstacle_ar - A specially formulated array (created by `IntroObstacles.getDataArrayForType()` of objects containing info on how to draw the special versions of the obstacles
 *
 * @returns {number} The width of the group in pixels
 */
IntroObstacles.getGroupWidth = function (_data) {
  var i,
    w = 0;

  for (i = 0; i < _data.obstacle_ar.length; i++) {
    if (i > 0 && i % GAME.INTRO_OBSTACLE_GROUP_COLS == 0) {
      break;
    }
    w += IntroObstacles.itemRadius;
  }
  return Math.round(w + IntroObstacles.itemRadius * 3);
};

/**
 * @function getDataArrayForType
 * @static
 *
 * @description
 * ##### Get an array of objects describing the intro obstacles of a certain type for the current level
 *
 * @param {OBSTACLE_TYPE} _type - The type of obstacles from this level we want to draw
 *
 * @returns {object[]} An array of objects, each describing a special version of an obstacle configured for the level intro screen
 */
IntroObstacles.getDataArrayForType = function (_type) {
  var i,
    totalColorVariations,
    obstacleGroupData,
    obstacle_ar = [];

  for (i = 0; i < Game.curLevelData.obstacles.length; i++) {
    obstacleGroupData = Game.curLevelData.obstacles[i];
    if (obstacleGroupData.type === _type) {
      totalColorVariations = obstacleGroupData.color_ar?.length || 1;
      for (j = 0; j < totalColorVariations; j++) {
        obstacle_ar.push({
          subtype: obstacleGroupData.subtype,
          color: obstacleGroupData.color_ar?.[j],
          gradient: obstacleGroupData.gradient,
          gradientFadePoint: obstacleGroupData.gradientFadePoint,
          radius: IntroObstacles.itemRadius,
          rotation: GAME.INTRO_OBSTACLE_DEFAULT_ROTATION,
          shapeCenterColor: obstacleGroupData.shapeCenterColor_ar?.[0],
          numAppendages: obstacleGroupData.numAppendagesRange?.[1],
          shapeCenterRadiusDivisor: obstacleGroupData.shapeCenterRadiusDivisor,
          useDefaultStroke: obstacleGroupData.useDefaultStroke,
          addedLayer_ar: obstacleGroupData.addedLayer_ar,
        });
      }
    }
  }

  return IntroObstacles.dedupDataArray(obstacle_ar);
};

IntroObstacles.dedupDataArray = function (_ar) {
  var i,
    j,
    ob1,
    ob2,
    matchCount,
    return_ar = [..._ar];

  for (i = 0; i < return_ar.length; i++) {
    ob1 = return_ar[i];
    matchCount = 0;

    for (j = 0; j < _ar.length; j++) {
      ob2 = _ar[j];
      if (
        // TODO horrible way to deep-compare objects
        //JSON.parse(JSON.stringify(ob1)) === JSON.parse(JSON.stringify(ob2))
        ob1.color === ob2.color &&
        ob1.gradient === ob2.gradient &&
        ob1.squarcle === ob2.squarcle &&
        ob1.squarcle?.color === ob2.squarcle?.color &&
        //ob1.squarcle?.radius === ob2.squarcle?.radius &&
        ob1.star?.color === ob2.star?.color &&
        //ob1.star?.radius === ob2.star?.radius &&
        ob1.star?.numAppendages === ob2.star?.numAppendages &&
        //ob1.star?.shapeCenterRadiusDivisor ===
        //  ob2.star?.shapeCenterRadiusDivisor &&
        ob1.flower?.color === ob2.flower?.color
			//	&&
        //ob1.flower?.radius === ob2.flower?.radius &&
       // ob1.flower?.numAppendages === ob2.flower?.numAppendages
			//	&&
        //ob1.flower?.shapeCenterRadiusDivisor ===
        //  ob2.flower?.shapeCenterRadiusDivisor &&
        //ob1.flower?.shapeCenterColor === ob2.flower?.shapeCenterColor
      ) {
        matchCount++;
      }
    }
    if (matchCount > 1) {
      return_ar.splice(i, 1);
    }
  }
  return return_ar;
};

export { IntroObstacles };
