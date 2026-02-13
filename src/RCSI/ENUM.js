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
export const GAMEOVER_REASON = {
  TIMES_UP: "gameOverReasonTimesUp",
  HEALTH_DEPLETED: "gameOverReasonHealthDepleted",
  GAME_COMPLETED: "gameOverReasonGameCompleted",
};

/** 
* @readonly
* @enum {string}
*/
export const OBSTACLE_TYPE = {
  COLLECT: "obstacleTypeCollect",
  AVOID: "obstacleTypeAvoid",
  BACKGROUND: "obstacleTypeBackground",
  FLOATING: "obstacleTypeFloating",
  LEVELINTRO: "obstacleTypeLevelIntro",
};

/** 
* @readonly
* @enum {string}
*/
export const OBSTACLE_SUBTYPE = {
  FLOWER: "obstacleSubtypeFlower",
  SQUARCLE: "obstacleSubtypeSquarcle",
  STAR: "obstacleSubtypeStar",
  SKEWED_CIRCLE: "obstacleSubtypeSkewedCircle",
};

/** 
* @readonly
* @enum {string}
*/
export const ADDED_LAYER = {
  SPOKES: "addedLayerSpokes",
  MOUTH: "addedLayerMouth",
  EYES: "addedLayerEyes",
  STETSON: "addedLayerStetson",
  BOWLER: "addedLayerBowler",
  STEM: "addedLayerStem",
  DOT: "addedLayerDot",
  TRIANGLES: "addedLayerTriangles",
};

/** 
* @readonly
* @enum {string}
*/
export const ASPECT_RATIO = {
  LANDSCAPE: "aspectRatioLandscape",
  PORTRAIT: "aspectRatioPortrait",
};

/** 
* @readonly
* @enum {string}
*/
export const RECTANGLE = {
  CANVAS: "rectangleCanvas",
  GAMEAREA: "rectangleGameArea",
  BACKGROUND: "rectangleBackground",
  FLOATING: "rectangleFloating",
  SOUNDTOGGLEICON: "rectangleSoundToggleIcon",
  MAINTITLE: "rectangleMainTitle",
  FULLSCREENICON: "rectangleFullscreenIcon",
};

/** 
* @readonly
* @enum {string}
*/
export const GRADIENT_TYPE = {
  LINEAR: "gradientTypeLinear",
  RADIAL: "gradientTypeRadial",
  LINEAR_TUMBLING: "gradientTypeLinearTumbling",
  RADIAL_TUMBLING: "gradientTypeRadialTumbling",
};

/** 
* @readonly
* @enum {string}
*/
export const VERT_ALIGN = {
	TOP: "verticalAlignmentTop",
	CENTER: "verticalAlignmentCenter",
	BOTTOM: "verticalAlignmentBottom",
}

/** 
* @readonly
* @enum {string}
*/
export const HORIZ_ALIGN = {
	LEFT: "horizontalAlignmentLeft",
	CENTER: "horizontalAlignmentCenter",
	RIGHT: "horizontalAlignmentRight",
}

/** 
* @readonly
* @enum {string}
*/
export const TIMER_ID = {
	LEVELOUTRO_END: "timerIdLevelOutroEnd",
	LEVELINTRO_ADD_OBSTACLES: "timerIdLevelIntroAddObstacles",
	TEXT_FADEOUT_START: "timerIdTextFadeoutStart",
	TEXT_FADEIN_START: "timerIdTextFadeinStart",
	LEVELINTRO_END: "timerIdLevelIntroEnd",
}

/** 
* @readonly
* @enum {string}
*/
export const FADE_DIRECTION = {
	IN: "fadeDirectionIn",
	OUT: "fadeDirectionOut",
}

/** 
* @readonly
* @enum {string}
*/
export const LEVEL_TRANSITION_PROPERTY_TYPE = {
	COLOR: "levelTransitionPropertyTypeColor",
	NUMBER: "levelTransitionPropertyTypeNumber",
}
