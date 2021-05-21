export const sigmoid = (input: number) => {
  return 1 / (1 + Math.exp(-input));
};

export const random = (lower: number, upper: number) => {
  return Math.random() * (upper - lower) + lower;
};
