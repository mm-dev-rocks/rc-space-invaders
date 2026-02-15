/**
 * @license GPL-3.0-only
 *
 * @author Mark Mayes / mm-dev
 *
 *
 * @module Text
 *
 * @description
 * ## Manages the drawing of strings and groups of strings
 * - Can measure and lay out text
 * - Actual drawing of the pixels is passed over to `BitmapText`
 */

import * as GAME from "./RCSI/GAME.js";
import * as STRING from "./RCSI/STRING.js";

import { BitmapText } from "./BitmapText.js";
import { Display } from "./Display.js";
import { Game } from "./Game.js";
import { InternalTimer } from "./InternalTimer.js";
import { Layout } from "./Layout.js";
import { Player } from "./Player.js";

import { __, isEmpty, padString } from "./utils.js";
import { UI_PORTRAIT } from "./RCSI/GAME.js";

class Text {
  /** @type {number} */ static drawnCharWidth;
  /** @type {number} */ static drawnCharHeight;
  /** @type {number} */ static fullCharWidth;
  /** @type {number} */ static lineHeight;
  /** @type {number} */ static lineSpacing;
  /** @type {number} */ static letterSpacing;
  /** @type {number} */ static drawnPixelSize;

  /** @type {boolean} */ static useShortVersions;
}

Text.init = function () {
  BitmapText.init();
  BitmapText.chooseBestFittingFont();

  Text.useShortVersions = BitmapText.useShortVersions;
  Text.drawnCharWidth = BitmapText.drawnCharWidth;
  Text.drawnCharHeight = BitmapText.drawnCharHeight;
  Text.letterSpacing = BitmapText.letterSpacing;
  Text.fullCharWidth = BitmapText.fullCharWidth;
  Text.lineSpacing = BitmapText.lineSpacing;
  Text.lineHeight = BitmapText.lineHeight;
  Text.drawnPixelSize = BitmapText.spritesheetScale;

  // TODO should the rest of this method happen on eg `window.resize()`?
  BitmapText.precacheAllCharacters();
};

Text.setupForLevel = function (_ob) {
  Text.defaultColor = _ob.defaultColor;
  Text.accentColor = _ob.accentColor;
  Text.shadowColor = _ob.shadowColor;
};

Text.getStringWidth = function (_str) {
  return _str.length * Text.fullCharWidth - Text.letterSpacing;
};

Text.draw = function (_ob) {
  var i,
    color,
    colorSecondary,
    line_str,
    itemPos,
    currentText,
    lineWidth,
    flashing,
    blockWidth = 0,
    bgMeasurements,
    text_ar = Array.isArray(_ob.text) ? _ob.text : [_ob.text],
    lines_rect_ar = [];

  //__("_ob: " + JSON.stringify(_ob));

  // find max width
  for (i = 0; i < text_ar.length; i++) {
    currentText = text_ar[i];
    if (typeof currentText === "object") {
      currentText = currentText.text;
    }
    line_str = currentText;
    lineWidth = Text.getStringWidth(line_str);
    if (lineWidth > blockWidth) {
      blockWidth = lineWidth;
    }
  }

  itemPos = Layout.getAlignedPos(
    _ob.alignH,
    _ob.alignV,
    blockWidth,
    Text.lineHeight * text_ar.length,
    _ob.offsetH,
    _ob.offsetV,
  );

  // bg
  bgMeasurements = {
    left: itemPos.x - Layout.textBgPaddingProportional,
    top: itemPos.y - Layout.textBgPaddingProportional,
    width: blockWidth + Layout.textBgPaddingProportional * 2,
    height: Text.lineHeight * text_ar.length + Layout.textBgPaddingProportional * 2 - Text.lineSpacing,
  };

  if (_ob.drawBackground) {
    Display.ctx.fillStyle = Display.overlayBgColor;
    Display.ctx.fillRect(bgMeasurements.left, bgMeasurements.top, bgMeasurements.width, bgMeasurements.height);
  }

  for (i = 0; i < text_ar.length; i++) {
    // Presume the array contains bare strings
    currentText = text_ar[i];
    // But if the array contains objects, override
    if (typeof currentText === "object") {
      color = currentText.color || Text.defaultColor;
      colorSecondary = currentText.colorSecondary || Text.shadowColor;
      flashing = currentText.flashing;
      currentText = currentText.text;
    } else {
      color = _ob.color || Text.defaultColor;
      colorSecondary = _ob.colorSecondary || Text.shadowColor;
    }
    line_str = currentText;
    lineWidth = Text.getStringWidth(line_str);

    if (
      !_ob.measureOnly &&
      !isEmpty(line_str) &&
      (!flashing || !Display.flashIsOff(GAME.TEXT_FLASH_ON_SECS, GAME.TEXT_FLASH_OFF_SECS))
    ) {
      BitmapText.lineToBitmap(
        line_str,
        Math.round(itemPos.x + (blockWidth - lineWidth) / 2),
        Math.round(itemPos.y + Text.lineHeight * i),
        color,
        colorSecondary,
      );
    }

    lines_rect_ar[i] = {
      left: itemPos.x,
      right: itemPos.x + lineWidth + (blockWidth - lineWidth) / 2,
      top: itemPos.y + Text.lineHeight * i,
      bottom: itemPos.y + Text.lineHeight * (i + 1),
    };
  }

  // return info about drawn text
  return {
    bgMeasurements: bgMeasurements,
    blockWidth: blockWidth,
    lines_rect_ar: lines_rect_ar,
  };
};

