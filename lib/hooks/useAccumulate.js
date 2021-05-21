"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _react = require("react");

var _maths = require("../utility/maths");

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr && (typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]); if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var useAccumulate = function useAccumulate(_ref) {
  var _ref$start = _ref.start,
      start = _ref$start === void 0 ? 0 : _ref$start,
      _ref$end = _ref.end,
      end = _ref$end === void 0 ? 1 : _ref$end,
      _ref$step = _ref.step,
      step = _ref$step === void 0 ? 0.01 : _ref$step,
      _ref$stepFluctuation = _ref.stepFluctuation,
      stepFluctuation = _ref$stepFluctuation === void 0 ? 0 : _ref$stepFluctuation,
      _ref$interval = _ref.interval,
      interval = _ref$interval === void 0 ? 100 : _ref$interval,
      _ref$intervalFluctuat = _ref.intervalFluctuation,
      intervalFluctuation = _ref$intervalFluctuat === void 0 ? 0 : _ref$intervalFluctuat,
      _ref$monotonic = _ref.monotonic,
      monotonic = _ref$monotonic === void 0 ? false : _ref$monotonic,
      _ref$isActive = _ref.isActive,
      isActive = _ref$isActive === void 0 ? true : _ref$isActive,
      _ref$onEnd = _ref.onEnd,
      onEnd = _ref$onEnd === void 0 ? function () {
    return null;
  } : _ref$onEnd;

  var _useState = (0, _react.useState)(start),
      _useState2 = _slicedToArray(_useState, 2),
      number = _useState2[0],
      setNumber = _useState2[1];

  var getStep = function getStep() {
    var newStep = step;

    if (stepFluctuation) {
      newStep += (0, _maths.random)(-1, 1) * stepFluctuation;
    }

    if (monotonic) {
      newStep = end > start && step < 0 || end < start && step > 0 ? -newStep : newStep;
    }

    return newStep;
  };

  (0, _react.useEffect)(function () {
    if (isActive && start < end && number < end || start > end && number > end) {
      var timerId = setTimeout(function () {
        setNumber(function (number) {
          return number + getStep();
        });
      }, Math.max(0, interval + (0, _maths.random)(-1, 1) * intervalFluctuation));
      return function () {
        return clearTimeout(timerId);
      };
    } else {
      onEnd();
    }
  }, [number, isActive]);
  return [number, setNumber];
};

var _default = useAccumulate;
exports["default"] = _default;