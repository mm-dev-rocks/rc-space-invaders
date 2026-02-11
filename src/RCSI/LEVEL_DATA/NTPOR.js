import { OBSTACLE_TYPE } from "./../ENUM.js";
import * as SOUND_DATA from "./../SOUND_DATA.js";

export const NTPOR = {
  isDark: true,
  startHealth: 15,
  timeAllowedSecs: 100,
  textColor: "#f0ff00",
  textColorHighlight: "#ff6300",
  bgColor: "#000000",
  bgFadeAlpha: 0.55,
  gameplayAreaToCanvasLateralRatio: 0.8,
  player: {
    color: "#fff0f3",
    growthDivisor: 150,
    radius: 35,
  },
  obstacles: [
    {
      type: OBSTACLE_TYPE.BACKGROUND,
      total: 200,
      color_ar: [
        "#590d22",
        "#800f2f",
        "#a4133c",
        "#c9184a",
        "#ff4d6d",
        "#ff758f",
        "#ff8fa3",
        "#ffb3c1",
        "#ffccd5",
        "#fff0f3",
      ],
      radiusRange: [1, 2],
      directionRange: [175, 185],
      speedRange: [0.01, 0.04],
    },
    {
      type: OBSTACLE_TYPE.COLLECT,
      collectSfx_ar: SOUND_DATA.ORDERED_POP_SFX_AR,
      total: 300,
      color_ar: ["#7d7d00"],
      radiusRange: [4, 6],
      directionRange: [120, 240],
      speedRange: [1, 3],
    },
    {
      type: OBSTACLE_TYPE.AVOID,
      total: 11,
      color_ar: [
        "#590d22",
        "#800f2f",
        "#a4133c",
        "#c9184a",
        "#ff4d6d",
        "#ff758f",
        "#ff8fa3",
      ],
      radiusRange: [30, 55],
      directionRange: [120, 240],
      speedRange: [1, 3],
    },
  ],
};
