import { HORIZ_ALIGN, OBSTACLE_TYPE, VERT_ALIGN } from "./../ENUM.js";

// first 'level' is actually the intro/instructions screen
export const INTRO = {
  isDark: true,
  startHealth: 100,
  timeAllowedSecs: 100,
  textColor: "#ffffff",
  bgColor: "#000000",
  bgFadeAlpha: 0.4,
  gameplayAreaToCanvasLateralRatio: 1,
  player: {
    color: "#ffffff",
    growthDivisor: 100,
    radius: 15,
  },
  obstacles: [
    {
      type: OBSTACLE_TYPE.BACKGROUND,
      total: 500,
      color_ar: ["#bbbbbb", "#666666", "#999999", "#ffffff"],
      radiusRange: [1, 3],
      directionRange: [-10, 10],
      speedRange: [0.2, 0.0],
    },
  ],
  instruct_text: [
    {
      portraitAlignH: HORIZ_ALIGN.CENTER,
      portraitAlignV: VERT_ALIGN.BOTTOM,
      portraitOffsetCharsV: -3,
      text: [
        {
          color: "#ffff00",
          text: "ARROWS TO MOVE",
        },
        {
          color: "#ffff00",
          text: "SPACE TO FIRE",
        },
        {
          color: "#ffff00",
          text: "",
        },
        {
          color: "#ffffff",
          text: "TAP TO START",
        },
      ],
    },
  ],
};
