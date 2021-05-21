"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.playSound = playSound;
exports.Sounds = void 0;

var _soundPlay = _interopRequireDefault(require("sound-play"));

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var Sounds;
exports.Sounds = Sounds;

(function (Sounds) {
  Sounds["Ambience"] = "ambience.wav";
  Sounds["Broken"] = "broken-robot.mp3";
  Sounds["Future"] = "future.mp3";
  Sounds["Glitch"] = "glitch.wav";
  Sounds["Intro"] = "intro.wav";
  Sounds["No"] = "no.wav";
  Sounds["Explode"] = "nuclear_explode.mp3";
  Sounds["Confirm"] = "retro-confirm.wav";
  Sounds["Speak"] = "speak.wav";
  Sounds["Stomps"] = "stomps.wav";
  Sounds["Sweep"] = "sweep.wav";
  Sounds["TypeBeep"] = "type-beep.wav";
  Sounds["Yes"] = "yes.wav";
})(Sounds || (exports.Sounds = Sounds = {}));

function playSound(file) {
  var volume = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0.5;

  _soundPlay["default"].play(_path["default"].resolve(__dirname, "..", "..", "sounds", file), volume);
}