/**
 * @param start Integer number, included
 * @param end Integer number, not included
 * @returns Integer number in [start, end)
 */
export const randInt = (start: number, end: number): number => {
  return Math.floor(Math.random() * (end - start)) + start;
};
