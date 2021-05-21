"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _string = require("../utility/string");

var _enums = require("../utility/enums");

var _uniqueNamesGenerator = require("unique-names-generator");

var _Robot = _interopRequireDefault(require("../models/Robot"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var getName = function getName() {
  return (0, _string.capitalize)((0, _uniqueNamesGenerator.uniqueNamesGenerator)({
    dictionaries: [_uniqueNamesGenerator.adjectives, _uniqueNamesGenerator.names],
    length: 2,
    separator: " "
  }));
};

var robots = [{
  str: "\n      \\_/\n     (* *)\n    __)#(__\n   ( )...( )(_)\n   || |_| ||//\n>==() | | ()/\n    _(___)_\n   [-]   [-]".slice(1),
  direction: "left",
  name: getName()
}, {
  str: "\n     ,     ,\n    (\\____/)\n     (_oo_)\n       (O)\n     __||__    \\)\n  []/______\\[] /\n  / \\______/ \\/\n /    /__\\\n(\\   /____\\".slice(1),
  direction: "right",
  name: getName()
}, {
  str: "\n    \\_\\\n   (_**)\n  __) #_\n ( )...()\n || | |I|\n || | |()__/\n /\\(___)\n_-\"\"\"\"\"\"\"-_\"\"-_\n-,,,,,,,,- ,,".slice(1),
  direction: "right",
  name: getName()
}, {
  str: "\n       _\n      [ ]\n     (   )\n      |>|\n   __/===\\__\n  //| o=o |\\\\\n<]  | o=o |  [>\n    \\=====/\n   / / | \\ \\\n  <_________>".slice(1),
  direction: "right",
  name: getName()
}, {
  str: "\n       __\n   _  |@@|\n  / \\ \\--/ __\n  ) O|----|  |   __\n / / \\ }{ /\\ )_ / _\\\n )/  /\\__/\\ \\__O (__\n|/  (--/\\--)    \\__/\n/   _)(  )(_\n   `---''---`".slice(1),
  direction: "right",
  name: getName()
}, {
  str: "\n       _______\n     _/       \\_\n    / |       | \\\n   /  |__   __|  \\\n  |__/((o| |o))\\__|\n  |      | |      |\n  |\\     |_|     /|\n  | \\           / |\n   \\| /  ___  \\ |/\n    \\ | / _ \\ | /\n     \\_________/\n      _|_____|_\n ____|_________|____\n/                   \\".slice(1),
  direction: "right",
  name: getName()
}].map(function (robotRaw) {
  return _objectSpread(_objectSpread({}, robotRaw), {}, {
    direction: robotRaw.direction === "right" ? _enums.DirectionX.Right : _enums.DirectionX.Left
  });
}) // here we map to Model instance
.map(function (robot) {
  return new _Robot["default"](robot);
});
var _default = robots;
exports["default"] = _default;