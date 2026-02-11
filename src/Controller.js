/**
 * @license GPL-3.0-only
 *
 * @author Mark Mayes / mm-dev
 *
 *
 * @module Controller
 *
 * @description
 * ## An area of the screen used to control player movement
 * - One axis controls **speed**
 * - The other controls **lateral movement**
 *   - In portrait orientation, lateral is side-to-side
 *   - In landscape it's top-to-bottom
 *
 *
 * This class keeps track of the position of the pointer (or touches on a touchscreen) and converts it to variables which other classes inspect, eg:
 *
 * - `Controller.speedOffset` - Used to calculate speed of forward movement
 * - `Controller.lateralOffset` - Used to calculate amount of lateral movement (steering)
 */

import { ASPECT_RATIO } from "./PD/ENUM.js";
import * as GAME from "./PD/GAME.js";

import { Display } from "./Display.js";
import { Layout } from "./Layout.js";
import { Player } from "./Player.js";

import { Game } from "./Game.js";

import {
  getNearestEvenNumber,
  hexOpacityToRGBA,
  modulo,
  vectorGetMagnitude,
  vectorToDegrees,
} from "./utils.js";

class Controller {}

/**
 * @function init
 * @static
 *
 * @description
 * ##### Initialise the controller
 */
Controller.init = function () {
  Controller.speedOffset = 0;
  Controller.lateralOffset = 0;
  Controller.normalisedPointerDistanceFromCenter = 0.5;
};

/**
 * @function setupForLevel
 * @static
 *
 * @description
 * ##### Level data can alter parameters such as speed ranges and slipperiness
 * - Adjust according to the parameters
 * - Reset some other variables ready for the new level
 */
Controller.setupForLevel = function () {
  // TODO Should this be done on every frame as it takes the (changing) player radius into account?
  //Controller.updateLateralMultiplier();

  Controller.speedDamp =
    Game.curLevelData.controllerSpeedDamp || GAME.CONTROLLER_SPEED_DAMP;

  Controller.slipperiness =
    Game.curLevelData.controllerSlipperiness || GAME.CONTROLLER_SLIPPERINESS;

  Controller.damageAddedSlipperiness = 0;
};

/**
 * @function updateSizes
 * @static
 *
 * @description
 * ##### Called on first run and when viewport changes size
 */
Controller.updateSizes = function () {
  Controller.cornerRadius = Math.round(
    GAME.CONTROLLER_CORNER_RADIUS * Layout.proportionalMultiplier
  );

  Controller.arrowWidth = Math.round(
    GAME.CONTROLLER_ARROW_WIDTH * Layout.proportionalMultiplier
  );
  Controller.arrowThickness = getNearestEvenNumber(
    GAME.CONTROLLER_STICK_THICKNESS * Layout.proportionalMultiplier
  );

  Controller.updateLayout();
};

/**
 * @function updateLateralMultiplier
 * @static
 *
 * @description
 * ##### Adjust steering based on size and aspect ratio of the viewport
 */
Controller.updateLateralMultiplier = function () {
  var playerAllowance = Player.drawnRadius ? Player.drawnRadius * 2 : 0;

  if (Layout.sessionAspectRatio === ASPECT_RATIO.LANDSCAPE) {
    Controller.lateralMultiplier =
      (Layout.gameplayHeight - playerAllowance) /
      Layout.currentAspectUI.controller.height;
  } else {
    Controller.lateralMultiplier =
      (Layout.gameplayWidth - playerAllowance) /
      Layout.currentAspectUI.controller.width;
  }
};

/**
 * @function updatePointerPos
 * @static
 *
 * @description
 * ##### This is where speed and direction get set
 * - `Controller.stickPos` is the important object
 * - Like a real-world joystick, it's the cardinal to refer to to find what is happening in terms of speed and steering
 *
 * @param {number} _x - X coordinate of the pointer or most recent touch event
 * @param {number} _y - Y coordinate of the pointer or most recent touch event
 */
