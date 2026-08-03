import { isDateInRange } from '~shared/lib/event-management/date-in-range';

export const isNewYearDate = () => isDateInRange(new Date(), 12, 15, 1, 15);
