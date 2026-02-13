/**
 * @license GPL-3.0-only
 *
 * @author Mark Mayes / mm-dev
 *
 *
 * @module LevelTransition
 *
 * @description
 * ## Manage the transition between levels
 */

import { LEVEL_TRANSITION_PROPERTY_TYPE } from "./RCSI/ENUM.js";
import * as GAME from "./RCSI/GAME.js";
import * as TIMINGS from "./RCSI/TIMINGS.js";

import { Controller } from "./Controller.js";
import { Display } from "./Display.js";
import { Game } from "./Game.js";
import { InternalTimer } from "./InternalTimer.js";
import { ObstacleManager } from "./ObstacleManager.js";
import { Player } from "./Player.js";

import {
  __,
  addFadeStepToRGB,
  getFadeStepBetweenRGBColorsArray,
  hexOpacityToRGBA,
  rgbToHex,
  rgbToRGB_ar,
} from "./utils.js";

class LevelTransition {}

LevelTransition.init = function () {
  LevelTransition.propertiesInfo = [
    {
      type: LEVEL_TRANSITION_PROPERTY_TYPE.COLOR,
      readFromName: "bgColor",
      writeToClass: Display,
      writeToName: "bgColor",
    },
    {
      type: LEVEL_TRANSITION_PROPERTY_TYPE.COLOR,
      readFromName: "textColor",
      writeToClass: Display,
      writeToName: "textColor",
    },
    {
      type: LEVEL_TRANSITION_PROPERTY_TYPE.COLOR,
      readFromName: "textColorHighlight",
      writeToClass: Display,
      writeToName: "textColorHighlight",
    },
    {
      type: LEVEL_TRANSITION_PROPERTY_TYPE.COLOR,
      readFromName: "textColorShadow",
      writeToClass: Display,
      writeToName: "shadowColor",
      defaultValue: GAME.TEXT_DEFAULT_SHADOW_COLOR,
    },
    {
      type: LEVEL_TRANSITION_PROPERTY_TYPE.COLOR,
      readFromName: "player.color",
      writeToClass: Player,
      writeToName: "color",
    },
    {
      type: LEVEL_TRANSITION_PROPERTY_TYPE.NUMBER,
      readFromName: "player.radius",
      //readFromClass: Player,
      writeToClass: Player,
      writeToName: "radius",
    },
    {
      type: LEVEL_TRANSITION_PROPERTY_TYPE.NUMBER,
      readFromName: "controllerSpeedDamp",
      writeToClass: Controller,
      writeToName: "speedDamp",
      defaultValue: GAME.CONTROLLER_SPEED_DAMP,
    },
    {
      type: LEVEL_TRANSITION_PROPERTY_TYPE.NUMBER,
      readFromName: "controllerSlipperiness",
      writeToClass: Controller,
      writeToName: "slipperiness",
      defaultValue: GAME.CONTROLLER_SLIPPERINESS,
    },
  ];
};

/**
 * @function startLevelOutro
 * @static
 *
 * @description
 * ##### Start level outro sequence
 */
LevelTransition.start = function () {
  LevelTransition.blendablePropertiesValues = {};

  LevelTransition.nextLevelData =
    Game.levelData[Object.keys(Game.levelData)[Game.getNextLevelIndex()]];

  LevelTransition.totalFrames = InternalTimer.secondsToFrames(
    TIMINGS.LEVEL_OUTROEND_MS / 1000
  );

  ObstacleManager.explodeAllAvoids();

  Game.levelOutroBgObstaclesToRemovePerFrame = Math.ceil(
    Game.backgroundTotal / LevelTransition.totalFrames
  );

  LevelTransition.setupFades();
};

/**
 * @function nextFrame
 * @static
 *
 * @description
 * ##### Perform the next step of the level outro sequence
 * - Move from old level colours to the next level colours
 * - Move from old level numeric values to the next level numeric values
 */
LevelTransition.nextFrame = function () {
  var i,
    type,
    propertyName,
    writeToPropertyName,
    writeToClass,
    details,
    newValue;

  for (i = 0; i < LevelTransition.propertiesInfo.length; i++) {
    type = LevelTransition.propertiesInfo[i].type;

    propertyName = LevelTransition.propertiesInfo[i].readFromName;
    writeToPropertyName = LevelTransition.propertiesInfo[i].writeToName;
    writeToClass = LevelTransition.propertiesInfo[i].writeToClass;

    details = LevelTransition.blendablePropertiesValues[propertyName];

    if (type === LEVEL_TRANSITION_PROPERTY_TYPE.COLOR) {
      if (LevelTransition.totalFrames > 0) {
        details.currentRgba = addFadeStepToRGB(
          details.currentRgba,
          details.stepRgb_ar
        );
      } else {
        details.currentRgba = details.aimRgba;
      }

      // RGBA -> RGB Array (spread) -> Hex
      newValue = rgbToHex(...rgbToRGB_ar(details.currentRgba));
    } else if (type === LEVEL_TRANSITION_PROPERTY_TYPE.NUMBER) {
      if (LevelTransition.totalFrames > 0) {
        details.currentValue += details.stepValue;
      } else {
        details.currentValue = details.aimValue;
      }

      newValue = details.currentValue;
    }

    writeToClass[writeToPropertyName] = newValue;
  }

  if (LevelTransition.totalFrames > 0) {
    ObstacleManager.levelOutroRemoveNextBackgroundObstacles(
      Game.levelOutroBgObstaclesToRemovePerFrame
    );

    // Continue sequence
    LevelTransition.totalFrames--;
  }

  Display.updateColors();
};