Controller.updatePointerPos = function (_pos) {
  var aimDiffX,
    aimDiffY,
    right = Controller.activeArea_rect.right,
    left = Controller.activeArea_rect.left,
    top = Controller.activeArea_rect.top,
    bottom = Controller.activeArea_rect.bottom;
  
  Controller.updateLateralMultiplier();

  Controller.globalPointerPos = {
    x: _pos.x,
    y: _pos.y,
  };

  Controller.stickAimPos = {
    x: _pos.x,
    y: _pos.y,
  };

  // Cap movement to boundaries
  if (Controller.stickAimPos.x > right) {
    Controller.stickAimPos.x = right;
  } else if (Controller.stickAimPos.x < left) {
    Controller.stickAimPos.x = left;
  }
  if (Controller.stickAimPos.y > bottom) {
    Controller.stickAimPos.y = bottom;
  } else if (Controller.stickAimPos.y < top) {
    Controller.stickAimPos.y = top;
  }

  // Don't move stick to pointer immediately, apply some friction
  aimDiffX =
    (Controller.stickAimPos.x - Controller.stickPos.x) /
    (Controller.slipperiness + Controller.damageAddedSlipperiness);
  aimDiffY =
    (Controller.stickAimPos.y - Controller.stickPos.y) /
    (Controller.slipperiness + Controller.damageAddedSlipperiness);

  Controller.stickPos.x += aimDiffX;
  Controller.stickPos.y += aimDiffY;

  // Axes swap depending on whether game orientation is landscape or portrait
  if (Layout.sessionAspectRatio === ASPECT_RATIO.LANDSCAPE) {
    Controller.speedOffset =
      (Controller.stickPos.x - Controller.stickOrigin.x) / Controller.speedDamp;
    Controller.lateralOffset =
      (Controller.stickOrigin.y - Controller.stickPos.y) *
      Controller.lateralMultiplier;
  } else {
    Controller.speedOffset =
      (Controller.stickPos.y - Controller.stickOrigin.y) / Controller.speedDamp;
    Controller.lateralOffset =
      (Controller.stickOrigin.x - Controller.stickPos.x) *
      Controller.lateralMultiplier;
  }

  Controller.updateDirectionInfo();

  Controller.updatePointerDistanceFromCenter();
};

/**
 * @function updateDirectionInfo
 * @static
 *
 * @description
 * ##### Keep some direction-related variables up to date
 * Other classes refer to them to understand what the player is doing.
 * - `Controller.scalarVectorOfTravel` - A vector representing the direction the player is moving in
 * - `Controller.normalisedVectorOfTravel` - The same vector as above, only normalised to give `x` and `y` values between `-1` and `1` (removing the speed and just maintaining the angle)
 * - `Controller.vectorOfTravelMagnitude` - The speed alone
 * - `Controller.angleOfTravel` - The angle in degrees
 */
Controller.updateDirectionInfo = function () {
// TODO Global replace to `velocityVectorOfTravel`
  Controller.scalarVectorOfTravel = {
    x: Controller.stickPos.x - Controller.stickOrigin.x,
    y: Controller.stickPos.y - Controller.stickOrigin.y,
  };

  Controller.vectorOfTravelMagnitude = vectorGetMagnitude(
    Controller.scalarVectorOfTravel
  );

// TODO Global replace to `unitVectorOfTravel`
  Controller.normalisedVectorOfTravel = {
    x: Controller.scalarVectorOfTravel.x / Controller.vectorOfTravelMagnitude,
    y: Controller.scalarVectorOfTravel.y / Controller.vectorOfTravelMagnitude,
  };

  Controller.angleOfTravel = vectorToDegrees(Controller.scalarVectorOfTravel);
  // Rotate by 90 as that makes sense in our game space
  Controller.angleOfTravel += 90;
  Controller.angleOfTravel = modulo(Controller.angleOfTravel, 360);
};

/**
 * @function updatePointerDistanceFromCenter
 * @static
 *
 * @description
 * ##### The pointer distance from the centre of the control area is used to decide on opacity for the controller background
 * - The further away the pointer gets from the controller the more opaque the background becomes
 * - When the pointer is over the control area the background disappears
 * - This is intended to draw attention to the control area and educate the player on how it works
 */
