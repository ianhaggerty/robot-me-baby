"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _string = require("../utility/string");

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

// Using models with React state may not be such a good idea...
// https://daveceddia.com/why-not-modify-react-state-directly/
// This should be ok as an immutable structure...
var Robot = /*#__PURE__*/function () {
  function Robot(_ref) {
    var str = _ref.str,
        direction = _ref.direction,
        name = _ref.name,
        _ref$explodeCount = _ref.explodeCount,
        explodeCount = _ref$explodeCount === void 0 ? 0 : _ref$explodeCount,
        _ref$maxExplodeCount = _ref.maxExplodeCount,
        maxExplodeCount = _ref$maxExplodeCount === void 0 ? 3 : _ref$maxExplodeCount;

    _classCallCheck(this, Robot);

    this._str = str;
    this._dirn = direction;
    this._name = name;
    this._explodeCount = explodeCount;
    this._maxExplodeCount = maxExplodeCount;
  }

  _createClass(Robot, [{
    key: "name",
    get: function get() {
      return this._name;
    } // TODO remove?? not being used

  }, {
    key: "setName",
    value: function setName(newName) {
      if (newName === this._name) {
        return this;
      }

      return this._clone({
        name: newName
      });
    }
  }, {
    key: "direction",
    get: function get() {
      return this._dirn;
    }
  }, {
    key: "_clone",
    value: function _clone(_ref2) {
      var _ref2$str = _ref2.str,
          str = _ref2$str === void 0 ? this._str : _ref2$str,
          _ref2$name = _ref2.name,
          name = _ref2$name === void 0 ? this._name : _ref2$name,
          _ref2$direction = _ref2.direction,
          direction = _ref2$direction === void 0 ? this._dirn : _ref2$direction,
          _ref2$explodeCount = _ref2.explodeCount,
          explodeCount = _ref2$explodeCount === void 0 ? this._explodeCount : _ref2$explodeCount,
          _ref2$maxExplodeCount = _ref2.maxExplodeCount,
          maxExplodeCount = _ref2$maxExplodeCount === void 0 ? this._maxExplodeCount : _ref2$maxExplodeCount;
      return new Robot({
        str: str,
        name: name,
        direction: direction,
        explodeCount: explodeCount,
        maxExplodeCount: maxExplodeCount
      });
    }
  }, {
    key: "setDirection",
    value: function setDirection(newDirn) {
      if (this._dirn === newDirn) {
        return this;
      }

      var width = this.width;

      var newStr = this._str.split("\n").map(function (line) {
        return line.padEnd(width);
      }).map(_string.reverse).map(_string.swapPalindromes).join("\n");

      return this._clone({
        str: newStr,
        direction: newDirn
      });
    }
  }, {
    key: "explode",
    value: function explode() {
      if (this.isExploded) {
        return this;
      }

      var newStr = (0, _string.transpose)((0, _string.shuffle)((0, _string.transpose)((0, _string.shuffle)(this._str, 1)), 1));
      return this._clone({
        str: newStr,
        explodeCount: this._explodeCount + 1
      });
    }
  }, {
    key: "explodeCount",
    get: function get() {
      return this._explodeCount;
    }
  }, {
    key: "isExploded",
    get: function get() {
      return this._explodeCount >= this._maxExplodeCount;
    }
  }, {
    key: "height",
    get: function get() {
      return this._str.split("\n").length;
    }
  }, {
    key: "width",
    get: function get() {
      return Math.max.apply(Math, _toConsumableArray(this._str.split("\n").map(function (line) {
        return line.length;
      })));
    }
  }, {
    key: "toString",
    value: function toString() {
      return this._str;
    }
  }]);

  return Robot;
}();

var _default = Robot;
exports["default"] = _default;