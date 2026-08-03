import dayjs from 'dayjs';

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

export const getStatisticsFields = (data: { clicks?: number | null; views?: number | null }[]) => {
  const viewsToday = data[data.length - 1]?.views ?? 0;
  const clicksToday = data[data.length - 1]?.clicks ?? 0;
  const ctrToday = getCtr({ views: viewsToday, clicks: clicksToday });

  const viewsOverall = data.reduce((acc, it) => acc + (it.views ?? 0), 0);
  const clicksOverall = data.reduce((acc, it) => acc + (it.clicks ?? 0), 0);
  const ctrOverall = getCtr({ views: viewsOverall, clicks: clicksOverall });

  return {
    viewsToday,
    clicksToday,
    ctrToday,
    viewsOverall,
    clicksOverall,
    ctrOverall,
  };
};

export const getDaysSpent = (data: { dateStart: string; dateEnd: string }) => {
  if (dayjs().isBefore(dayjs(data.dateStart))) return 0;

  if (dayjs().isAfter(dayjs(data.dateEnd)))
    return Math.round(Math.abs(dayjs(data.dateStart).diff(dayjs(data.dateEnd), 'day', true)));

  return Math.round(Math.abs(dayjs().diff(dayjs(data.dateStart), 'day', true)));
};

export const getDateFields = (data: { dateStart: string; dateEnd: string }) => {
  const daysSpent = getDaysSpent(data);
  const totalDays = Math.round(
    Math.abs(dayjs(data.dateEnd).diff(dayjs(data.dateStart), 'day', true))
  );
  const daysLeft = totalDays - daysSpent;

  const isActive =
    dayjs().isSameOrAfter(dayjs(data.dateStart)) && dayjs().isSameOrBefore(dayjs(data.dateEnd));

  return {
    daysSpent: Number.isFinite(daysSpent) ? daysSpent : 0,
    daysLeft: Number.isFinite(daysLeft) ? daysLeft : 0,
    dateStart: data.dateStart,
    dateEnd: data.dateEnd,
    totalDays: Number.isFinite(totalDays) ? totalDays : 0,
    isActive,
  };
};
