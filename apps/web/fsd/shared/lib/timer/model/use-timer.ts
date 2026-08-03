import { useCallback, useEffect, useState } from 'react';

import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

import { TimeParts, TimerState, UseTimerOptions } from '~shared/lib/timer/model/types';

dayjs.extend(duration);
dayjs.extend(utc);
dayjs.extend(timezone);
export const calculateTimeLeftInSeconds = (now: dayjs.Dayjs, target: dayjs.Dayjs): number => {
  if (target.isBefore(now)) {
    return 0;
  }

  return target.diff(now, 'second');
};
export const calculateTimeLeft = (
  now: dayjs.Dayjs,
  target: dayjs.Dayjs
): TimeParts & { durationSeconds: number } => {
  if (target.isBefore(now)) {
    return { years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0, durationSeconds: 0 };
  }

  const diff = target.diff(now);
  const durationObj = dayjs.duration(diff);

  return {
    years: durationObj.years(),
    months: durationObj.months(),
    days: durationObj.days(),
    hours: durationObj.hours(),
    minutes: durationObj.minutes(),
    seconds: durationObj.seconds(),
    durationSeconds: diff / 1000,
  };
};
const averageDaysInMonths = 30.44;
export const formatDuration = (seconds: number): { timePart: keyof TimeParts; count: number } => {
  if (seconds < 60) {
    return { timePart: 'seconds', count: Math.round(seconds) };
  }

  const minutes = seconds / 60;
  if (minutes < 60) {
    return { timePart: 'minutes', count: Math.floor(minutes) };
  }

  const hours = minutes / 60;
  if (hours < 24) {
    return { timePart: 'hours', count: Math.round(hours) };
  }

  const days = hours / 24;
  if (days < 30) {
    return { timePart: 'days', count: Math.round(days) };
  }

  const months = days / averageDaysInMonths;
  if (months < 12) {
    return { timePart: 'months', count: Math.round(months) };
  }

  const years = months / 12;
  return { timePart: 'years', count: Math.round(years * 2) / 2 };
};
const normalizeToUTC = (date: string | dayjs.Dayjs | Date): dayjs.Dayjs => {
  return dayjs(date).utc();
};
export const useTimer = (targetDate: string | dayjs.Dayjs, options: UseTimerOptions = {}) => {
  const { onComplete, autoStart = true } = options;

  const [state, setState] = useState<TimerState>(() => {
    const now = normalizeToUTC(dayjs().utc());
    const target = normalizeToUTC(targetDate);
    const initialTimeLeft = calculateTimeLeft(now, target);

    return {
      timeLeft: initialTimeLeft,
      isRunning: autoStart && target.isAfter(now),
      isCompleted: target.isBefore(now),
    };
  });

  const start = useCallback(() => {
    setState((prev) => ({ ...prev, isRunning: true }));
  }, []);

  const pause = useCallback(() => {
    setState((prev) => ({ ...prev, isRunning: false }));
  }, []);

  const reset = useCallback(
    (newTargetDate?: string | dayjs.Dayjs) => {
      const now = normalizeToUTC(dayjs().utc());
      const target = newTargetDate ? normalizeToUTC(newTargetDate) : normalizeToUTC(targetDate);
      const timeLeft = calculateTimeLeft(now, target);

      setState({
        timeLeft,
        isRunning: autoStart && target.isAfter(now),
        isCompleted: target.isBefore(now),
      });
    },
    [targetDate, autoStart]
  );

  useEffect(() => {
    if (!state.isRunning || state.isCompleted) return;

    const interval = setInterval(() => {
      const now = normalizeToUTC(dayjs().utc());
      const target = normalizeToUTC(targetDate);

      if (target.isBefore(now)) {
        setState((prev) => ({
          ...prev,
          isRunning: false,
          isCompleted: true,
          timeLeft: {
            years: 0,
            months: 0,
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            durationSeconds: 0,
          },
        }));
        onComplete?.();
        return;
      }

      const timeLeft = calculateTimeLeft(now, target);
      setState((prev) => ({ ...prev, timeLeft }));
    }, 1000);

    return () => clearInterval(interval);
  }, [
    state.isRunning,
    state.isCompleted,
    targetDate,
    onComplete,
    calculateTimeLeft,
    normalizeToUTC,
  ]);

  return {
    ...state,
    start,
    pause,
    reset,
  };
};
