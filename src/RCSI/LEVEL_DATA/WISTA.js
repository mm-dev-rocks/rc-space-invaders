import { ADDED_LAYER, OBSTACLE_SUBTYPE, OBSTACLE_TYPE } from "./../ENUM.js";
import * as GAME from "./../GAME.js";
import * as GRADIENT from "./../GRADIENT.js";
import * as SOUND_DATA from "./../SOUND_DATA.js";

import { getRandomTrianglePointsWithinCircle } from "./../../utils.js";

export const WISTA = {
  isDark: false,
  startHealth: 30,
  timeAllowedSecs: 120,
  textColor: "#46c7ff",
  textColorHighlight: "#fc6565",
  bgColor: "#ddddff",
  bgFadeAlpha: 0.55,
  gameplayAreaToCanvasLateralRatio: 5,
  controllerSlipperiness: 100,
  tip: "WIDEY... SLIDEY!",
  player: {
    color: "#005500",
    growthDivisor: 1000,
    radius: 30,
  },
  obstacles: [
    {
      type: OBSTACLE_TYPE.BACKGROUND,
      total: 20,
      color_ar: ["#ddddff"],
      radiusRange: [50, 90],
      directionRange: [0, 359],
      speedRange: [GAME.STATIC_OBSTACLE_SPEED, GAME.STATIC_OBSTACLE_SPEED],
      addedLayer_ar: [
        {
          type: ADDED_LAYER.TRIANGLES,
          color: "#cecefb",
          triangle_ar: getRandomTrianglePointsWithinCircle(1, 10),
          // Following ssizes are given as a proportion of obstacle radius, 0-1
          thickness: 0.01,
        },
      ],
    },
    {
      type: OBSTACLE_TYPE.BACKGROUND,
      total: 20,
      color_ar: ["#ddddff"],
      radiusRange: [150, 240],
      directionRange: [0, 359],
      speedRange: [GAME.STATIC_OBSTACLE_SPEED, GAME.STATIC_OBSTACLE_SPEED],
      addedLayer_ar: [
        {
          type: ADDED_LAYER.TRIANGLES,
          color: "#cecefb",
          triangle_ar: getRandomTrianglePointsWithinCircle(1, 7),
          // Following ssizes are given as a proportion of obstacle radius, 0-1
          thickness: 0.01,
        },
      ],
    },
    {
      type: OBSTACLE_TYPE.BACKGROUND,
      total: 20,
      color_ar: ["#ddddff"],
      radiusRange: [50, 140],
      directionRange: [0, 359],
      speedRange: [GAME.STATIC_OBSTACLE_SPEED, GAME.STATIC_OBSTACLE_SPEED],
      addedLayer_ar: [
        {
          type: ADDED_LAYER.TRIANGLES,
          color: "#cecefb",
          triangle_ar: getRandomTrianglePointsWithinCircle(1, 10),
          // Following ssizes are given as a proportion of obstacle radius, 0-1
          thickness: 0.01,
        },
      ],
    },
    {
      type: OBSTACLE_TYPE.BACKGROUND,
      total: 20,
      color_ar: ["#ddddff"],
      radiusRange: [50, 140],
      directionRange: [0, 359],
      speedRange: [GAME.STATIC_OBSTACLE_SPEED, GAME.STATIC_OBSTACLE_SPEED],
      addedLayer_ar: [
        {
          type: ADDED_LAYER.TRIANGLES,
          color: "#cecefb",
          triangle_ar: getRandomTrianglePointsWithinCircle(1, 5),
          // Following ssizes are given as a proportion of obstacle radius, 0-1
          thickness: 0.01,
        },
      ],
    },
    {
      type: OBSTACLE_TYPE.COLLECT,
      collectSfx_ar: SOUND_DATA.ORDERED_POP_SFX_AR,
      total: 13,
      color_ar: ["#242989"],
      radiusRange: [13, 15],
      directionRange: [120, 240],
      speedRange: [1, 2],
      gradient: GRADIENT.BLUEBERRY,
    },
    {
      type: OBSTACLE_TYPE.COLLECT,
      collectSfx_ar: SOUND_DATA.ORDERED_POP_SFX_AR,
      total: 13,
      color_ar: ["#721c1c"],
      radiusRange: [13, 15],
      directionRange: [120, 240],
      speedRange: [1, 2],
      gradient: GRADIENT.REDBERRY,
    },
    {
      type: OBSTACLE_TYPE.AVOID,
      total: 9,
      color_ar: ["#888ff0"],
      radiusRange: [30, 30],
      directionRange: [150, 210],
      speedRange: [10, 15],
    },
    {
      type: OBSTACLE_TYPE.AVOID,
      subtype: OBSTACLE_SUBTYPE.FLOWER,
      total: 9,
      color_ar: ["#002200"],
      radiusRange: [60, 90],
      directionRange: [120, 240],
      speedRange: [GAME.STATIC_OBSTACLE_SPEED, GAME.STATIC_OBSTACLE_SPEED],
      numAppendagesRange: [19, 25],
      shapeCenterRadiusDivisor: 1.3,
      gradient: GRADIENT.TREE,
    },
  ],
};
