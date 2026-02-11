/**
 * @license GPL-3.0-only
 *
 * @author Mark Mayes / mm-dev
 *
 *
 * @module PD/IMAGE_DATA
 *
 * @description
 * ## Info about image assets
 * - Used by `AssetPreloader` so it knows what to load
 * - Used by `BitmapText` to help understand the bitmap font spritesheet images
 */


import * as IMAGE_IDS from "./IMAGE_IDS.js";

export const IMAGE_AR = [
  {
    // https://robey.lag.net/2010/01/23/tiny-monospace-font.html
    id: IMAGE_IDS.IMG_FONT_SPRITESHEET_3x5,
    file: "images/tom-thumb-3x5.png",
    width: 3,
    height: 5,
    lineSpacing: 3,
    letterSpacing: 1,
    multiples: [1, 2, 4, 8, 16, 32],
  },
  {
    // https://simplifier.neocities.org/4x4
    id: IMAGE_IDS.IMG_FONT_SPRITESHEET_3x3,
    file: "images/simplifier-3x3.png",
    isSmallestFont: true,
    width: 3,
    height: 3,
    lineSpacing: 2,
    letterSpacing: 1,
  },
  {
    id: IMAGE_IDS.MAIN_TITLE,
    file: "images/title.png",
  },
];
