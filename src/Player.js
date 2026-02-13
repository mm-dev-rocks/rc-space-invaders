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

import { ASPECT_RATIO } from "./RCSI/ENUM.js";
import * as GAME from "./RCSI/GAME.js";

import { Layout } from "./Layout.js";

import { Controller } from "./Controller.js";
import { Display } from "./Display.js";
import { Game } from "./Game.js";
import { Shape } from "./Shape.js";

import { hexOpacityToRGBA, vectorToDegrees } from "./utils.js";

class Player {
  static get drawnRadius() {
    return Player.radius * Layout.proportionalMultiplier;
  }

  static get speed() {
    return Controller.speedOffset;
  }

  static get velocityVector() {
    return Controller.scalarVectorOfTravel;
  }

  static get unitVector() {
    return Controller.normalisedVectorOfTravel;
  }
}

/**
 * @function init
 * @static
 *
 * @description
 * ##### Set a neutral start position
 */
Player.init = function () {
  Player.pos = { x: 0, y: 0 };
};

/**
 * @function setupForLevel
 * @static
 *
 * @description
 * ##### Set colour, health, size etc according to the current level configuration
 */
Player.setupForLevel = function () {
  Player.health = Game.curLevelData.startHealth;
  Player.radius = Game.curLevelData.player.radius;
  Player.originLongitudinal =
    GAME.PLAYER_ORIGIN_LONGITUDINAL * Layout.proportionalMultiplier;
  Player.growthDivisor = Game.curLevelData.player.growthDivisor;
  Player.color = Game.curLevelData.player.color;
  Player.damagedColor = Game.curLevelData.bgColor;
  Player.damagedFramesCounter = 0;
};

/**
 * @function updateSizes
 * @static
 *
 * @description
 * ##### Update some variables to fit the current layout
 */
Player.updateSizes = function () {
  if (Layout.sessionAspectRatio === ASPECT_RATIO.LANDSCAPE) {
    Player.pos.x = Math.round(Player.originLongitudinal);
    Player.pos.y = Math.round(Layout.gameplayHeight / 2);
  } else {
    Player.pos.x = Math.round(Layout.gameplayWidth / 2);
    Player.pos.y = Math.round(Player.originLongitudinal);
  }

  //Player.speedCentre =
  //  Player.originLongitudinal * Layout.proportionalMultiplier;

  Player.outlineThickness = Math.round(
    GAME.PLAYER_OUTLINE_THICKNESS * Layout.proportionalMultiplier
  );

  Player.dampSpeedMultiplier =
    GAME.PLAYER_DAMPSPEED_MULTIPLIER * Layout.proportionalMultiplier;
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
  var speedOffset = Controller.speedOffset * Player.dampSpeedMultiplier;
  if (Layout.sessionAspectRatio === ASPECT_RATIO.LANDSCAPE) {
    Player.pos.x = Player.originLongitudinal + speedOffset;
  } else {
    Player.pos.y = Player.originLongitudinal + speedOffset;
  }
  if (Player.damagedFramesCounter > 0) {
    Player.damagedFramesCounter--;
    if (Player.damagedFramesCounter === 0) {
      Controller.damageAddedSlipperiness = 0;
    }
  }
  if (Player.playerEatsFramesCounter > 0) {
    Player.playerEatsFramesCounter--;
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
  var i,
    color,
    tailColor,
    segmentColor,
    playerDrawnPosX,
    playerDrawnPosY,
    segmentX,
    segmentY,
    ellipseStretch,
    drawnRadius = Player.drawnRadius,
    xOffset =
      Controller.scalarVectorOfTravel.x * GAME.PLAYER_TAILLENGTH_MULTIPLIER,
    yOffset =
      Controller.scalarVectorOfTravel.y * GAME.PLAYER_TAILLENGTH_MULTIPLIER,
    radiusExtra = 1,
    numSegments = Math.max(
      1,
      Math.floor(
        Controller.speedOffset * GAME.PLAYER_SPEED_TO_TAILSEGMENTS_MULTIPLIER
      )
    );

  // Color
  if (
    Player.damagedFramesCounter > 0 &&
    Display.flashIsOff(GAME.DAMAGE_FLASH_ON_SECS, GAME.DAMAGE_FLASH_OFF_SECS)
  ) {
    color = Player.damagedColor;
  } else if (
    Player.playerEatsFramesCounter > 0 &&
    Display.flashIsOff(
      GAME.PLAYEREATS_FLASH_ON_SECS,
      GAME.PLAYEREATS_FLASH_OFF_SECS
    )
  ) {
    color = Player.eatenColor;
    radiusExtra += GAME.PLAYEREATS_RADIUS_GROWTH;
  } else {
    color = Player.color;
  }

  // Player position
  if (Display.isLandscapeAspect) {
    // TODO confusing variable name
    playerDrawnPosX = Player.pos.x;
    playerDrawnPosY = Player.pos.y + Layout.gameAreaOffsetLateral;
  } else {
    playerDrawnPosX = Player.pos.x + Layout.gameAreaOffsetLateral;
    playerDrawnPosY = Player.pos.y;
  }

  // Ellipse stretch
  ellipseStretch = 1;
  if (Controller.speedOffset > GAME.PLAYER_TAIL_MINSPEED) {
    ellipseStretch +=
      Controller.speedOffset * GAME.PLAYER_ELLIPSE_STRETCH_MULTIPLIER;
  } else {
    numSegments = 0;
  }

  if (Display.levelIsDark) {
    tailColor = GAME.PLAYER_TAILCOLOR_DARKLEVEL;
  } else {
    tailColor = GAME.PLAYER_TAILCOLOR_LIGHTLEVEL;
  }

  // Draw segments
  for (i = 0; i < numSegments; i++) {
    segmentColor = hexOpacityToRGBA(
      tailColor,
      Math.max(0, GAME.PLAYER_TAIL_ALPHA - GAME.PLAYER_TAIL_ALPHA_DROP * i)
    );

    // Segment position
    segmentX = Math.round(playerDrawnPosX - xOffset * i);
    segmentY = Math.round(playerDrawnPosY - yOffset * i);

    Shape.drawEllipse(
      segmentX,
      segmentY,
      drawnRadius * radiusExtra,
      segmentColor,
      ellipseStretch,
      Controller.angleOfTravel
    );

    radiusExtra *= GAME.PLAYER_TAIL_RADIUS_GROWTH;
  }

  // Main player piece
  Shape.drawEllipse(
    playerDrawnPosX,
    playerDrawnPosY,
    drawnRadius,
    hexOpacityToRGBA(color, GAME.PLAYER_HEAD_ALPHA),
    ellipseStretch,
    Controller.angleOfTravel
  );
  Display.ctx.strokeStyle = hexOpacityToRGBA(
    Display.bgColor,
    GAME.PLAYER_OUTLINE_ALPHA
  );
  Display.ctx.lineWidth = Player.outlineThickness;
  Display.ctx.stroke();

};

export { Player };
