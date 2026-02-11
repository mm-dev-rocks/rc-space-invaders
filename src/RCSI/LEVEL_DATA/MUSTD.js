import { OBSTACLE_TYPE } from "./../ENUM.js";
import * as SOUND_DATA from "./../SOUND_DATA.js";

export const MUSTD = {
  isDark: true,
  startHealth: 25,
  timeAllowedSecs: 100,
  //startHealth: 25,
  //timeAllowedSecs: 100,
  textColor: "#f0ff00",
  textColorHighlight: "#ff6300",
  bgColor: "#371c02",
  bgFadeAlpha: 0.58,
  gameplayAreaToCanvasLateralRatio: 0.7,
  player: {
    color: "#16c1c4",
    growthDivisor: 40,
    radius: 15,
  },
  obstacles: [
    {
      type: OBSTACLE_TYPE.BACKGROUND,
      total: 300,
      color_ar: ["#ff7c7c", "#6d8800"],
      radiusRange: [2, 3],
      directionRange: [175, 185],
      speedRange: [0.01, 0.04],
    },
    {
      type: OBSTACLE_TYPE.COLLECT,
      collectSfx_ar: SOUND_DATA.ORDERED_POP_SFX_AR,
      total: 333,
      color_ar: ["#ff006f", "#ff01c0", "#e046ff", "#ff469c"],
      radiusRange: [6, 8],
      directionRange: [120, 240],
      speedRange: [1, 3],
    },
    {
      type: OBSTACLE_TYPE.AVOID,
      total: 9,
      color_ar: ["#ffffff"],
      radiusRange: [30, 55],
      directionRange: [120, 240],
      speedRange: [2.5, 3.5],
    },
  ],
};
