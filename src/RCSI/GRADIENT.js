// SPDX-License-Identifier: GPL-3.0-only

import { GRADIENT_TYPE } from "./ENUM.js";

// Special value used to dynamically insert the color
export const LEVEL_BACKGROUND_COLOR = "levelBackGroundColor";

export const CLOUD_LIGHT = {
  type: GRADIENT_TYPE.RADIAL,
  stop_ar: [
    { pos: 0.34, color: "rgba(255, 255, 255, 0.6)" },
    { pos: 0.5, color: "rgba(255, 255, 255, 0.54)" },
    { pos: 0.85, color: "rgba(255, 255, 255, 0.25)" },
    { pos: 1, color: "rgba(255, 255, 255, 0)" },
  ],
};

export const CLOUD_MEDIUM = {
  type: GRADIENT_TYPE.RADIAL,
  stop_ar: [
    { pos: 0.25, color: "rgba(255, 255, 255, 0.94)" },
    { pos: 0.49, color: "rgba(255, 255, 255, 0.77)" },
    { pos: 0.84, color: "rgba(255, 255, 255, 0.32)" },
    { pos: 1, color: "rgba(255, 255, 255, 0)" },
  ],
};

export const TYRE = {
  type: GRADIENT_TYPE.RADIAL,
  stop_ar: [
    { pos: 0, color: "transparent" },
    { pos: 0.7, color: "transparent" },
    { pos: 0.7, color: "black" },
    { pos: 1, color: "black" },
  ],
};

export const TREE = {
  type: GRADIENT_TYPE.RADIAL,
  stop_ar: [
    { pos: 0.01, color: "rgba(73, 180, 82, 1)" },
    { pos: 0.02, color: "#37a439" },
    { pos: 0.02, color: "#37a439" },
    { pos: 0.66, color: "rgba(27, 161, 33, 1)" },
    { pos: 0.99, color: "rgba(9, 54, 15, 1)" },
  ],
  offsetX: -0.1,
  offsetY: -0.1,
};

export const UFO = {
  type: GRADIENT_TYPE.RADIAL,
  stop_ar: [
    { pos: 0, color: "rgba(255, 255, 255, 1)" },
    { pos: 0.05, color: "rgba(255, 255, 255, 1)" },
    { pos: 0.25, color: "rgba(225, 225, 225, 1)" },
    { pos: 0.49, color: "rgba(185, 185, 185, 1)" },
    { pos: 0.64, color: "rgba(0, 255, 0, 0.3)" },
    { pos: 0.85, color: "rgba(0, 255, 0, 0.1)" },
    { pos: 1, color: "rgba(0, 255, 0, 0.01)" },
  ],
};

export const OLIVE = {
  type: GRADIENT_TYPE.RADIAL,
  stop_ar: [
    { pos: 0, color: "#726d1c" },
    { pos: 0.05, color: "rgba(98, 94, 23, 1)" },
    { pos: 0.98, color: "rgba(66, 64, 25, 1)" },
  ],
  offsetX: -0.2,
  offsetY: -0.2,
};

export const REDBERRY = {
  type: GRADIENT_TYPE.RADIAL,
  stop_ar: [
    { pos: 0, color: "#892424" },
    { pos: 0.05, color: "#621717" },
    { pos: 0.98, color: "#582222" },
  ],
  offsetX: -0.2,
  offsetY: -0.2,
};

export const BLUEBERRY = {
  type: GRADIENT_TYPE.RADIAL,
  stop_ar: [
    { pos: 0, color: "#242989" },
    { pos: 0.05, color: "#171e62" },
    { pos: 0.98, color: "#272258" },
  ],
  offsetX: -0.2,
  offsetY: -0.2,
};

export const BOWLER = {
  type: GRADIENT_TYPE.RADIAL,
  stop_ar: [
    { pos: 0.25, color: "rgba(255, 255, 255, 1)" },
    { pos: 0.49, color: "rgba(225, 225, 225, 1)" },
    { pos: 0.84, color: "rgba(255, 255, 255, 1)" },
    { pos: 1, color: "rgba(235, 235, 235, 1)" },
  ],
};

export const GALAXY = {
  type: GRADIENT_TYPE.RADIAL,
  stop_ar: [
    { pos: 0, color: "rgba(255, 255, 0, 0.09)" },
    { pos: 0.001, color: "rgba(255, 255, 0, 0)" },
    { pos: 0.27, color: "rgba(255, 255, 0, 0)" },
    { pos: 0.5, color: "rgba(0, 188, 212, 0.25)" },
    { pos: 0.79, color: "rgba(255, 255, 0, 0)" },
    { pos: 1, color: "rgba(238, 130, 238, 0.25)" },
  ],
};

export const MOON = {
  type: GRADIENT_TYPE.RADIAL,
  stop_ar: [
    { pos: 0.25, color: "rgba(245, 235, 235, 1)" },
    { pos: 0.49, color: "rgba(232, 232, 232, 1)" },
    { pos: 0.64, color: "rgba(255, 246, 235, 1)" },
    { pos: 0.7, color: "rgba(255, 255, 255, 0.6)" },
    { pos: 1, color: "rgba(255, 255, 255, 0.4)" },
  ],
};

export const STRAWBERRY_MOON = {
  type: GRADIENT_TYPE.RADIAL,
  stop_ar: [
    { pos: 0.25, color: "rgba(255, 225, 225, 1)" },
    { pos: 0.49, color: "rgba(242, 222, 222, 1)" },
    { pos: 0.74, color: "rgba(255, 236, 235, 1)" },
    { pos: 0.8, color: "rgba(255, 245, 245, 0.6)" },
    { pos: 1, color: "rgba(255, 245, 245, 0.4)" },
  ],
};

export const BULLET = {
  type: GRADIENT_TYPE.LINEAR,
  stop_ar: [
    { pos: 0, color: "rgba(128, 90, 63, 1)" },
    { pos: 0.41, color: "rgba(255, 255, 255, 1)" },
    { pos: 0.79, color: "rgba(202, 170, 131, 1)" },
    { pos: 1, color: "rgba(124, 83, 54, 1)" },
  ],
  rotation: 90,
};

export const GOLD_STAR = {
  type: GRADIENT_TYPE.LINEAR,
  stop_ar: [
    { pos: 0.03, color: "rgba(212, 193, 73, 1)" },
    { pos: 0.37, color: "rgba(249, 228, 158, 1)" },
    { pos: 0.66, color: "rgba(255, 176, 59, 1)" },
    { pos: 1, color: "rgba(135, 90, 24, 1)" },
  ],
  rotation: 90,
};
