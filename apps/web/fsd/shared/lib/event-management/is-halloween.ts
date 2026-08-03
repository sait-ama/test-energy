import { isDateInRange } from '~shared/lib/event-management/date-in-range';

export const halloweenDates = {
  startMonth: 10,
  startDay: 20,
  endMonth: 11,
  endDate: 10,
};

export const isHalloweenDate = () => {
  const { startMonth, startDay, endMonth, endDate } = halloweenDates;
  return isDateInRange(new Date(), startMonth, startDay, endMonth, endDate, {
    timeZone: 'Europe/Moscow',
  });
};