Text.drawLevel = function () {
  var levelNumber = Game.isInLevelOutro || Game.isInGameOver ? STRING.NO_LEVEL : Game.levelsCompletedThisSession + 1,
    str = Text.useShortVersions
      ? Game.curLevelId + " " + padString(levelNumber, STRING.LEVEL_PADSTRING)
      : padString(levelNumber, STRING.LEVEL_PADSTRING) +
        "/" +
        padString(Game.lastLevelIndex, STRING.LEVEL_PADSTRING) +
        " " +
        Game.curLevelId;

  Text.draw({
    text: str,
    drawBackground: true,
    alignH: UI_PORTRAIT.levelText.alignH,
    alignV: UI_PORTRAIT.levelText.alignV,
    color: Text.accentColor,
  });
};

Text.drawVersionInfo = function (_ob) {
  var alignH,
    alignV,
    offsetV,
    offsetH,
    str = window.RcSpaceInvaders.versionInfo.displayString.toUpperCase();

  if (_ob?.isInLevelIntro) {
    alignH = UI_PORTRAIT.versionInfoLevelIntro.alignH;
    alignV = UI_PORTRAIT.versionInfoLevelIntro.alignV;
    offsetH = UI_PORTRAIT.versionInfoLevelIntro.offsetByCharsH * Text.fullCharWidth;
    offsetV = 0;
  } else {
    alignH = UI_PORTRAIT.mainTitle.alignH;
    alignV = UI_PORTRAIT.mainTitle.alignV;
    offsetV = 0;
    offsetH =
      Math.round((Layout.mainTitle_rect.right - Layout.mainTitle_rect.left) / 2 - Text.getStringWidth(str) / 2) +
      Layout.textBgPaddingProportional;
  }

  Text.draw({
    text: str,
    color: _ob?.color || GAME.VERSIONNUMBER_COLOR,
    drawBackground: true,
    alignH: alignH,
    alignV: alignV,
    offsetH: offsetH,
    offsetV: offsetV,
  });
};

Text.drawTimeRemaining = function (_data) {
  var str = Text.useShortVersions
    ? Game.timeRemaining + " " + STRING.CLOCK
    : STRING.TIME_TEXT + padString(Game.timeRemaining || 0, STRING.TIME_PADSTRING);

  Text.draw({
    text: {
      text: str,
      flashing: _data?.timeIsLow,
    },
    drawBackground: true,
    alignH: UI_PORTRAIT.timer.alignH,
    alignV: UI_PORTRAIT.timer.alignV,
    offsetH: UI_PORTRAIT.timer.offsetByCharsH * Text.fullCharWidth,
    offsetV: UI_PORTRAIT.timer.offsetByCharsV * (Text.lineHeight + Layout.textBgPaddingProportional * 2),
  });
};

Text.drawInstructions = function (_ar) {
  var i, text_ob, alignH, alignV, offsetH, offsetV;

  for (i = 0; i < _ar.length; i++) {
    text_ob = _ar[i];

    alignH = text_ob.portraitAlignH;
    alignV = text_ob.portraitAlignV;
    offsetH = Math.round(text_ob.portraitOffsetCharsH * Text.fullCharWidth);
    offsetV = Math.round(text_ob.portraitOffsetCharsV * Text.lineHeight);
    if (text_ob.isPlayer) {
      offsetV += Player.pos.y;
    }

    Text.draw({
      text: text_ob.text,
      color: GAME.INSTRUCTIONTEXT_COLOR,
      drawBackground: true,
      alignH: alignH,
      alignV: alignV,
      offsetH: offsetH,
      offsetV: offsetV,
    });
  }
};

export { Text };
