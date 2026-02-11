import { ADDED_LAYER, OBSTACLE_SUBTYPE, OBSTACLE_TYPE } from "./../ENUM.js";
import * as GAME from "./../GAME.js";
import * as GRADIENT from "./../GRADIENT.js";
import * as SOUND_DATA from "./../SOUND_DATA.js";

export const CHPLN = {
  isDark: false,
  startHealth: 60,
  timeAllowedSecs: 50,
  textColor: "#ac9191",
  textColorHighlight: "#ececec",
  bgColor: "#696262",
  bgFadeAlpha: 0.65,
  gameplayAreaToCanvasLateralRatio: 1,
  player: {
    color: "#b7a1a1",
    growthDivisor: 600,
    //speedCentre: 77,
    radius: 15,
  },
  obstacles: [
    {
      type: OBSTACLE_TYPE.BACKGROUND,
      total: 90,
      color_ar: ["#423636"],
      radiusRange: [16, 29],
      directionRange: [179, 181],
      speedRange: [GAME.STATIC_OBSTACLE_SPEED, GAME.STATIC_OBSTACLE_SPEED],
    },
    {
      type: OBSTACLE_TYPE.BACKGROUND,
      subtype: OBSTACLE_SUBTYPE.FLOWER,
      total: 33,
      color_ar: ["#635858"],
      radiusRange: [16, 29],
      directionRange: [179, 181],
      speedRange: [GAME.STATIC_OBSTACLE_SPEED, GAME.STATIC_OBSTACLE_SPEED],
      numAppendagesRange: [3, 4],
      shapeCenterRadiusDivisor: 40,
      shapeCenterColor_ar: ["#ffffff"],
    },
    {
      type: OBSTACLE_TYPE.COLLECT,
      collectSfx_ar: SOUND_DATA.ORDERED_POP_SFX_AR,
      total: 20,
      color_ar: ["#d6d6d6"],
      radiusRange: [30, 40],
      directionRange: [120, 240],
      speedRange: [2, 3],
      addedLayer_ar: [
        {
          type: ADDED_LAYER.BOWLER,
          colorOuter: "#000000",
          colorInner: "#252525",
          // Following ssizes are given as a proportion of obstacle radius, 0-1
          thickness: 1,
          offsetFromCenter: 0,
        },
      ],
    },
    {
      type: OBSTACLE_TYPE.COLLECT,
      subtype: OBSTACLE_SUBTYPE.FLOWER,
      collectSfx_ar: SOUND_DATA.ORDERED_POP_SFX_AR,
      total: 20,
      color_ar: ["#d6d6d6"],
      radiusRange: [30, 40],
      directionRange: [120, 240],
      speedRange: [2, 3],
      numAppendagesRange: [5, 9],
      rotationSpeedRange: [0.05, 0.09],
      shapeCenterRadiusDivisor: 5,
      shapeCenterColor_ar: ["#ffffff"],
    },
    {
      type: OBSTACLE_TYPE.AVOID,
      total: 7,
      radiusRange: [28, 50],
      directionRange: [120, 240],
      speedRange: [1, 2],
      rotationSpeedRange: [2, 2],
      gradient: GRADIENT.TYRE,
      addedLayer_ar: [
        {
          type: ADDED_LAYER.SPOKES,
          color: "#a9a9a9",
          total: 7,
          // Following ssizes are given as a proportion of obstacle radius, 0-1
          thickness: 0.1,
          // extension, meaning how far from the centre to the outer edge the
          // spoke extends
          extension: 0.8,
          //offsetX: 1,
          //offsetY: 1,
        },
        //{
        //  type: ADDED_LAYER.MOUTH,
        //  color: "#000000",
        //  // Following ssizes are given as a proportion of obstacle radius, 0-1
        //  thickness: 0.2,
        //  offsetFromCenter: 0.6,
        //  degreeSpan: 70,
        //},
      ],
    },
    {
      type: OBSTACLE_TYPE.FLOATING,
      total: 13,
      color_ar: ["#dddddd"],
      radiusRange: [70, 78],
      directionRange: [120, 240],
      speedRange: [0.01, 0.03],
      gradient: GRADIENT.CLOUD_LIGHT,
    },
    {
      type: OBSTACLE_TYPE.FLOATING,
      total: 13,
      color_ar: ["#dddddd"],
      radiusRange: [96, 99],
      directionRange: [120, 240],
      speedRange: [0.03, 0.09],
      gradient: GRADIENT.CLOUD_MEDIUM,
    },
    {
      type: OBSTACLE_TYPE.FLOATING,
      total: 20,
      color_ar: ["#dddddd"],
      radiusRange: [130, 150],
      directionRange: [120, 240],
      speedRange: [0.2, 0.3],
      gradient: GRADIENT.CLOUD_LIGHT,
    },
  ],
};
