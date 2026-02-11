import { OBSTACLE_TYPE } from "./../ENUM.js";
import * as SOUND_DATA from "./../SOUND_DATA.js";

export const MULT1 = {
  isDark: true,
  startHealth: 20,
  timeAllowedSecs: 100,
  textColor: "#b1ffcd",
  textColorHighlight: "#ffb1c7",
  bgColor: "#272727",
  bgFadeAlpha: 0.5,
  gameplayAreaToCanvasLateralRatio: 0.8,
  controllerSpeedDamp: 10,
  tip: "SUPERFOODS!",
  player: {
    color: "#ffffff",
    growthDivisor: 30,
    radius: 15,
  },
  obstacles: [
    {
      type: OBSTACLE_TYPE.BACKGROUND,
      total: 200,
      color_ar: ["#bbbbbb", "#dddddd", "#999999", "#ffffff"],
      radiusRange: [1, 2],
      directionRange: [175, 185],
      speedRange: [0.003, 0.009],
    },
    {
      type: OBSTACLE_TYPE.COLLECT,
      collectSfx_ar: SOUND_DATA.ORDERED_TWANG_SFX_AR,
      total: 250,
      color_ar: ["#b1feff", "#b2b1ff", "#b1ffcd", "#fff2b1", "#ffb1c7"],
      radiusRange: [16, 19],
      directionRange: [120, 240],
      speedRange: [1, 3],
      // 0.01 - 0.99
      gradientFadePoint: 0.01,
    },
    {
      type: OBSTACLE_TYPE.AVOID,
      total: 4,
      color_ar: ["#000000"],
      radiusRange: [60, 70],
      directionRange: [120, 240],
      speedRange: [1, 2],
    },
    {
      type: OBSTACLE_TYPE.COLLECT,
      collectSfx_ar: SOUND_DATA.ORDERED_TWANG_SFX_AR,
      total: 100,
      color_ar: ["#b1eaff"],
      radiusRange: [6, 9],
      directionRange: [120, 240],
      speedRange: [1, 3],
      // 0.01 - 0.99
      gradientFadePoint: 0.5,
    },
  ],
};
