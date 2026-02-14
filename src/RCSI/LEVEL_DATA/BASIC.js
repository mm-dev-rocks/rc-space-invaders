import { OBSTACLE_TYPE } from "./../ENUM.js";
import * as SOUND_DATA from "./../SOUND_DATA.js";

// LEVEL basic
export const BASIC = {
  isDark: true,
  startHealth: 50,
  timeAllowedSecs: 75,
  textColor: "#cccccc",
  textColorHighlight: "#ff4444",
  textColorShadow: "#3a3a3a",
  bgColor: "#000000",
  bgFadeAlpha: 0.56,
  gameplayAreaToCanvasLateralRatio: 0.7,
  tip: "EAT AND GROW!",
  player: {
    color: "#ffffff",
    // 300 - 800
    growthDivisor: 800,
    radius: 15,
  },
  obstacles: [
    {
      type: OBSTACLE_TYPE.BACKGROUND,
      total: 300,
      color_ar: ["#bbbbbb", "#dddddd", "#999999", "#ffffff"],
      radiusRange: [1, 2],
      directionRange: [175, 185],
      speedRange: [0.001, 0.03],
    },
    {
      type: OBSTACLE_TYPE.COLLECT,
      collectSfx_ar: SOUND_DATA.ORDERED_TWANG_SFX_AR,
      total: 33,
      color_ar: ["#bbbbbb", "#dddddd"],
      radiusRange: [25, 35],
      directionRange: [140, 220],
      speedRange: [1, 2],
      // 0.01 - 0.99
      gradientFadePoint: 0.01,
    },
  ],
};
