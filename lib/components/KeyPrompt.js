"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _react = _interopRequireDefault(require("react"));

var _ink = require("ink");

var _string = require("../utility/string");

var _FocusText = _interopRequireDefault(require("./FocusText"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

var KeyPrompt = function KeyPrompt(_ref) {
  var button = _ref.button,
      verb = _ref.verb,
      noun = _ref.noun,
      onPressed = _ref.onPressed,
      isPressed = _ref.isPressed,
      _ref$isActive = _ref.isActive,
      isActive = _ref$isActive === void 0 ? true : _ref$isActive,
      otherProps = _objectWithoutProperties(_ref, ["button", "verb", "noun", "onPressed", "isPressed", "isActive"]);

  var _useFocus = (0, _ink.useFocus)({
    autoFocus: true,
    isActive: isActive
  }),
      isFocused = _useFocus.isFocused;

  (0, _ink.useInput)(function (input, keyMeta) {
    if (isPressed(input, keyMeta) && isActive || keyMeta["return"] && isFocused) {
      onPressed();
    }
  });

  var getColor = function getColor(str) {
    return isActive ? str : "gray";
  };

  var verbMaxWidth = 6;
  return /*#__PURE__*/_react["default"].createElement(_FocusText["default"], _extends({
    isFocused: isFocused,
    color: getColor("white")
  }, otherProps), /*#__PURE__*/_react["default"].createElement(_ink.Text, {
    color: getColor("cyan")
  }, button), " to", verb && " ", ((verb || "") + " ").padEnd(verbMaxWidth + 4 + Number(!verb), "."), " ", /*#__PURE__*/_react["default"].createElement(_ink.Text, {
    color: getColor("yellow")
  }, (0, _string.capitalize)(noun)));
};

var _default = KeyPrompt;
exports["default"] = _default;