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
};

/*
 *
 *
 * Player
 *
 */

export const PLAYER_DRAW_SCALE = 4;
export const ENEMY_DRAW_SCALE = 4;
export const ENEMY_DRAW_PAD = 5;
export const ENEMY_WIGGLE_ANIM_FRAMES = 20;

/*
 *
 *
 * Things
 *
 */

// For non-moving things (eg trees), setting speed to 0 can cause errors/bugs relating to dividing/multiplying by 0, so use this value instead
export const STATIC_THING_SPEED = Number.MIN_VALUE;

export const TEXT_BACKGROUND_FILL_ALPHA = 0.66;

export const INSTRUCTIONTEXT_COLOR = "#ff4444";

/*
 *
 *
 * Text
 *
 */
// Best not to have this lower than 2 as it causes some padding values to end up as low fractions below 1 and get rounded weirdly, then layout issues
export const TEXT_BG_PADDING_TO_CHARWIDTH_RATIO = 2;

export const TEXT_DEFAULT_SHADOW_COLOR = "#000000";

export const SCALED_TEXT_SPACINGROWTH_DIVISOR = 1;
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
