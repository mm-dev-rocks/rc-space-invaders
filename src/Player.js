/**
 * @license GPL-3.0-only
 *
 * @author Mark Mayes / mm-dev
 *
 *
 * @module Player
 *
 * @description
 * ## Manage and draw the player
 */

import * as GAME from "./RCSI/GAME.js";

import { Layout } from "./Layout.js";

import { Display } from "./Display.js";
import { Game } from "./Game.js";

import { ImageManager } from "./ImageManager.js";
import * as IMAGE_IDS from "./RCSI/IMAGE_IDS.js";

class Player {
  /** @type {Object} */ static pos;
  /** @type {Object} */ static speedVector;
  /** @type {Object} */ static image;
  /** @type {String} */ static color;
  /** @type {Number} */ static xLimitLeft;
  /** @type {Number} */ static xLimitRight;
}

/**
 * @function init
 * @static
 *
 * @description
 * ##### Set the player image, a neutral start position, and initial speed
 */
Player.init = function () {
  Player.image = ImageManager.getImageByID(IMAGE_IDS.IMG_PLAYER).image_el;
  Player.pos = { x: 0, y: 0 };
  Player.speedVector = { x: 1, y: 0 };
};

/**
 * @function setupForLevel
 * @static
 *
 * @description
 * ##### Set colour according to the current level configuration
 */
Player.setupForLevel = function () {
  Player.color = Game.curLevelData.player.color;
};

/**
 * @function startMoveLeft
 * @static
 *
 * @description
 * ##### Change vector to initiate movement to the left
 */
Player.startMoveLeft = function () {
  Player.speedVector.x -= GAME.PLAYER_ACCEL;
};

/**
 * @function startMoveRight
 * @static
 *
 * @description
 * ##### Change vector to initiate movement to the right
 */
Player.startMoveRight = function () {
  Player.speedVector.x += GAME.PLAYER_ACCEL;
};

/**
 * @function stopMove
 * @static
 *
 * @description
 * ##### Reset vector to stop movement
 */
Player.stopMove = function () {
  // REDUNDANT FOR NOW AS INERTIA STOPS THE PLAYER MOVEMENT AUTOMATICALLY
  //Player.speedVector.x = 0;
};

/**
 * @function updateSizes
 * @static
 *
 * @description
 * ##### Update some variables to fit the current layout
 */
Player.updateSizes = function () {
  Player.pos.x = Math.round(Layout.gameplayWidth / 2) - (Player.image.width * GAME.PLAYER_DRAW_SCALE) / 2;
  Player.pos.y = Layout.gameplay_rect.bottom - Player.image.height * GAME.PLAYER_DRAW_SCALE;
  Player.xLimitLeft = Layout.gameplay_rect.left;
  Player.xLimitRight = Layout.gameplay_rect.right - Player.image.width * GAME.PLAYER_DRAW_SCALE;
};

/**
 * @function update
 * @static
 *
 * @description
 * ##### Update some properties of the player (called on each frame)
 *
 * - The position to be drawn at (capped within bounds)
 * - Add inertia effect (slow down)
 *
 */
Player.update = function () {
  Player.pos.x = Math.max(Player.xLimitLeft, Math.min(Player.pos.x + Player.speedVector.x, Player.xLimitRight));
  if (Player.speedVector.x != 0) {
    Player.speedVector.x *= GAME.PLAYER_INERTIA_MULTIPLIER;
  }
};

/**
 * @function draw
 * @static
 *
 * @description
 * ##### Draw the character
 */
Player.draw = function () {
  var color, playerDrawnPosX, playerDrawnPosY;

  playerDrawnPosX = Player.pos.x;
  playerDrawnPosY = Player.pos.y;
  color = Player.color;

  if (Display.ctx) {
    Display.ctx.drawImage(
      Player.image,
      0,
      0,
      Player.image.width,
      Player.image.height,
      playerDrawnPosX,
      playerDrawnPosY,
      Player.image.width * GAME.PLAYER_DRAW_SCALE,
      Player.image.height * GAME.PLAYER_DRAW_SCALE,
    );
  }
};

export { Player };
