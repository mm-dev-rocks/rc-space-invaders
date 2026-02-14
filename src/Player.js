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
 * ##### Set the player image and a neutral start position
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
 * ##### Set colour, health, size etc according to the current level configuration
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
  // TODO magic number
  Player.speedVector.x -= 1;
};

/**
 * @function startMoveRight
 * @static
 *
 * @description
 * ##### Change vector to initiate movement to the right
 */
Player.startMoveRight = function () {
  // TODO magic number
  Player.speedVector.x += 1;
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
  Player.pos.y = Layout.playerBounds_rect.bottom - Player.image.height * GAME.PLAYER_DRAW_SCALE;
  Player.xLimitLeft = Layout.playerBounds_rect.left;
  Player.xLimitRight = Layout.playerBounds_rect.right - Player.image.width * GAME.PLAYER_DRAW_SCALE;
};

/**
 * @function update
 * @static
 *
 * @description
 * ##### Update some properties of the player
 * - The position to be drawn at
 * - If currently damaged, or eating, decrement the counters for those states
 *
 */
Player.update = function () {
  Player.pos.x += Player.speedVector.x;
  Player.pos.x = Math.max(Player.xLimitLeft, Math.min(Player.pos.x, Player.xLimitRight));
  if (Player.speedVector.x != 0) {
    // TODO magic number
    Player.speedVector.x *= 0.95;
  }
};

/**
 * @function draw
 * @static
 *
 * @description
 * ##### Draw the character
 * - If currently being damaged, flash a different colour based on the level background
 * - If currently eating, flash a different colour based on the eaten obstacle
 * - Draw the tail/friction effect
 * - At faster speeds, distort the circular shape into an ellipse to suggest stretching in the direction of travel
 * - Add any extra layers such as hats etc
 */
Player.draw = function () {
  var color, playerDrawnPosX, playerDrawnPosY;

  playerDrawnPosX = Player.pos.x;
  //playerDrawnPosX = Player.pos.x + Layout.gameAreaOffsetLateral;
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
      // TODO magic number
      Player.image.width * GAME.PLAYER_DRAW_SCALE,
      Player.image.height * GAME.PLAYER_DRAW_SCALE,
    );
  }
};

export { Player };
