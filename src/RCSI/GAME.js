/**
 * @license GPL-3.0-only
 *
 * @author Mark Mayes / mm-dev
 *
 *
 * @module RCSI/GAME
 *
 * @description
 * ## Lots of configuration for the game, including:
 * - Portrait/landscape layout details for UI elements
 * - Frame rate/timings
 * - Tweakable controls affecting difficulty, playability etc
 */

import { KEY_ACTIONS, HORIZ_ALIGN, VERT_ALIGN } from "./ENUM.js";
import * as STRING from "./STRING.js";

/*
 *
 *
 * General
 *
 */

/** @constant
    @type {object}
    @default
*/
export const BITMAPIMAGE_DEFAULT_OPTIONS = { resizeQuality: "pixelated" };

/** @constant
    @type {number}
    @default
*/
export const PIXEL_SCALE = Math.max(Math.min(Math.ceil(window.devicePixelRatio), 2), 1);

/** @constant
    @type {number}
    @default
*/
export const SCALING_TARGET_SIZE = 1000;

/** @constant
    @type {number}
    @default
*/
export const TARGET_FPS = 60;

/** @constant
    @type {number}
    @default
*/
export const FRAME_MS = Math.floor(1000 / TARGET_FPS);

export const PIx2 = Math.PI * 2;

export const ONRESIZE_UPDATE_DELAY_MS = 200;

// Affects speed that background moves laterally compared to foreground objects (suggests distance/parallax)
export const BACKGROUND_LATERAL_MULTIPLIER = 0.2;
export const FLOATING_LATERAL_MULTIPLIER = 1;

export const MAINTITLE_WIDTH_PX = 800;
export const MAINTITLE_HEIGHT_PX = 200;

export const MAIN_PADDING_PX = 30;

export const VERSIONNUMBER_COLOR = "#8a0500";

// For FPS counter, how many recent FPS counts are stored and averaged
export const FPSDISPLAY_AVERAGE_FRAMES_SPAN = TARGET_FPS * 7;

export const UI_PORTRAIT = {
  levelText: {
    alignV: VERT_ALIGN.TOP,
    alignH: HORIZ_ALIGN.LEFT,
  },
  score: {
    alignV: VERT_ALIGN.TOP,
    alignH: HORIZ_ALIGN.RIGHT,
  },
  mainTitle: {
    sizeRatio: 0.85,
    alignV: VERT_ALIGN.TOP,
    alignH: HORIZ_ALIGN.CENTER,
    offsetByCharsV: 2,
  },
  versionInfoLevelIntro: {
    alignH: HORIZ_ALIGN.CENTER,
    alignV: VERT_ALIGN.BOTTOM,
  },
  fps: {
    alignV: VERT_ALIGN.BOTTOM,
    alignH: HORIZ_ALIGN.CENTER,
    offsetByCharsV: -1,
  },
};

/*
 *
 *
 * Scoring
 *
 */
export const SCORE_PER_SEC_REMAINING = 10;
export const SCORE_PER_LEVEL_MULTIPLIER = 1.1;

/*
 *
 *
 * Timer
 *
 */
export const TIME_LOW_SECONDS = 10;

/*
 *
 *
 * Player
 *
 */

export const PLAYER_DRAW_SCALE = 4;
export const ENEMY_DRAW_SCALE = 4;
export const ENEMY_DRAW_PAD = 2;
export const ENEMY_WIGGLE_ANIM_FRAMES = 20;

export const PLAYER_DAMPSPEED_MULTIPLIER = 7;

// length of 'player eats' animation in frames
export const PLAYEREATS_SECS_TOTAL = 0.8;
export const PLAYEREATS_FLASH_ON_SECS = 0.3;
export const PLAYEREATS_FLASH_OFF_SECS = 0.1;

export const PLAYER_LOSSOFCONTROL_MAGNITUDE_DIVISOR = 3000;
export const PLAYER_LOSSOFCONTROL_MAX_SECS = 4;

export const DAMAGED_SECS_TOTAL = 0.8;

// size of throb
export const PLAYEREATS_RADIUS_GROWTH = 0.1;
export const EATEN_THING_INITIAL_GROWTH = 1.33;
export const EATEN_THING_ALPHA = 0.33;

// Tail shows above this speed
export const PLAYER_TAIL_MINSPEED = 1;
export const PLAYER_ELLIPSE_STRETCH_MULTIPLIER = 0.01;
// Used to calculate distance between tail segments
export const PLAYER_TAILLENGTH_MULTIPLIER = 0.005;
export const PLAYER_TAIL_ALPHA = 0.13;
export const PLAYER_TAIL_ALPHA_DROP = 0.023;
export const PLAYER_TAIL_RADIUS_GROWTH = 1.08;
// Used to convert player speed to number of tail segments
export const PLAYER_SPEED_TO_TAILSEGMENTS_MULTIPLIER = 0.7;
export const PLAYER_HEAD_ALPHA = 1;
export const PLAYER_OUTLINE_ALPHA = 0.5;
export const PLAYER_OUTLINE_THICKNESS = 5;

