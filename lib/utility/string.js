"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.repeatChar = exports.swapPalindromes = exports.maxWidth = exports.transpose = exports.shuffle = exports.capitalize = exports.reverse = void 0;

var _array = require("./array");

var _palindromes = require("../data/palindromes");

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var reverse = function reverse(str) {
  return str.split("").reverse().join("");
};

exports.reverse = reverse;

var capitalize = function capitalize(str) {
  return str.replace(/(^|\s+)\S/g, function (match) {
    return match.slice(0, match.length - 1) + match[match.length - 1].toUpperCase();
  });
}; // Shuffles the characters in a string.
// Guarantees that each character is within amount of it's original position.


exports.capitalize = capitalize;

var shuffle = function shuffle(str, amount) {
  var indexMap = new Array(str.length);

  function getPossibleIndices(index, selected) {
    var indices = [];

    for (var i = index - amount; i <= index + amount; ++i) {
      if (i >= 0 && i < str.length && !selected.includes(i)) {
        indices.push(i);
      }
    }

    return indices;
  }

  var possibleIndices;

  for (var i = 0; i < indexMap.length; ++i) {
    possibleIndices = getPossibleIndices(i, indexMap);

    if (possibleIndices.includes(i - amount)) {
      indexMap[i] = i - amount;
    } else {
      indexMap[i] = (0, _array.randomSelect)(possibleIndices);
    }
  }

  return indexMap.map(function (newIndex) {
    return str[newIndex];
  }).join("");
}; // Transpose (flip rows and cols) for the given string,
// presumably consisting of a number of lines "\n"


exports.shuffle = shuffle;

var transpose = function transpose(str) {
  var width = maxWidth(str);
  var rows = str.split("\n");
  rows = rows.map(function (line) {
    return line.padEnd(width, " ");
  });
  var cols = Array.from(Array(width)).map(function (_, index) {
    return rows.map(function (row) {
      return row[index];
    }).join("");
  });
  return cols.join("\n");
};

exports.transpose = transpose;

var maxWidth = function maxWidth(str) {
  return Math.max.apply(Math, _toConsumableArray(str.split("\n").map(function (line) {
    return line.length;
  })));
};

exports.maxWidth = maxWidth;

var swapPalindromes = function swapPalindromes(str) {
  var size = str.length;
  var newStr = new Array(size);

  for (var i = 0; i < size; ++i) {
    if (_palindromes.palindromeMap[str[i]]) {
      newStr[i] = _palindromes.palindromeMap[str[i]];
    } else {
      newStr[i] = str[i];
    }
  }

  return newStr.join("");
};

exports.swapPalindromes = swapPalindromes;

var repeatChar = function repeatChar(num) {
  var _char = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : " ";

  return Array(num).fill(_char).join("");
};

exports.repeatChar = repeatChar;