"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _Explosion = _interopRequireDefault(require("../models/Explosion"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var explosions = [{
  str: "          _ ._  _ , _ ._\n        (_ ' ( `  )_  .__)\n      ( (  (    )   `)  ) _)\n     (__ (_   (_ . _) _) ,__)\n         `~~`\\ ' . /`~~`\n              ;   ;\n              /   \\\n_____________/_ __ \\_____________"
}].map(function (explosion) {
  return new _Explosion["default"](explosion);
});
var _default = explosions;
exports["default"] = _default;