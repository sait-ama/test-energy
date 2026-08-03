import { useTranslations } from 'next-intl';

import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';

import { FormattedTimeParts, TimeParts, UseTimerOptions } from './types';
import { useTimer as useBaseTimer } from './use-timer';

dayjs.extend(utc);
const orderedKeys: (keyof TimeParts)[] = ['years', 'months', 'days', 'hours', 'minutes', 'seconds'];
const labels = {
  years: 'years',
  months: 'months',
  days: 'days',
  hours: 'hours',
  minutes: 'minutes',
  seconds: 'seconds',
};
export const useTimerWithIntl = (
  targetDate: string | Dayjs,
  options: UseTimerOptions = {},
  key = 'reusable.timer-extends'
) => {
  const t = useTranslations(key);

  const timer = useBaseTimer(targetDate, { ...options });

  const formatTimeParts = (
    timeParts: TimeParts,
    showZeroValues: boolean = false
  ): FormattedTimeParts => {
    const parts = {
      years: { value: timeParts.years, label: labels.years },
      months: { value: timeParts.months, label: labels.months },
      days: { value: timeParts.days, label: labels.days },
      hours: { value: timeParts.hours, label: labels.hours },
      minutes: { value: timeParts.minutes, label: labels.minutes },
      seconds: { value: timeParts.seconds, label: labels.seconds },
    };

    let foundSignificant = false;

    const formattedParts: FormattedTimeParts = {} as FormattedTimeParts;

    orderedKeys.forEach((key) => {
      const part = parts[key];
      const isSignificant = foundSignificant || part.value > 0;
      if (part.value > 0) foundSignificant = true;

      formattedParts[key] = {
        value: part.value,
        label: t(key, { count: part.value }),
        isSignificant: showZeroValues ? true : isSignificant,
      };
    });

    return formattedParts;
  };

  const getFormattedParts = (showZeroValues: boolean = false) => {
    return formatTimeParts(timer.timeLeft, showZeroValues);
  };

  return {
    ...timer,
    getFormattedParts,
    formatTimeParts,
    labels,
  };
};
