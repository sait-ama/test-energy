import dayjs from 'dayjs';
import DayJSIsSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import DayJSIsSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import DayJSTimezone from 'dayjs/plugin/timezone';
import DayJSUtc from 'dayjs/plugin/utc';

dayjs.extend(DayJSIsSameOrAfter);
dayjs.extend(DayJSIsSameOrBefore);
dayjs.extend(DayJSUtc);
dayjs.extend(DayJSTimezone);

export const isDateInRange = (
  date: Date,
  startMonth: number,
  startDay: number,
  endMonth: number,
  endDay: number,
  options?: { timeZone: string }
): boolean => {
  const tz = options?.timeZone;
  const tzDate = tz ? dayjs(date).tz(tz) : dayjs(date);

  const targetDate = dayjs(tzDate);
  const currentYear = dayjs().year();

  let startDate = dayjs(new Date(currentYear, startMonth - 1, startDay));
  let endDate = dayjs(new Date(currentYear, endMonth - 1, endDay));

  if (endDate.isBefore(startDate)) {
    if (targetDate.isSameOrAfter(startDate)) {
      endDate = endDate.add(1, 'year');
    } else {
      startDate = startDate.subtract(1, 'year');
    }
  }

  return targetDate.isSameOrAfter(startDate) && targetDate.isSameOrBefore(endDate);
};
