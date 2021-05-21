import { randomSelect } from "./array";
import { palindromeMap } from "../data/palindromes";

export const reverse = (str: string) => {
  return str.split("").reverse().join("");
};

export const capitalize = (str: string) => {
  return str.replace(/(^|\s+)\S/g, (match) => {
    return (
      match.slice(0, match.length - 1) + match[match.length - 1].toUpperCase()
    );
  });
};

// Shuffles the characters in a string.
// Guarantees that each character is within amount of it's original position.
export const shuffle = (str: string, amount: number): string => {
  const indexMap = new Array(str.length);

  function getPossibleIndices(index: number, selected: Array<number>) {
    const indices = [];
    for (let i = index - amount; i <= index + amount; ++i) {
      if (i >= 0 && i < str.length && !selected.includes(i)) {
        indices.push(i);
      }
    }
    return indices;
  }

  let possibleIndices: Array<number>;
  for (let i = 0; i < indexMap.length; ++i) {
    possibleIndices = getPossibleIndices(i, indexMap);
    if (possibleIndices.includes(i - amount)) {
      indexMap[i] = i - amount;
    } else {
      indexMap[i] = randomSelect(possibleIndices);
    }
  }

  return indexMap.map((newIndex) => str[newIndex]).join("");
};

// Transpose (flip rows and cols) for the given string,
// presumably consisting of a number of lines "\n"
export const transpose = (str: string): string => {
  const width = maxWidth(str);
  let rows = str.split("\n");

  rows = rows.map((line) => line.padEnd(width, " "));
  const cols = Array.from(Array(width)).map((_, index) =>
    rows.map((row) => row[index]).join("")
  );
  return cols.join("\n");
};

export const maxWidth = (str: string): number => {
  return Math.max(...str.split("\n").map((line) => line.length));
};

export const swapPalindromes = (str: string): string => {
  const size = str.length;
  const newStr = new Array(size);
  for (let i = 0; i < size; ++i) {
    if (palindromeMap[str[i]]) {
      newStr[i] = palindromeMap[str[i]];
    } else {
      newStr[i] = str[i];
    }
  }
  return newStr.join("");
};

export const repeatChar = (num: number, char = " ") => {
  return Array(num).fill(char).join("");
};
