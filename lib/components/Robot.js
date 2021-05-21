"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _react = _interopRequireDefault(require("react"));

var _ink = require("ink");

var _colors = require("../data/colors");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var RobotCmpt = function RobotCmpt(_ref) {
  var robot = _ref.robot,
      _ref$color = _ref.color,
      color = _ref$color === void 0 ? _colors.Color.MUTED_WHITE : _ref$color;
  return /*#__PURE__*/_react["default"].createElement(_ink.Box, {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  }, /*#__PURE__*/_react["default"].createElement(_ink.Text, {
    color: color
  }, robot.toString()), /*#__PURE__*/_react["default"].createElement(_ink.Text, {
    color: "magentaBright"
  }, robot.name), robot.isExploded ? /*#__PURE__*/_react["default"].createElement(_ink.Text, {
    color: "red"
  }, "is no more \uD83D\uDE25") : null);
};

var _default = RobotCmpt;
exports["default"] = _default;