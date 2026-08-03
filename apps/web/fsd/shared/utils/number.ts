export const round = (value: number, decimals = 0) => {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
};

export const calculateSoSoArrayIndex4Slides = (index: number, arrayLength: number) =>
  arrayLength > 0 ? ((index % arrayLength) + arrayLength) % arrayLength : 0;
