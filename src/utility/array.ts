/** Returns a random element from an array, which is not equal `prev` */
export function selectNext<Type>(
  prev: Type,
  arr: Array<Type>,
  equals = (a: Type, b: Type) => a === b
): Type {
  const next = randomSelect(arr);

  // TODO infinite loop if arr is empty
  if (equals(prev, next)) {
    return selectNext(prev, arr);
  }
  return next;
}

export function randomSelect<Type>(arr: Array<Type>): Type {
  return arr[Math.floor(Math.random() * arr.length)];
}
