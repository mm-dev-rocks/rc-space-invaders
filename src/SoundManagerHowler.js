/**
 * @license GPL-3.0-only
 *
 * @author Mark Mayes / mm-dev
 *
 *
 * @module SoundManagerHowler
 *
 * @description
 * ## `Howler.js` is used for audio handling in the app, this module adds some functions to help integrate it
 */

import { PD } from "./PD/CONST.js";
import { __, manualEvent } from "./utils.js";

// https://github.com/goldfire/howler.js
import { Howl, Howler } from "./howler.core.min.js";

class SoundManagerHowler {}

/**
 * @function init
 * @static
 *
 * @description
 * ##### Preload sounds, set them up as `Howl` objects and store them in SoundManagerHowler.allAudio_ob using their ID as a key
 *
 * @param {object} _data
 * @param {object[]} _data.sound_ar - Info about sounds to preload
 * @param {function} _data.preloadCallback - Function to call when all the sounds have finshed loading
 */
SoundManagerHowler.init = function (_data) {
  var i, audio_tmp;

  SoundManagerHowler.data_ar = _data.sound_ar;
  SoundManagerHowler.preloadCallback = _data.preloadCallback;
  SoundManagerHowler.preload_ar = [];
  SoundManagerHowler.allAudio_ob = {};

  SoundManagerHowler.preload_ar = [];
  // loop through array of audio files (imported from HTML)
  // create audio objects from them, add them to the preload_ar
  // and watch for them to finish loading
  for (i = 0; i < SoundManagerHowler.data_ar.length; i++) {
    if (SoundManagerHowler.allAudio_ob[SoundManagerHowler.data_ar[i].id]) {
      __(
        "" +
          SoundManagerHowler.data_ar[i].id +
          ": already exists - skipping preload",
        PD.FMT_AUDIO
      );
    } else {
      audio_tmp = new Howl({
        src: [SoundManagerHowler.data_ar[i].file],
        volume: [SoundManagerHowler.data_ar[i].volume] || 1,
        onload: SoundManagerHowler.onAudioLoad,
        onloaderror: SoundManagerHowler.onAudioEventGeneric,
        onplayerror: SoundManagerHowler.onAudioEventGeneric,
      });

      audio_tmp.id = SoundManagerHowler.data_ar[i].id;
      __("INITIALISING: " + SoundManagerHowler.data_ar[i].file, PD.FMT_AUDIO);
      SoundManagerHowler.allAudio_ob[SoundManagerHowler.data_ar[i].id] =
        audio_tmp;
      SoundManagerHowler.preload_ar.push(audio_tmp);
    }
  }
};

/**
 * @function onAudioLoad
 * @static 
 *
 * @description
 * ##### A sound file has finished loading
 * - Broadcast an `itempreload` event, including details about how many sounds have loaded so far
 * - If all sounds have finished loading, call the `preloadCallback()` function that was passed into `SoundManagerHowler.init()`
 */
SoundManagerHowler.onAudioLoad = function () {
  var i;

  //__('SoundManagerHowler::onAudioLoad: ' + this.id, PD.FMT_AUDIO);

  for (i = 0; i < SoundManagerHowler.preload_ar.length; i++) {
    if (SoundManagerHowler.preload_ar[i] === this) {
      SoundManagerHowler.preload_ar.splice(i, 1);
      __("LOADED: " + this.id, PD.FMT_AUDIO);
      break;
    }
  }
  manualEvent(document, "itempreload", {
    audioItemsLoaded:
      SoundManagerHowler.data_ar.length - SoundManagerHowler.preload_ar.length,
  });
  if (SoundManagerHowler.preload_ar.length === 0) {
    // all audio is loaded
    if (SoundManagerHowler.preloadCallback) {
      SoundManagerHowler.preloadCallback();
    }
  }
};

/**
 * @function playSoundById
 * @static 
 *
 * @description
 * ##### Find a sound by its ID and play it
 *
 * @param {string} _id
 */
SoundManagerHowler.playSoundById = function (_id) {
  var audio_tmp = SoundManagerHowler.allAudio_ob[_id];
  if (!audio_tmp.playing()) {
    audio_tmp.howlerID = audio_tmp.play();
  }
};


/**
 * @function setMuteState
 * @static 
 *
 * @description
 * ##### Set global mute state
 *
 * @param {boolean} _state - Desired mute state (eg `true` will mute all sounds)
 */
SoundManagerHowler.setMuteState = function (_state) {
  Howler.mute(_state);
};

/**
 * @function onAudioEventGeneric
 * @static 
 *
 * @description
 * ##### Handle any miscellaneous `Howler` events
 *
 * @param {string} howlerID - `Howler`s ID for the sound this event pertains to
 * @param {string} message - Message about the event
 */
SoundManagerHowler.onAudioEventGeneric = function (howlerID, message) {
  if (message) {
    __("SoundManagerHowler::id: " + this.id, PD.FMT_AUDIO);
    __("\t" + message, PD.FMT_AUDIO);
  }
};

export { SoundManagerHowler };
