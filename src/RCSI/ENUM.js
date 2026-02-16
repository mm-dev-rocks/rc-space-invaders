/**
 * @license GPL-3.0-only
 *
 * @author Mark Mayes / mm-dev
 *
 *
 * @module RCSI/ENUM
 *
 * @description
 * ## Some string-indexed enum-type data
 */

/**
 * @readonly
 * @enum {string}
 */
export const THING_TYPE = {
  ENEMY: "thingTypeEnemy",
  BACKGROUND: "thingTypeBackground",
};

/**
 * @readonly
 * @enum {string}
 */
export const RECTANGLE = {
  CANVAS: "rectangleCanvas",
  GAMEAREA: "rectangleGameArea",
  PLAYERBOUNDS: "rectanglePlayerBounds",
  BACKGROUND: "rectangleBackground",
  MAINTITLE: "rectangleMainTitle",
};

/**
 * @readonly
 * @enum {string}
 */
export const VERT_ALIGN = {
  TOP: "verticalAlignmentTop",
  CENTER: "verticalAlignmentCenter",
  BOTTOM: "verticalAlignmentBottom",
};

/**
 * @readonly
 * @enum {string}
 */
export const HORIZ_ALIGN = {
  LEFT: "horizontalAlignmentLeft",
  CENTER: "horizontalAlignmentCenter",
  RIGHT: "horizontalAlignmentRight",
};

/**
 * @readonly
 * @enum {string}
 */
export const KEY_ACTIONS = {
  MOVE_LEFT: "keyActionMoveLeft",
  MOVE_RIGHT: "keyActionMoveRight",
  FIRE: "keyActionFire",
  START_GAME: "keyActionStartGame",
};
