import { ADDED_LAYER, GRADIENT_TYPE, OBSTACLE_TYPE } from "./../ENUM.js";
import * as GRADIENT from "./../GRADIENT.js";
import * as SOUND_DATA from "./../SOUND_DATA.js";

export const LMOLV = {
  isDark: true,
  startHealth: 15,
  timeAllowedSecs: 100,
  textColor: "#faffab",
  textColorHighlight: "#dd5905",
  bgColor: "#d1cdc4",
  bgFadeAlpha: 0.35,
  gameplayAreaToCanvasLateralRatio: 0.8,
  player: {
    color: "#ff8484",
    growthDivisor: 200,
    radius: 45,
    addedLayer_ar: [
      {
        type: ADDED_LAYER.SPOKES,
        color: "#ffffff",
        total: 8,
        thickness: 0.04,
        extension: 1.1,
      },
      {
        type: ADDED_LAYER.SPOKES,
        color: "#de6e6e",
        total: 8,
        thickness: 0.075,
        extension: 1.05,
      },
      {
        type: ADDED_LAYER.DOT,
        color: "#ffffff",
        extension: 0.1,
      },
    ],
  },
  obstacles: [
    {
      type: OBSTACLE_TYPE.BACKGROUND,
      total: 400,
      color_ar: ["#ffffff"],
      radiusRange: [2, 5],
      directionRange: [175, 185],
      speedRange: [1, 4],
    },
    {
      type: OBSTACLE_TYPE.COLLECT,
      collectSfx_ar: SOUND_DATA.ORDERED_POP_SFX_AR,
      total: 40,
      color_ar: ["#f0e14c"],
      radiusRange: [50, 70],
      directionRange: [120, 240],
      speedRange: [1, 3],
      rotationSpeedRange: [0.5, 0.9],
      gradient: {
        type: GRADIENT_TYPE.RADIAL,
        stop_ar: [
          { pos: 0, color: "#f1d842" },
          { pos: 0.5, color: "#f1d842" },
          { pos: 0.5, color: "#e6ebd8" },
          { pos: 0.8, color: "#e6ebd8" },
          { pos: 0.8, color: "#f0e14c" },
          { pos: 1, color: "#f0e14c" },
        ],
      },
      addedLayer_ar: [
        {
          type: ADDED_LAYER.SPOKES,
          color: "#e6ebd8",
          total: 7,
          thickness: 0.1,
          extension: 0.8,
        },
      ],
    },
    {
      type: OBSTACLE_TYPE.COLLECT,
      collectSfx_ar: SOUND_DATA.ORDERED_POP_SFX_AR,
      total: 40,
      color_ar: ["#719615"],
      radiusRange: [50, 70],
      directionRange: [120, 240],
      speedRange: [1, 3],
      rotationSpeedRange: [0.5, 0.9],
      gradient: {
        type: GRADIENT_TYPE.RADIAL,
        stop_ar: [
          { pos: 0, color: "#cfd772" },
          { pos: 0.5, color: "#cfd772" },
          { pos: 0.5, color: "#e6e8d0" },
          { pos: 0.8, color: "#e6e8d0" },
          { pos: 0.8, color: "#719615" },
          { pos: 1, color: "#719615" },
        ],
      },
      addedLayer_ar: [
        {
          type: ADDED_LAYER.SPOKES,
          color: "#e6e8d0",
          total: 7,
          thickness: 0.1,
          extension: 0.8,
        },
      ],
    },
    {
      type: OBSTACLE_TYPE.AVOID,
      total: 9,
      color_ar: ["#3f4100"],
      radiusRange: [20, 30],
      directionRange: [175, 185],
      speedRange: [1, 2],
      rotationSpeedRange: [0.5, 0.9],
      gradient: GRADIENT.OLIVE,
      addedLayer_ar: [
        {
          type: ADDED_LAYER.STEM,
          color: "#3f4100",
          // Following sizes are given as a proportion of obstacle radius, 0-1
          thickness: 0.2,
          offsetFront: -0.95,
          offsetRear: 1.15,
          degreeSpanFront: 2,
          degreeSpanRear: 12,
        },
      ],
    },
  ],
};
