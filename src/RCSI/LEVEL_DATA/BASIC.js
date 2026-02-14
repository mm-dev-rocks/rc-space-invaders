import { THING_TYPE } from "./../ENUM.js";
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
  tip: "EAT AND GROW!",
  player: {
    color: "#ffffff",
  },
  things: [
    {
      type: THING_TYPE.BACKGROUND,
      total: 300,
      color_ar: ["#bbbbbb", "#dddddd", "#999999", "#ffffff"],
      radiusRange: [1, 2],
      directionRange: [80, 100],
      speedRange: [0.01, 0.1],
    },
    {
      type: THING_TYPE.ALIEN,
      pattern: `
      -XXX-XXX-XXX-
      XXXXXXXXXXXXX
      --XX--X--XX--
      `,
    },
  ],
};