Controller.updatePointerDistanceFromCenter = function () {
  var xDist = Math.abs(Controller.midX - Controller.globalPointerPos.x),
    yDist = Math.abs(Controller.midY - Controller.globalPointerPos.y);

  Controller.pointerDistanceFromCenter = Math.sqrt(
    xDist * xDist + yDist * yDist
  );

  // Represent distance as number between 0 and 1
  Controller.normalisedPointerDistanceFromCenter =
    Controller.pointerDistanceFromCenter /
    Controller.maxPossibleDistanceFromCenter;
};

/**
 * @function setOrigin
 * @static
 *
 * @description
 * ##### The origin of the stick is used to work out how far it is being pushed and calculate steering/speed
 * - The origin is not necessarily the centre of the control area
 * - When viewpoort layout changes, the origin must be recalculated
 * - Although there is no visible stick, it exists conceptually (the arrow represents the top of the stick)
 */
Controller.setOrigin = function () {
  var ui = Layout.currentAspectUI;

  if (Layout.sessionAspectRatio === ASPECT_RATIO.LANDSCAPE) {
    Controller.stickOrigin = {
      x:
        Controller.posX +
        ui.controller.width * GAME.CONTROLLER_STICK_MIDPOS_SPEED,
      y:
        Controller.posY +
        ui.controller.height * GAME.CONTROLLER_STICK_MIDPOS_LATERAL,
    };
  } else {
    Controller.stickOrigin = {
      x:
        Controller.posX +
        ui.controller.width * GAME.CONTROLLER_STICK_MIDPOS_LATERAL,
      y:
        Controller.posY +
        ui.controller.height * GAME.CONTROLLER_STICK_MIDPOS_SPEED,
    };
  }

  // return stick to origin
  Controller.stickPos = {
    x: Controller.stickOrigin.x,
    y: Controller.stickOrigin.y,
  };
};

/**
 * @function updateLayout
 * @static
 *
 * @description
 * ##### Whenever the viewport size/aspecct ratio changes, we must recalibrate the controller
 */
Controller.updateLayout = function () {
  var xDistMax,
    yDistMax,
    ui = Layout.currentAspectUI,
    pos = Layout.getAlignedPos(
      ui.controller.alignH,
      ui.controller.alignV,
      ui.controller.width,
      ui.controller.height
    );

  Controller.posX = pos.x;
  Controller.posY = pos.y;

  Controller.setOrigin();

  Controller.activeArea_rect = {
    left: pos.x - GAME.CONTROLLER_ACTIVE_PADDING_PX,
    top: pos.y - GAME.CONTROLLER_ACTIVE_PADDING_PX,
    right: pos.x + ui.controller.width + GAME.CONTROLLER_ACTIVE_PADDING_PX,
    bottom: pos.y + ui.controller.height + GAME.CONTROLLER_ACTIVE_PADDING_PX,
  };

  Controller.midX =
    Controller.activeArea_rect.left +
    (Controller.activeArea_rect.right - Controller.activeArea_rect.left) / 2;
  Controller.midY =
    Controller.activeArea_rect.top +
    (Controller.activeArea_rect.bottom - Controller.activeArea_rect.top) / 2;

  // Calculate largest possible distance pointer can be from the center of the
  // controller
  xDistMax = Math.abs(Layout.canvas_rect.left - Controller.midX);
  yDistMax = Math.abs(Layout.canvas_rect.top - Controller.midY);
  //__("xDistMax: " + xDistMax);
  //__("yDistMax: " + yDistMax);
  Controller.maxPossibleDistanceFromCenter = Math.sqrt(
    xDistMax * xDistMax + yDistMax * yDistMax
  );

  // Calculate largest possible distance stick can be from its origin
  xDistMax = Math.abs(
    Controller.activeArea_rect.left - Controller.stickOrigin.x
  );
  yDistMax = Math.abs(
    Controller.activeArea_rect.top - Controller.stickOrigin.y
  );
  Controller.maxPossibleStickDistanceFromOrigin = Math.sqrt(
    xDistMax * xDistMax + yDistMax * yDistMax
  );
};

