export type Falsy<T> = T | null | undefined;
export const isTotalFalsy = (...values: unknown[]): boolean => {
  for (const val of values) {
    if (val !== undefined && val !== null) {
      return false;
    }
  }
  return true;
};
