import { isDateInRange } from '~shared/lib/event-management/date-in-range';

export const is14FebruaryDate = () => isDateInRange(new Date(), 2, 13, 2, 15);
