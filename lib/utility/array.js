"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.selectNext = selectNext;
exports.randomSelect = randomSelect;

/** Returns a random element from an array, which is not equal `prev` */
function selectNext(prev, arr) {
  var equals = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function (a, b) {
    return a === b;
  };
  var next = randomSelect(arr); // TODO infinite loop if arr is empty

  if (equals(prev, next)) {
    return selectNext(prev, arr);
  }

  return next;
}

function randomSelect(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}