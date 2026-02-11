import { OBSTACLE_TYPE } from "./../ENUM.js";
import * as SOUND_DATA from "./../SOUND_DATA.js";

export const OPRTN = {
  isDark: true,
  startHealth: 15,
  timeAllowedSecs: 60,
  textColor: "#00ade5",
  textColorHighlight: "#ea352c",
  bgColor: "#f3dd15",
  bgFadeAlpha: 0.55,
  gameplayAreaToCanvasLateralRatio: 0.8,
  player: {
    color: "#fff0f3",
    growthDivisor: 100,
    radius: 15,
  },
  obstacles: [
    //{
    //  type: OBSTACLE_TYPE.BACKGROUND,
    //  total: 200,
    //  color_ar: [
    //    "#ffffff",
    //  ],
    //  radiusRange: [1, 2],
    //  directionRange: [175, 185],
    //  speedRange: [0.01, 0.04],
    //},
    {
      type: OBSTACLE_TYPE.COLLECT,
      collectSfx_ar: SOUND_DATA.ORDERED_POP_SFX_AR,
      total: 13,
      color_ar: ["#240e08"],
      radiusRange: [4, 6],
      directionRange: [120, 240],
      speedRange: [1, 3],
    },
    {
      type: OBSTACLE_TYPE.AVOID,
      total: 20,
      color_ar: [
        "#ca0405",
      ],
      radiusRange: [30, 55],
      directionRange: [120, 240],
      speedRange: [1, 3],
    },
  ],
};
