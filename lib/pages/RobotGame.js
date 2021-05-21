"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _react = _interopRequireWildcard(require("react"));

var _ink = require("ink");

var _inkUseStdoutDimensions = _interopRequireDefault(require("ink-use-stdout-dimensions"));

var _reactRouter = require("react-router");

var _array = require("../utility/array");

var _enums = require("../utility/enums");

var _index = require("../sounds/index");

var _KeyPrompt = _interopRequireDefault(require("../components/KeyPrompt"));

var _Robot = _interopRequireDefault(require("../components/Robot"));

var _Explosion = _interopRequireDefault(require("../components/Explosion"));

var _Separator = _interopRequireDefault(require("../components/Separator"));

var _robots = _interopRequireDefault(require("../data/robots"));

var _colors = _interopRequireDefault(require("../data/colors"));

var _explosions = _interopRequireDefault(require("../data/explosions"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr && (typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]); if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var RobotGame = function RobotGame() {
  // react state
  var _useState = (0, _react.useState)(_colors["default"][0]),
      _useState2 = _slicedToArray(_useState, 2),
      color = _useState2[0],
      setColor = _useState2[1];

  var _useState3 = (0, _react.useState)(_robots["default"][0]),
      _useState4 = _slicedToArray(_useState3, 2),
      robot = _useState4[0],
      setRobot = _useState4[1];

  var _useState5 = (0, _react.useState)(0),
      _useState6 = _slicedToArray(_useState5, 2),
      paddingLeft = _useState6[0],
      setPaddingLeft = _useState6[1];

  var _useState7 = (0, _react.useState)(0),
      _useState8 = _slicedToArray(_useState7, 2),
      paddingTop = _useState8[0],
      setPaddingTop = _useState8[1]; // callbacks


  var _useState9 = (0, _react.useState)(false),
      _useState10 = _slicedToArray(_useState9, 2),
      isExploding = _useState10[0],
      setIsExploding = _useState10[1];

  var _useState11 = (0, _react.useState)(false),
      _useState12 = _slicedToArray(_useState11, 2),
      isStomping = _useState12[0],
      setIsStomping = _useState12[1]; // terminal dimensions


  var _useStdoutDimensions = (0, _inkUseStdoutDimensions["default"])(),
      _useStdoutDimensions2 = _slicedToArray(_useStdoutDimensions, 2),
      columns = _useStdoutDimensions2[0],
      rows = _useStdoutDimensions2[1]; // used to terminate app


  var _useApp = (0, _ink.useApp)(),
      exit = _useApp.exit; // routing logic


  var history = (0, _reactRouter.useHistory)();

  var sayYes = function sayYes() {
    return (0, _index.playSound)(_index.Sounds.Yes);
  };

  var sayNo = function sayNo() {
    return (0, _index.playSound)(_index.Sounds.No);
  };

  var sayIamRobot = function sayIamRobot() {
    return (0, _index.playSound)(_index.Sounds.Speak);
  };

  var windowHeight = rows;
  var windowWidth = columns - 27; // TODO soft code?

  var isRobotAvailable = !robot.isExploded && !isExploding;

  var changeRobot = function changeRobot() {
    (0, _index.playSound)(_index.Sounds.Confirm, 0.2);
    setRobot(function (prevRobot) {
      return (0, _array.selectNext)(prevRobot, _robots["default"], function (r1, r2) {
        return r1.name === r2.name;
      });
    });
  };

  var changeColor = function changeColor() {
    (0, _index.playSound)(_index.Sounds.Glitch, 0.2);
    setColor(function (prevColor) {
      return (0, _array.selectNext)(prevColor, _colors["default"]);
    });
  };

  var moveUp = function moveUp() {
    if (paddingTop <= 0) {
      return false;
    }

    setPaddingTop(function (prevPaddingTop) {
      return prevPaddingTop - 1;
    });
    return true;
  };

  var moveLeft = function moveLeft() {
    if (paddingLeft <= 0) {
      return false;
    }

    setRobot(function (prevRobot) {
      return prevRobot.setDirection(_enums.DirectionX.Left);
    });
    setPaddingLeft(function (prevPaddingLeft) {
      return prevPaddingLeft - 1;
    });
    return true;
  };

  var moveRight = function moveRight() {
    if (paddingLeft + robot.width >= windowWidth - 2) {
      return false;
    }

    setRobot(function (prevRobot) {
      return prevRobot.setDirection(_enums.DirectionX.Right);
    });
    setPaddingLeft(function (prevPaddingLeft) {
      return prevPaddingLeft + 1;
    });
    return true;
  };

  var moveDown = function moveDown() {
    setPaddingTop(function (prevPaddingTop) {
      return prevPaddingTop + 1;
    });
  };

  var makeExplode = function makeExplode() {
    if (!robot.isExploded) {
      setRobot(function (prevRobot) {
        return prevRobot.explode();
      });
      (0, _index.playSound)(_index.Sounds.Explode, 1); // TODO refactor out to React-Router?
      // TODO will throw if component unmounted

      setIsExploding(true);
      setTimeout(function () {
        setIsExploding(false);
      }, 2000);
    }
  }; // Introduction Sound


  (0, _react.useEffect)(function () {
    return (0, _index.playSound)(_index.Sounds.Intro, 0.3);
  }, []);
  (0, _react.useEffect)(function () {
    if (!isStomping) {
      setIsStomping(true);
      (0, _index.playSound)(_index.Sounds.Stomps); // TODO will throw if component unmounted

      setTimeout(function () {
        return setIsStomping(false);
      }, 1000);
    }
  }, [paddingLeft, paddingTop]);
  return /*#__PURE__*/_react["default"].createElement(_react["default"].Fragment, null, /*#__PURE__*/_react["default"].createElement(_ink.Box, {
    alignItems: "flex-start"
  }, /*#__PURE__*/_react["default"].createElement(_ink.Box, {
    paddingLeft: paddingLeft,
    paddingTop: paddingTop,
    height: windowHeight,
    width: windowWidth,
    alignItems: "flex-start"
  }, isExploding ? /*#__PURE__*/_react["default"].createElement(_Explosion["default"], {
    explosion: _explosions["default"][0]
  }) : /*#__PURE__*/_react["default"].createElement(_Robot["default"], {
    robot: robot,
    color: color
  })), /*#__PURE__*/_react["default"].createElement(_ink.Box, {
    marginLeft: 2,
    flexDirection: "column"
  }, /*#__PURE__*/_react["default"].createElement(_ink.Box, {
    flexDirection: "column"
  }, /*#__PURE__*/_react["default"].createElement(_ink.Text, {
    color: "gray",
    italic: true
  }, "   ", /*#__PURE__*/_react["default"].createElement(_ink.Text, {
    color: "cyan"
  }, "\u21B9 tab"), " to cycle focus"), /*#__PURE__*/_react["default"].createElement(_ink.Text, {
    color: "gray",
    italic: true
  }, "   ", /*#__PURE__*/_react["default"].createElement(_ink.Text, {
    color: "cyan"
  }, "\u23CE enter"), " to activate")), /*#__PURE__*/_react["default"].createElement(_Separator["default"], {
    width: 20,
    "char": "="
  }), /*#__PURE__*/_react["default"].createElement(_ink.Box, {
    flexDirection: "column"
  }, /*#__PURE__*/_react["default"].createElement(_KeyPrompt["default"], {
    button: _enums.Key.LEFT_ARROW,
    verb: "move",
    noun: "left",
    onPressed: moveLeft,
    isPressed: function isPressed(_, keyMeta) {
      return keyMeta.leftArrow;
    },
    isActive: isRobotAvailable
  }), /*#__PURE__*/_react["default"].createElement(_KeyPrompt["default"], {
    button: _enums.Key.UP_ARROW,
    verb: "move",
    noun: "up",
    onPressed: moveUp,
    isPressed: function isPressed(_, keyMeta) {
      return keyMeta.upArrow;
    },
    isActive: isRobotAvailable
  }), /*#__PURE__*/_react["default"].createElement(_KeyPrompt["default"], {
    button: _enums.Key.RIGHT_ARROW,
    verb: "move",
    noun: "right",
    onPressed: moveRight,
    isPressed: function isPressed(_, keyMeta) {
      return keyMeta.rightArrow;
    },
    isActive: isRobotAvailable
  }), /*#__PURE__*/_react["default"].createElement(_KeyPrompt["default"], {
    button: _enums.Key.DOWN_ARROW,
    verb: "move",
    noun: "down",
    onPressed: moveDown,
    isPressed: function isPressed(_, key) {
      return key.downArrow;
    },
    isActive: isRobotAvailable
  }), /*#__PURE__*/_react["default"].createElement(_Separator["default"], null), /*#__PURE__*/_react["default"].createElement(_KeyPrompt["default"], {
    button: _enums.Key.Y,
    verb: "say",
    noun: "yes",
    onPressed: sayYes,
    isPressed: function isPressed(input) {
      return input.toUpperCase() === _enums.Key.Y;
    },
    isActive: isRobotAvailable
  }), /*#__PURE__*/_react["default"].createElement(_KeyPrompt["default"], {
    button: _enums.Key.N,
    verb: "say",
    noun: "no",
    onPressed: sayNo,
    isPressed: function isPressed(input) {
      return input.toUpperCase() === _enums.Key.N;
    },
    isActive: isRobotAvailable
  }), /*#__PURE__*/_react["default"].createElement(_KeyPrompt["default"], {
    button: _enums.Key.I,
    verb: "say",
    noun: "Robot",
    onPressed: sayIamRobot,
    isPressed: function isPressed(input) {
      return input.toUpperCase() === _enums.Key.I;
    },
    isActive: isRobotAvailable
  }), /*#__PURE__*/_react["default"].createElement(_Separator["default"], null), /*#__PURE__*/_react["default"].createElement(_KeyPrompt["default"], {
    button: _enums.Key.C,
    verb: "change",
    noun: "color",
    onPressed: changeColor,
    isPressed: function isPressed(input) {
      return input.toUpperCase() === _enums.Key.C;
    },
    isActive: isRobotAvailable
  }), /*#__PURE__*/_react["default"].createElement(_KeyPrompt["default"], {
    button: _enums.Key.R,
    verb: "change",
    noun: "robot",
    onPressed: changeRobot,
    isPressed: function isPressed(input) {
      return input.toUpperCase() === _enums.Key.R;
    },
    isActive: !isExploding
  }), /*#__PURE__*/_react["default"].createElement(_Separator["default"], {
    width: 20,
    "char": "="
  }), /*#__PURE__*/_react["default"].createElement(_KeyPrompt["default"], {
    button: _enums.Key.E,
    noun: "explode",
    onPressed: makeExplode,
    isPressed: function isPressed(input) {
      return input.toUpperCase() === _enums.Key.E;
    },
    isActive: isRobotAvailable
  }), /*#__PURE__*/_react["default"].createElement(_KeyPrompt["default"], {
    button: _enums.Key.Q,
    noun: "quit",
    onPressed: function onPressed() {
      return history.push("/outro");
    },
    isPressed: function isPressed(input) {
      return input.toUpperCase() === _enums.Key.Q;
    },
    isActive: true
  })))));
};

var _default = RobotGame;
exports["default"] = _default;