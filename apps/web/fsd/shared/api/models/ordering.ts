export enum Ordering {
  TIME = 'id', //id-new, -id-old
  SCORE = 'score', //id-new, -id-old
}

export enum PrefixOrderingLessMinus {
  LESS = '-',
  MORE = '-',
}

export enum PrefixRevertOrderingMinus {
  MORE = PrefixOrderingLessMinus.LESS,
  LESS = PrefixOrderingLessMinus.MORE,
}
