"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.palindromeMap = void 0;
var palindromes = [["<", ">"], ["[", "]"], ["{", "}"], ["(", ")"], ["/", "\\"]];

var palindromeMap = function () {
  var map = {};
  palindromes.forEach(function (pair) {
    map[pair[0]] = pair[1];
    map[pair[1]] = pair[0];
  });
  return map;
}();

exports.palindromeMap = palindromeMap;