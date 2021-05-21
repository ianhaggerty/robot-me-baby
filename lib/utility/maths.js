"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.random = exports.sigmoid = void 0;

var sigmoid = function sigmoid(input) {
  return 1 / (1 + Math.exp(-input));
};

exports.sigmoid = sigmoid;

var random = function random(lower, upper) {
  return Math.random() * (upper - lower) + lower;
};

exports.random = random;