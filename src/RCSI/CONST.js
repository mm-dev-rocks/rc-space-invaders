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
 * - CSS formatting strings used to add colour to logging output
 *
 * **OTHER CONSTANTS ARE SPREAD OVER ALL FILES IN `./src/RCSI/`**
 */

import * as CLASSNAMES from "./CLASSNAMES.js";
import * as EL_IDS from "./EL_IDS.js";
import * as IMAGE_DATA from "./IMAGE_DATA.js";
import * as JSONFILES_DATA from "./JSONFILES_DATA.js";

export const RCSI = {
  FMT_ERROR: "font-weight: bold; color: white; background-color: red; ",
  FMT_INFO: "font-weight: bold; background-color: indigo; color: pink; ",
  FMT_IMAGEMANAGER: "background-color: brown; color: wheat; ",
  FMT_JSONMANAGER: "background-color: wheat; color: darkred; ",
  FMT_TEXT: "background-color: black; color: yellow; ",
  FMT_DISPLAY: "background-color: #b8b5b5; color: blue; ",
  FMT_LAYOUT: "background-color: cornflowerblue; color: black; ",
  FMT_GAME: "background-color: #111111; color: orange; ",

  IMAGE_DATA: IMAGE_DATA,
  JSONFILES_DATA: JSONFILES_DATA,
  CLASSNAMES: CLASSNAMES,
  EL_IDS: EL_IDS,
};
