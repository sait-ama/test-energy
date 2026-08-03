export const hasFalsy = (...values: unknown[]): boolean => {
  for (const val of values) {
    if (val === undefined || val === null) {
      return true;
    }
  }
  return false;
};
