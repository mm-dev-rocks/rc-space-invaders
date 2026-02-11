import { OBSTACLE_TYPE } from "./../ENUM.js";
import * as SOUND_DATA from "./../SOUND_DATA.js";

export const TOOEZ = {
  isDark: true,
  startHealth: 20,
  timeAllowedSecs: 50,
  textColor: "#aaaaaa",
  textColorHighlight: "#990000",
  textColorShadow: "#2a2a2a",
  bgColor: "#000000",
  bgFadeAlpha: 0.45,
  gameplayAreaToCanvasLateralRatio: 0.8,
  controllerSpeedDamp: 48,
  tip: "EASY IF YOU GO SLOW...",
  player: {
    color: "#ffffff",
    growthDivisor: 1000,
    radius: 20,
  },
  obstacles: [
    {
      type: OBSTACLE_TYPE.BACKGROUND,
      total: 500,
      color_ar: ["#ff9999", "#dd9999", "#bb8888", "#996666"],
      radiusRange: [1, 2],
      directionRange: [175, 185],
      speedRange: [0.001, 0.004],
    },
    {
      type: OBSTACLE_TYPE.COLLECT,
      collectSfx_ar: SOUND_DATA.ORDERED_POP_SFX_AR,
      total: 30,
      color_ar: ["#00ff00", "#c5ff00", "#00dd00", "#00cc00", "#00bb00"],
      radiusRange: [20, 35],
      directionRange: [120, 240],
      speedRange: [1, 3],
    },
    {
      type: OBSTACLE_TYPE.AVOID,
      total: 4,
      color_ar: ["#bb0000"],
      radiusRange: [50, 50],
      directionRange: [100, 100],
      speedRange: [5, 6],
      // 0.01 - 0.99
      gradientFadePoint: 0.01,
    },
  ],
};