/**
 * @function getNestedPropertyValue
 * @static
 *
 * @description
 * ##### Dynamically retrieve a nested property from an object
 *
 * Given an object, convert string-based dot notation into square bracket notation to access the property, so eg if the object is:
 *
 * ```
 * object1 = {
 *   child: {
 *     grandchild: {
 *       type: "flower"
 *     }
 *   }
 * }
 *
 * getNestedPropertyValue(object1, "child.grandchild.type")
 * // output: "flower"
 * ```
 *
 * @param {object} _object - The parent object which is to be searched
 * @param {string} _nestedProperty - The (potentially) nested property as a dot-separated string
 *
 * @returns {object} The discovered value
 */
LevelTransition.getNestedPropertyValue = function (_object, _nestedProperty) {
  var nestedPropertyValue = _object,
    propertyName_ar = _nestedProperty.split(".");

  __("propertyName_ar: " + JSON.stringify(propertyName_ar));

  // ["player", "radius"];
  while (propertyName_ar.length) {
    nestedPropertyValue = nestedPropertyValue[propertyName_ar[0]];
    propertyName_ar.splice(0, 1);
    __("nestedPropertyValue: " + nestedPropertyValue);
  }

  return nestedPropertyValue;
};

/**
 * @function setupFades
 * @static 
 *
 * @description
 * ##### Loop through each of the properties we want to transition and work out how to achieve the change over `LevelTransition.totalFrames` number of frames
 */
LevelTransition.setupFades = function () {
  var i, type, propertyName;

  for (i = 0; i < LevelTransition.propertiesInfo.length; i++) {
    type = LevelTransition.propertiesInfo[i].type;
    propertyName = LevelTransition.propertiesInfo[i].readFromName;

    if (type === LEVEL_TRANSITION_PROPERTY_TYPE.COLOR) {
      LevelTransition.blendablePropertiesValues[propertyName] =
        LevelTransition.getColorBlendDetails(LevelTransition.propertiesInfo[i]);
    } else if (type === LEVEL_TRANSITION_PROPERTY_TYPE.NUMBER) {
      LevelTransition.blendablePropertiesValues[propertyName] =
        LevelTransition.getNumberBlendDetails(
          LevelTransition.propertiesInfo[i]
        );
    }
  }
};


/**
 * @function getColorBlendDetails
 * @static
 *
 * @description
 * ##### Get info about how to transition a colour
 * - Most colour data in the game is stored as hex values
 * - Convert those to RGB(/A) values, so that each channel can have its transition steps calculated
 *
 * @param {object} _propertyInfo - Info about this property from `LevelTransition.propertiesInfo`
 *
 * @returns {object} Describing the current value, the aim, and steps to get there
 */
LevelTransition.getColorBlendDetails = function (_propertyInfo) {
  var currentHex, currentRgba, aimHex, aimRgba, stepRgb_ar;

  currentHex = LevelTransition.getNestedPropertyValue(
    _propertyInfo.readFromClass || Game.curLevelData,
    _propertyInfo.readFromName
  );
  if (currentHex === undefined) {
    currentHex = _propertyInfo.defaultValue;
  }
  currentRgba = hexOpacityToRGBA(currentHex, 1);

  aimHex = LevelTransition.getNestedPropertyValue(
    LevelTransition.nextLevelData,
    _propertyInfo.readFromName
  );
  if (aimHex === undefined) {
    aimHex = _propertyInfo.defaultValue;
  }
  aimRgba = hexOpacityToRGBA(aimHex, 1);

  stepRgb_ar = getFadeStepBetweenRGBColorsArray(
    currentRgba,
    aimRgba,
    LevelTransition.totalFrames
  );

  return {
    currentRgba: currentRgba,
    aimRgba: aimRgba,
    stepRgb_ar: stepRgb_ar,
  };
};

/**
 * @function getNumberBlendDetails
 * @static
 *
 * @description
 * ##### Get info about how to transition a number
 *
 * @param {object} _propertyInfo - Info about this property from `LevelTransition.propertiesInfo`
 *
 * @returns {object} Describing the current value, the aim, and steps to get there
 */
LevelTransition.getNumberBlendDetails = function (_propertyInfo) {
  var currentValue, aimValue, stepValue;

  currentValue = LevelTransition.getNestedPropertyValue(
    _propertyInfo.readFromClass || Game.curLevelData,
    _propertyInfo.readFromName
  );
  if (currentValue === undefined) {
    currentValue = _propertyInfo.defaultValue;
  }

  aimValue = LevelTransition.getNestedPropertyValue(
    LevelTransition.nextLevelData,
    _propertyInfo.readFromName
  );
  if (aimValue === undefined) {
    aimValue = _propertyInfo.defaultValue;
  }

  stepValue = (aimValue - currentValue) / LevelTransition.totalFrames;

  return {
    currentValue: currentValue,
    aimValue: aimValue,
    stepValue: stepValue,
  };
};

export { LevelTransition };
