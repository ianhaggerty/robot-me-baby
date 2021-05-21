const palindromes = [
  ["<", ">"],
  ["[", "]"],
  ["{", "}"],
  ["(", ")"],
  ["/", "\\"],
];

export type PalindromeMapType = {
  [x: string]: string;
};

export const palindromeMap = (() => {
  const map: PalindromeMapType = {};
  palindromes.forEach((pair) => {
    map[pair[0]] = pair[1];
    map[pair[1]] = pair[0];
  });
  return map;
})();
