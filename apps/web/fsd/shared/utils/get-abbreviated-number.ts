// TODO: migrate to format in ICU (next-intl)
export const getAbbreviatedNumber = (number: number, digits: number = 0) =>
  Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: digits,
  }).format(number);
