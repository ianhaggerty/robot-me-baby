"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _react = _interopRequireWildcard(require("react"));

var _ink = require("ink");

var _reactRouter = require("react-router");

var _inkUseStdoutDimensions = _interopRequireDefault(require("ink-use-stdout-dimensions"));

var _ascii = require("../data/ascii");

var _FadeIn = _interopRequireDefault(require("../transforms/FadeIn"));

var _index = require("../sounds/index");

var _TypeIn = _interopRequireDefault(require("../transforms/TypeIn"));

var _Delayed = _interopRequireDefault(require("../components/Delayed"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr && (typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]); if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var Intro = function Intro() {
  var maxSpaces = 3;
  var maxTime = 30000;
  var interval = 1000;
  var history = (0, _reactRouter.useHistory)();

  var _useStdoutDimensions = (0, _inkUseStdoutDimensions["default"])(),
      _useStdoutDimensions2 = _slicedToArray(_useStdoutDimensions, 2),
      cols = _useStdoutDimensions2[0],
      rows = _useStdoutDimensions2[1];

  var _useApp = (0, _ink.useApp)(),
      exit = _useApp.exit;

  var _useState = (0, _react.useState)(maxSpaces),
      _useState2 = _slicedToArray(_useState, 2),
      spaces = _useState2[0],
      setSpaces = _useState2[1];

  var _useState3 = (0, _react.useState)(maxTime),
      _useState4 = _slicedToArray(_useState3, 2),
      timer = _useState4[0],
      setTimer = _useState4[1]; // on component mount, play sound


  (0, _react.useEffect)(function () {
    (0, _index.playSound)(_index.Sounds.TypeBeep, 0.1);
  }, []); // if space if pressed, decrement space count

  (0, _ink.useInput)(function (input) {
    if (input === " ") {
      setSpaces(function (spaces) {
        return spaces - 1;
      });
    }
  }); // if space is pressed enough, navigate to app

  (0, _react.useEffect)(function () {
    if (spaces === 0) {
      return history.push("/robot-me-baby");
    }
  }, [spaces]); // it timer runs out, exit app

  (0, _react.useEffect)(function () {
    if (timer <= 0) {
      exit();
    }

    var timerId = setTimeout(function () {
      setTimer(function (timer) {
        return timer - interval;
      });
    }, interval);
    return function () {
      clearTimeout(timerId);
    };
  }, [timer]);
  return /*#__PURE__*/_react["default"].createElement(_ink.Box, {
    justifyContent: "space-around",
    alignItems: "center",
    flexDirection: "column",
    height: rows,
    width: cols
  }, /*#__PURE__*/_react["default"].createElement(_ink.Box, null, /*#__PURE__*/_react["default"].createElement(_ink.Text, {
    color: "yellow",
    dimColor: true
  }, /*#__PURE__*/_react["default"].createElement(_FadeIn["default"], null, /*#__PURE__*/_react["default"].createElement(_ink.Text, null, _ascii.robotMeBaby)))), /*#__PURE__*/_react["default"].createElement(_ink.Box, {
    flexDirection: "column",
    alignItems: "center"
  }, /*#__PURE__*/_react["default"].createElement(_ink.Box, {
    flexDirection: "column",
    alignItems: "center"
  }, /*#__PURE__*/_react["default"].createElement(_Delayed["default"], {
    delay: 2000
  }, /*#__PURE__*/_react["default"].createElement(_TypeIn["default"], null, /*#__PURE__*/_react["default"].createElement(_react["default"].Fragment, null, /*#__PURE__*/_react["default"].createElement(_ink.Text, null, "A Ridiculous App - Made By")))))), /*#__PURE__*/_react["default"].createElement(_ink.Box, null, /*#__PURE__*/_react["default"].createElement(_Delayed["default"], {
    delay: 4500
  }, /*#__PURE__*/_react["default"].createElement(_ink.Text, {
    color: "cyan",
    dimColor: true
  }, /*#__PURE__*/_react["default"].createElement(_FadeIn["default"], null, /*#__PURE__*/_react["default"].createElement(_ink.Text, null, _ascii.ian2))))), /*#__PURE__*/_react["default"].createElement(_ink.Box, {
    flexDirection: "column",
    alignItems: "center"
  }, /*#__PURE__*/_react["default"].createElement(_Delayed["default"], {
    delay: 6500
  }, /*#__PURE__*/_react["default"].createElement(_ink.Text, {
    color: "gray"
  }, /*#__PURE__*/_react["default"].createElement(_FadeIn["default"], null, /*#__PURE__*/_react["default"].createElement(_ink.Text, null, "Press ", /*#__PURE__*/_react["default"].createElement(_ink.Text, {
    color: "yellow"
  }, "space"), " ", /*#__PURE__*/_react["default"].createElement(_ink.Text, {
    color: "cyan"
  }, spaces), " more times")))), /*#__PURE__*/_react["default"].createElement(_Delayed["default"], {
    delay: 8500
  }, /*#__PURE__*/_react["default"].createElement(_ink.Text, {
    color: "gray",
    dimColor: true
  }, /*#__PURE__*/_react["default"].createElement(_FadeIn["default"], null, /*#__PURE__*/_react["default"].createElement(_ink.Text, null, timer / 1000, " seconds left"))))));
};

var _default = Intro;
exports["default"] = _default;