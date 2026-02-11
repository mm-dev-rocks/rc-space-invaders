import { HORIZ_ALIGN, OBSTACLE_TYPE, VERT_ALIGN } from "./../ENUM.js";
import * as GAME from "./../GAME.js";

// first 'level' is actually the intro/instructions screen
export const INTRO = {
  isDark: true,
  startHealth: 100,
  timeAllowedSecs: 100,
  textColor: "#ffffff",
  textColorHighlight: GAME.HEALTHMETER_BAR_COLOR,
  //textColorShadow: "#272727",
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
      directionRange: [175, 185],
      speedRange: [0.001, 0.0],
    },
  ],
  instruct_text: [
    {
      isPlayer: true,
      portraitAlignH: HORIZ_ALIGN.CENTER,
      portraitAlignV: VERT_ALIGN.TOP,
      portraitOffsetCharsV: 2,
      landscapeAlignH: HORIZ_ALIGN.LEFT,
      landscapeAlignV: VERT_ALIGN.CENTER,
      landscapeOffsetCharsH: -5,
      landscapeOffsetCharsV: 0,
      text: {
        color: "#ffffff",
        text: "YOU",
      },
    },
    {
      portraitAlignH: HORIZ_ALIGN.RIGHT,
      portraitAlignV: VERT_ALIGN.TOP,
      portraitOffsetCharsV: 1.5,
      landscapeAlignH: HORIZ_ALIGN.LEFT,
      landscapeAlignV: VERT_ALIGN.BOTTOM,
      landscapeOffsetCharsH: 3,
      text: {
        color: "#ffffff",
        text: "HEALTH",
      },
    },
    {
      isControlArea: true,
      portraitAlignH: HORIZ_ALIGN.CENTER,
      portraitAlignV: VERT_ALIGN.BOTTOM,
      //portraitOffsetCharsH: -2,
      portraitOffsetCharsV: -2,
      landscapeAlignH: HORIZ_ALIGN.RIGHT,
      landscapeAlignV: VERT_ALIGN.CENTER,
      landscapeOffsetCharsH: -1,
      landscapeOffsetCharsV: 0,
      text: [
        {
          color: "#ffffff",
          text: "CONTROL",
        },
        {
          color: "#ffffff",
          text: "AREA",
        },
        {
          color: "transparent",
          text: " ",
        },
        {
          color: "#ffff00",
          text: "HIT TO",
        },
        {
          color: "#ffff00",
          text: "START",
        },
      ],
    },
  ],
};
