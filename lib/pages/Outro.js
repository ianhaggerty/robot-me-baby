"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _react = _interopRequireWildcard(require("react"));

var _ink = require("ink");

var _inkUseStdoutDimensions = _interopRequireDefault(require("ink-use-stdout-dimensions"));

var _figlet = _interopRequireDefault(require("figlet"));

var _ascii = require("../data/ascii");

var _useAccumulate3 = _interopRequireDefault(require("../hooks/useAccumulate"));

var _useBlink = _interopRequireDefault(require("../hooks/useBlink"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr && (typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]); if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var Outro = function Outro() {
  var messages = ["Thanks\nFor\nPlaying\n:)", "Press\nQ\nTo Quit\n:("];

  var _useState = (0, _react.useState)(0),
      _useState2 = _slicedToArray(_useState, 2),
      messageIndex = _useState2[0],
      setMessageIndex = _useState2[1];

  var _useStdoutDimensions = (0, _inkUseStdoutDimensions["default"])(),
      _useStdoutDimensions2 = _slicedToArray(_useStdoutDimensions, 2),
      cols = _useStdoutDimensions2[0],
      rows = _useStdoutDimensions2[1];

  var _useAccumulate = (0, _useAccumulate3["default"])({
    end: messages[messageIndex].length,
    step: 1,
    interval: 300,
    intervalFluctuation: 50
  }),
      _useAccumulate2 = _slicedToArray(_useAccumulate, 2),
      index = _useAccumulate2[0],
      setIndex = _useAccumulate2[1];

  var blink = (0, _useBlink["default"])({
    interval: 300
  });

  var _useApp = (0, _ink.useApp)(),
      exit = _useApp.exit;

  (0, _ink.useInput)(function (input) {
    if (input.toUpperCase() === "Q") {
      exit();
    }
  });
  (0, _react.useEffect)(function () {
    if (messageIndex === 0 && index === messages[0].length) {
      var timerId = setTimeout(function () {
        setMessageIndex(1);
        setIndex(0);
      }, 1000);
      return function () {
        return clearTimeout(timerId);
      };
    }
  }, [index]);
  var str = messages[messageIndex].slice(0, index) + (blink ? "_" : " ");
  return /*#__PURE__*/_react["default"].createElement(_ink.Box, {
    justifyContent: "space-around",
    alignItems: "center",
    width: cols,
    minHeight: rows
  }, /*#__PURE__*/_react["default"].createElement(_ink.Box, {
    flexDirection: "column",
    alignItems: "center"
  }, /*#__PURE__*/_react["default"].createElement(_ink.Box, null, /*#__PURE__*/_react["default"].createElement(_ink.Text, null, _ascii.myFace)), /*#__PURE__*/_react["default"].createElement(_ink.Text, null, "Spawned from the mind of "), /*#__PURE__*/_react["default"].createElement(_ink.Text, {
    color: "green"
  }, "Ian Haggerty"), /*#__PURE__*/_react["default"].createElement(_ink.Text, {
    color: "cyan",
    dimColor: true
  }, "(https://github.com/ianhaggerty)")), /*#__PURE__*/_react["default"].createElement(_ink.Box, null, /*#__PURE__*/_react["default"].createElement(_ink.Text, null, _figlet["default"].textSync(str, "ANSI Regular"))));
};

var _default = Outro;
exports["default"] = _default;