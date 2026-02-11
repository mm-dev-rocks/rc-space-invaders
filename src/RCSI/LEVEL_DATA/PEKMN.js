import {
  ADDED_LAYER,
  GRADIENT_TYPE,
  OBSTACLE_SUBTYPE,
  OBSTACLE_TYPE,
} from "./../ENUM.js";
import * as SOUND_DATA from "./../SOUND_DATA.js";

import { hexOpacityToRGBA } from "./../../utils.js";

export const PEKMN = {
  isDark: true,
  startHealth: 50,
  timeAllowedSecs: 50,
  textColor: "#ff0000",
  textColorHighlight: "#ffffff",
  bgColor: "#000000",
  bgFadeAlpha: 0.7,
  gameplayAreaToCanvasLateralRatio: 0.8,
  controllerSpeedDamp: 10,
  player: {
    color: "#ffff00",
    growthDivisor: 10000,
    radius: 40,
    addedLayer_ar: [
      {
        type: ADDED_LAYER.MOUTH,
        color: "#615400",
        // Following ssizes are given as a proportion of obstacle radius, 0-1
        thickness: 0.2,
        offsetFromCenter: 0.9,
        degreeSpan: 90,
      },
      //{
      //  type: ADDED_LAYER.EYES,
      //  color: "#615400",
      //  // Following ssizes are given as a proportion of obstacle radius, 0-1
      //  thickness: 0.15,
      //  offsetFromCenter: 0.4,
      //  degreeSpan: 135,
      //},
    ],
  },
  obstacles: [
    {
      type: OBSTACLE_TYPE.BACKGROUND,
      total: 300,
      color_ar: ["#1919ae"],
      radiusRange: [2, 5],
      directionRange: [180, 180],
      speedRange: [1, 1],
    },
    {
      type: OBSTACLE_TYPE.COLLECT,
      collectSfx_ar: SOUND_DATA.ORDERED_CHOMP_SFX_AR,
      total: 100,
      color_ar: ["#ffb897"],
      radiusRange: [5, 40],
      directionRange: [170, 160],
      speedRange: [1.5, 2],
      useDefaultStroke: true,
      //gradientFadePoint: 0.1,
    },
    {
      type: OBSTACLE_TYPE.AVOID,
      subtype: OBSTACLE_SUBTYPE.SQUARCLE,
      total: 2,
      radiusRange: [40, 40],
      directionRange: [120, 240],
      speedRange: [3, 4],
      useDefaultStroke: true,
      gradient: {
        type: GRADIENT_TYPE.LINEAR,
        stop_ar: [
          { pos: 0, color: "#ff0000" },
          { pos: 0.666, color: "#ff0000" },
          { pos: 1, color: hexOpacityToRGBA("#ff0000", 0.75) },
        ],
        rotation: 180,
      },
    },
    {
      type: OBSTACLE_TYPE.AVOID,
      subtype: OBSTACLE_SUBTYPE.SQUARCLE,
      total: 2,
      radiusRange: [40, 40],
      directionRange: [120, 240],
      speedRange: [1, 2],
      useDefaultStroke: true,
      gradient: {
        type: GRADIENT_TYPE.LINEAR,
        stop_ar: [
          { pos: 0, color: "#00ffde" },
          { pos: 0.666, color: "#00ffde" },
          { pos: 1, color: hexOpacityToRGBA("#00ffde", 0.75) },
        ],
        rotation: 180,
      },
    },
    {
      type: OBSTACLE_TYPE.AVOID,
      subtype: OBSTACLE_SUBTYPE.SQUARCLE,
      total: 2,
      radiusRange: [40, 40],
      directionRange: [120, 240],
      speedRange: [1, 2],
      useDefaultStroke: true,
      gradient: {
        type: GRADIENT_TYPE.LINEAR,
        stop_ar: [
          { pos: 0, color: "#ffb8de" },
          { pos: 0.666, color: "#ffb8de" },
          { pos: 1, color: hexOpacityToRGBA("#ffb8de", 0.75) },
        ],
        rotation: 180,
      },
    },
    {
      type: OBSTACLE_TYPE.AVOID,
      subtype: OBSTACLE_SUBTYPE.SQUARCLE,
      total: 2,
      radiusRange: [40, 40],
      directionRange: [120, 240],
      speedRange: [3, 4],
      useDefaultStroke: true,
      gradient: {
        type: GRADIENT_TYPE.LINEAR,
        stop_ar: [
          { pos: 0, color: "#ffb847" },
          { pos: 0.666, color: "#ffb847" },
          { pos: 1, color: hexOpacityToRGBA("#ffb847", 0.75) },
        ],
        rotation: 180,
      },
    },
  ],
};
