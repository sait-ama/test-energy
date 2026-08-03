export type LengthOrPercentage = number | string;

interface ParsedLength {
  pixel?: number;
  percent?: number;
}

export const parseLengthPercentage = (input: LengthOrPercentage): ParsedLength => {
  if (typeof input === 'number') {
    return { pixel: input };
  }

  if (typeof input === 'string') {
    const value = parseInt(input, 10);
    return input.endsWith('%') ? { percent: value } : { pixel: value };
  }

  return { pixel: 0 };
};
