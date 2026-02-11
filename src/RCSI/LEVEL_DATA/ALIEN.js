import { OBSTACLE_TYPE } from "./../ENUM.js";
import * as GRADIENT from "./../GRADIENT.js";
import * as SOUND_DATA from "./../SOUND_DATA.js";

export const ALIEN = {
  isDark: true,
  startHealth: 25,
  timeAllowedSecs: 100,
  textColor: "#959595",
  textColorHighlight: "#ebebeb",
  textColorShadow: "#3a3a3a",
  bgColor: "#000000",
  bgFadeAlpha: 0.55,
  gameplayAreaToCanvasLateralRatio: 0.8,
  player: {
    color: "#ff7c00",
    growthDivisor: 100,
    radius: 15,
  },
  obstacles: [
    {
      type: OBSTACLE_TYPE.BACKGROUND,
      total: 300,
      color_ar: ["#ffffff"],
      radiusRange: [2, 3],
      directionRange: [175, 185],
      speedRange: [0.01, 0.04],
    },
    {
      type: OBSTACLE_TYPE.COLLECT,
      collectSfx_ar: SOUND_DATA.ORDERED_POP_SFX_AR,
      //total: 4,
      total: 100,
      color_ar: ["#01be01"],
      radiusRange: [9, 13],
      directionRange: [120, 240],
      speedRange: [1, 3],
    },
    {
      type: OBSTACLE_TYPE.COLLECT,
      collectSfx_ar: SOUND_DATA.ORDERED_POP_SFX_AR,
      //total: 4,
      total: 100,
      color_ar: ["#00ff00"],
      radiusRange: [11, 15],
      directionRange: [120, 240],
      speedRange: [1, 3],
    },
    {
      type: OBSTACLE_TYPE.COLLECT,
      collectSfx_ar: SOUND_DATA.ORDERED_POP_SFX_AR,
      //total: 4,
      total: 100,
      color_ar: ["#9aff2c"],
      radiusRange: [15, 19],
      directionRange: [120, 240],
      speedRange: [1, 3],
    },
    {
      type: OBSTACLE_TYPE.AVOID,
      total: 5,
      color_ar: ["#ffffff"],
      radiusRange: [50, 75],
      directionRange: [120, 240],
      speedRange: [5, 6],
      gradient: GRADIENT.UFO,
    },
  ],
};
