import { HORIZ_ALIGN, THING_TYPE, VERT_ALIGN } from "./../ENUM.js";

// first 'level' is actually the intro/instructions screen
export const INTRO = {
  isDark: true,
  textColor: "#ffffff",
  bgColor: "#000000",
  bgFadeAlpha: 0.4,
  player: {
    color: "#ffffff",
  },
  things: [
    {
      type: THING_TYPE.BACKGROUND,
      total: 500,
      color_ar: ["#bbbbbb", "#666666", "#999999", "#ffffff"],
      radiusRange: [0.5, 2],
      directionRange: [85, 95],
      speedRange: [0.1, 2.0],
    },
  ],
  instruct_text: [
    {
      portraitAlignH: HORIZ_ALIGN.CENTER,
      portraitAlignV: VERT_ALIGN.CENTER,
      portraitOffsetCharsV: 1,
      text: [
        {
          color: "#ffffff",
          text: "LEFT/RIGHT ARROWS TO MOVE",
        },
        {
          color: "#ffffff",
          text: "ARROW UP TO FIRE",
        },
        {
          text: "",
        },
        {
          color: "#ffff00",
          text: "SPACE TO START",
        },
      ],
    },
  ],
};