/**
 * @function draw
 * @static
 *
 * @description
 * ##### Draw the controller to the canvas
 * - Set the opacity of the background based on how far away the pointer is
 * - Hide the background when the pointer is over the control area (if this is true, the [human] player must be controlling the [in-game] player)
 * - Call another method to draw the arrow
 */
Controller.draw = function () {
  var fillColor,
    fillAlpha,
    ui = Layout.currentAspectUI,
    itemPos = Layout.getAlignedPos(
      ui.controller.alignH,
      ui.controller.alignV,
      ui.controller.width,
      ui.controller.height
    );

  // bg
  if (!Game.pointerIsOverActiveArea) {
    Display.ctx.globalCompositeOperation = "luminosity";
    fillAlpha = Math.min(
      GAME.CONTROLAREA_OVERLAY_ALPHA_MAX,
      GAME.CONTROLAREA_OVERLAY_ALPHA_MIN +
        (GAME.CONTROLAREA_OVERLAY_ALPHA_MAX -
          GAME.CONTROLAREA_OVERLAY_ALPHA_MIN) *
          Controller.normalisedPointerDistanceFromCenter
    );
    fillColor = hexOpacityToRGBA(
      GAME.CONTROLAREA_OVERLAY_SOLID_COLOR,
      fillAlpha
    );
    Display.ctx.fillStyle = fillColor;

    if (Display.hasRoundRect) {
      Display.ctx.roundRect(
        itemPos.x,
        itemPos.y,
        ui.controller.width,
        ui.controller.height,
        Controller.cornerRadius
      );
      Display.ctx.fill();
    } else {
      Display.ctx.fillRect(
        itemPos.x,
        itemPos.y,
        ui.controller.width,
        ui.controller.height
      );
    }
    Display.ctx.globalCompositeOperation = "source-over";
  }
  Controller.drawArrow();
};

/**
 * @function drawArrow
 * @static
 *
 * @description
 * ##### Draw the arrow
 * - It gets more pointed to represent faster speeds
 * - The colour also changes to indicate speed
 */
Controller.drawArrow = function () {
  var arrowTipPos,
    stickX = Math.round(Controller.stickPos.x),
    stickY = Math.round(Controller.stickPos.y);

  Display.ctx.lineWidth = Controller.arrowThickness;
  Display.ctx.lineCap = GAME.CONTROLLER_STICK_LINECAP;
  Display.ctx.beginPath();
  if (Display.isLandscapeAspect) {
    arrowTipPos = Math.round(
      stickX + Controller.speedOffset * GAME.CONTROLLER_SPEED_ARROW_MULTIPLIER
    );
    Display.ctx.moveTo(stickX, stickY - Controller.arrowWidth);
    Display.ctx.lineTo(arrowTipPos, stickY);
    Display.ctx.lineTo(stickX, stickY + Controller.arrowWidth);
  } else {
    arrowTipPos = Math.round(
      stickY + Controller.speedOffset * GAME.CONTROLLER_SPEED_ARROW_MULTIPLIER
    );
    Display.ctx.moveTo(stickX - Controller.arrowWidth, stickY);
    Display.ctx.lineTo(stickX, arrowTipPos);
    Display.ctx.lineTo(stickX + Controller.arrowWidth, stickY);
  }

  Display.ctx.strokeStyle = Display.textColorHighlight;
  Display.ctx.stroke();
  if (Controller.speedOffset > 0) {
    Display.ctx.strokeStyle = hexOpacityToRGBA(
      Display.textColor,
      Controller.speedOffset * GAME.CONTROLLER_SPEED_ALPHA_MULTIPLIER
    );
  }
  Display.ctx.stroke();

  // Fill inside with narrow overlay of level background colour
  Display.ctx.lineWidth = Controller.arrowThickness / 2;
  Display.ctx.strokeStyle = Display.bgColor;
  Display.ctx.stroke();
};

export { Controller };
