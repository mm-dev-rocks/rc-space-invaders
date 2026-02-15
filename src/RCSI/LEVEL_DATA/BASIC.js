import { THING_TYPE } from "./../ENUM.js";

// LEVEL basic
export const BASIC = {
  isDark: true,
  textColor: "#cccccc",
  textColorHighlight: "#ff4444",
  textColorShadow: "#3a3a3a",
  bgColor: "#000000",
  bgFadeAlpha: 0.56,
  player: {
    color: "#ffffff",
  },
  things: [
    {
      type: THING_TYPE.BACKGROUND,
      total: 300,
      color_ar: ["#FF0000", "#E60000", "#CC0000", "#B30000", "#990000", "#800000", "#660000"],
      radiusRange: [1, 2],
      directionRange: [80, 100],
      speedRange: [0.2, 0.5],
    },
    {
      type: THING_TYPE.ENEMY,
      color_ar: ["#FF0000", "#FF4500", "#FFFF00", "#00FF00", "#1E90FF", "#8A2BE2", "#FF1493"],
      radiusRange: [10, 10],
      directionRange: [180, 180],
      speedRange: [0.5, 0.5],
      pattern: `
      -XXX-XXX-XXX-
      XXXXXXXXXXXXX
      XXXXXXXXXXXXX
      --XX--X--XX--
      `,
    },
  ],
};
