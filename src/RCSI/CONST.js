/**
 * @license GPL-3.0-only
 *
 * @author Mark Mayes / mm-dev
 *
 *
 * @module RCSI/CONST
 *
 * @description
 * ## Main constants and data eg
 * - CSS formatting strings used to colour logging output
 * - List of hash parameters that the app recognises
 *
 * **OTHER CONSTANTS ARE SPREAD OVER ALL FILES IN `./src/RCSI/`**
 */

import * as CLASSNAMES from "./CLASSNAMES.js";
import * as EL_IDS from "./EL_IDS.js";
import * as IMAGE_DATA from "./IMAGE_DATA.js";
import * as LEVELS from "./LEVELS.js";
import * as JSONFILES_DATA from "./JSONFILES_DATA.js";
import * as TIMINGS from "./TIMINGS.js";

export const RCSI = {
  FMT_ERROR: "font-weight: bold; color: white; background-color: red; ",
  FMT_INFO: "font-weight: bold; background-color: indigo; color: pink; ",
  FMT_AUDIO: "background-color: darkorange; color: lightyellow; ",
  FMT_IMAGEMANAGER: "background-color: brown; color: wheat; ",
  FMT_JSONMANAGER: "background-color: wheat; color: darkred; ",
  FMT_TEXT: "background-color: black; color: yellow; ",
  FMT_OVERLAYTEXT: "background-color: black; color: lime; ",
  FMT_DISPLAY: "background-color: #b8b5b5; color: blue; ",
  FMT_LAYOUT: "background-color: cornflowerblue; color: black; ",
  FMT_GAME: "background-color: #111111; color: orange; ",
  FMT_PERFORMANCE: "background-color: #ffffff; color: black; ",
  FMT_FULLSCREEN: "background-color: #00ff00; color: black; ",

  TIMINGS: TIMINGS,
  IMAGE_DATA: IMAGE_DATA,
  JSONFILES_DATA: JSONFILES_DATA,
  CLASSNAMES: CLASSNAMES,
  EL_IDS: EL_IDS,

  /**
   * @const IMPORTABLE_HASH_PARAMS
   * @type { String[] }
   *
   * @description
   * ##### Parameters to import from the URL/hash
   * - All other hash parameters will be ignored
   * - The hash gets rewritten to match the order of the array
   *
   * All level IDs are prepended to the array
   */
  IMPORTABLE_HASH_PARAMS: Object.keys(LEVELS.LEVEL_DATA)
    .map((levelId) => levelId.toLowerCase())
    .concat(["level", "mute", "fps", "debug"]),
};