export const PLAYER_TAILCOLOR_DARKLEVEL = "#ffffff";
export const PLAYER_TAILCOLOR_LIGHTLEVEL = "#dddddd";

export const PLAYER_GRIN_INCREASERATE = 1.333;

export const DAMAGE_FLASH_ON_SECS = 0.3;
export const DAMAGE_FLASH_OFF_SECS = 0.1;
/*
 *
 *
 * Things
 *
 */

// For non-moving things (eg trees), setting speed to 0 can cause errors/bugs relating to dividing/multiplying by 0, so use this value instead
export const STATIC_THING_SPEED = Number.MIN_VALUE;

export const THING_FADE_GRADIENT_STOP = 0.7;

// Prevent player getting stuck inside thing by rendering it unable to inflict damage for a few frames
export const DAMAGE_SAFETY_SECS_TOTAL = DAMAGED_SECS_TOTAL;

export const EXPLODING_FRAMES_TOTAL = 50;

export const EXPLODING_FRAMES_REDUCE_SPEED_MULTIPLIER_MIN = 0.7;
export const EXPLODING_FRAMES_REDUCE_SPEED_MULTIPLIER_MAX = 0.9;

export const EXPLODING_FRAMES_REDUCE_RADIUS_MULTIPLIER_MIN = 0.7;
export const EXPLODING_FRAMES_REDUCE_RADIUS_MULTIPLIER_MAX = 0.99;

export const EXPLODING_FRAMES_ANGLE_INCREASE_MIN = 0.05;
export const EXPLODING_FRAMES_ANGLE_INCREASE_MAX = 0.15;

export const EXPLODING_THING_ALPHA = 1;

export const SHAPE_STROKE_THICKNESS = 7;
export const SHAPE_STROKE_ALPHA = 0.6;

export const INTRO_THING_GROUP_COLS = 7;
export const INTRO_THING_DEFAULT_ROTATION = 315;

export const THING_RETURNTONORMALSPEED_RATE = 0.1;

export const FLOATING_THING_LEVELOUTRO_ACCEL_RATE = 0.1;

export const TEXT_BACKGROUND_FILL_ALPHA = 0.66;

export const INSTRUCTIONTEXT_COLOR = "#ff4444";

export const OVERLAY_ACCENT_COLOR = "rgba(128, 128, 128, 1)";
export const TITLE_COLOR = "#00ffff";

export const OVERLAY_TEXT_ALIGN_H = HORIZ_ALIGN.CENTER;
export const OVERLAY_TEXT_ALIGN_V = VERT_ALIGN.CENTER;
export const LEVEL_INTRO_CIRCLE_RADIUS_PX = 30;

/*
 *
 *
 * Text
 *
 */
export const TEXT_BLANKLINE = { text: " ", color: "transparent" };
// Best not to have this lower than 2 as it causes some padding values to end up as low fractions below 1 and get rounded weirdly, then layout issues
export const TEXT_BG_PADDING_TO_CHARWIDTH_RATIO = 2;

export const TEXT_DEFAULT_SHADOW_COLOR = "#000000";

export const TEXT_FLASH_ON_SECS = 1.9;
export const TEXT_FLASH_OFF_SECS = 0.2;

export const SCALED_TEXT_SPACINGROWTH_DIVISOR = 1;
export const BITMAPFONT_SPRITESHEET_CHAR_WIDTH = 128;
export const BITMAPFONT_SPRITESHEET_CHAR_HEIGHT = 128;
export const BITMAPFONT_SPRITESHEET_COLS = 8;
// Used to calculate font sizes ie we want to fit this many characters in the
// width of the canvas
export const CHARS_IN_CANVAS_WIDTH = 23;
export const CHARS_IN_CANVAS_HEIGHT = 21;

// Characters in the order they appear in the spritesheet
export const CHARS_IN_SPRITESHEET_AR = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "-",
  STRING.HEART,
  "!",
  "©",
  "/",
  STRING.SOUND_DISABLED,
  STRING.SOUND_ENABLED,
  STRING.FULLSCREEN,
  STRING.CLOCK,
  ".",
];

export const KEYS = {
  ArrowLeft: KEY_ACTIONS.MOVE_LEFT,
  ArrowRight: KEY_ACTIONS.MOVE_RIGHT,
  ArrowUp: KEY_ACTIONS.FIRE,
  Space: KEY_ACTIONS.START_GAME,
};
