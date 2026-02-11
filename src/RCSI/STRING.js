/**
 * @license GPL-3.0-only
 *
 * @author Mark Mayes / mm-dev
 *
 *
 * @module PD/STRING
 *
 * @description
 * ## Strings used in the game
 */


// These strings will be replaced by characters from the font bitmap, the choice of strings is arbitraty but they must match up with the expectations of `Text.getCharCoordsInSpritesheet()`
export const HEART="♥";
export const SOUND_ENABLED = "Ö"; // ASCII 214
export const SOUND_DISABLED = "Ø"; // ASCII 216
export const FULLSCREEN = "‡"; // ASCII 8225
export const CLOCK = "½"; // ASCII 8225
// Used to represent any unknown character, to prevent crashes due to bitmap
// fonts characters being missing
export const UNKNOWN_CHARACTER = "unknownChar";

export const GAMEOVER_TEXT = "GAME OVER";
export const GAMEOVER_TIMESUP_TEXT = "OUT OF TIME";
export const GAMEOVER_HEALTHDEPLETED_TEXT = "DEAD";
export const GAMEOVER_GAMECOMPLETED_TEXT = "COMPLETED!";

export const HIT_TO_REPLAY = "HIT TO REPLAY";
export const HIT_TO_START = "HIT TO START";
export const REMAINING = "MISSED";

export const EXIT_FULLSCREEN = "[ ESC ] EXITS FULLSCREEN";

export const FINAL_SCORE = "FINAL SCORE";
export const CURRENT_SCORE = "TOTAL SCORE";

export const STARTLEVEL_TEXT = "START LEVEL ";
export const LEVEL_TEXT = "LEVEL";
export const LEVEL_PADSTRING = "00";
export const NO_LEVEL = "..";

export const TIME_TEXT = CLOCK + " ";
export const TIME_PADSTRING = "000";

export const COLLECT_PADSTRING = "0000";


export const COLLECT_TEXT = "EAT";
export const AVOID_TEXT = "AVOID";

export const ASSETS_LOADING = "PIPEDREAM LOADING";

export const LEVEL_COMPLETED = "COMPLETED!";
export const TIME_REMAINING = "SECS REMAINING";
export const LEVEL_SCORE = "LEVEL SCORE - ";
