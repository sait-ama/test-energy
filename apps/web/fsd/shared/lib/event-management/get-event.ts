import { is14FebruaryDate } from '~shared/lib/event-management/is-14-february';
import { isHalloweenDate } from '~shared/lib/event-management/is-halloween';
import { isNewYearDate } from '~shared/lib/event-management/is-new-year';

export enum EventDateType {
  NEW_YEAR = 'newYear',
  HALLOWEEN = 'halloween',
  LOVING = 'loving',
  DEFAULT = 'default',
}

export const getEvent = (): EventDateType => {
  const [isHalloween, isNewYear, is14February] = [
    isHalloweenDate(),
    isNewYearDate(),
    is14FebruaryDate(),
  ];
  if (is14February) return EventDateType.LOVING;
  if (isHalloween) return EventDateType.HALLOWEEN;
  if (isNewYear) return EventDateType.NEW_YEAR;
  return EventDateType.DEFAULT;
};
