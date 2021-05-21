"use strict";

var _react = _interopRequireDefault(require("react"));

var _ink = require("ink");

var _consoleClear = _interopRequireDefault(require("console-clear"));

var _reactRouter = require("react-router");

var _Intro = _interopRequireDefault(require("./pages/Intro"));

var _RobotGame = _interopRequireDefault(require("./pages/RobotGame"));

var _Outro = _interopRequireDefault(require("./pages/Outro"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// Clear the console
(0, _consoleClear["default"])(true); // Increase stdin listeners (stop node complaining)

process.stdin.setMaxListeners(100);
(0, _ink.render)( /*#__PURE__*/_react["default"].createElement(_reactRouter.MemoryRouter, null, /*#__PURE__*/_react["default"].createElement(_reactRouter.Route, {
  path: "/",
  component: _Intro["default"],
  exact: true
}), /*#__PURE__*/_react["default"].createElement(_reactRouter.Route, {
  path: "/robot-me-baby",
  component: _RobotGame["default"],
  exact: true
}), /*#__PURE__*/_react["default"].createElement(_reactRouter.Route, {
  path: "/outro",
  component: _Outro["default"],
  exact: true
})));