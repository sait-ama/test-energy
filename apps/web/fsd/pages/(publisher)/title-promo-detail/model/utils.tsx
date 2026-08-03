export interface GetCtrOptions {
  clicks?: number | null;
  views?: number | null;
}

export const getCtr = ({ clicks, views }: GetCtrOptions): number =>
  Math.round(((clicks ?? 0) / (views ?? 0)) * 100 * 10) / 10 || 0;

export const pickEdgeDates = (dates: string[]) => {
  if (dates.length <= 3) return dates;

  const startDate = dates[0];
  const endDate = dates[dates.length - 1];
  const middleDate = dates[Math.floor(dates.length / 2)];

  return [startDate, middleDate, endDate];
};
