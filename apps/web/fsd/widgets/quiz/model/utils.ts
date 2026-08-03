export type OptionStatus = 'unchoosen' | 'right' | 'wrong' | 'empty';

export const getOptionStatus = (isChoosen: boolean, isCorrect: boolean): OptionStatus => {
  if (!isChoosen && isCorrect) return 'unchoosen';
  if (isChoosen && isCorrect) return 'right';
  if (isChoosen && !isCorrect) return 'wrong';
  return 'empty';
};
