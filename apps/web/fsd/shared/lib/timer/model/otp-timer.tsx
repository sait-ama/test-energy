import { ComponentProps, FC } from 'react';

import { cn } from '@re/ui-kit/utils/cn';
import type { Dayjs } from 'dayjs';

import { FormattedTimePart } from '~shared/lib/timer/model/types';
import { useTimerWithIntl } from '~shared/lib/timer/model/use-timer-with-intl';
import { TimerSlot } from '~shared/lib/timer/ui/timer';

interface OtpTimerProps {
  targetDate: string | Dayjs;
  format?: 'full' | 'compact' | 'timeOnly';
  className?: string;
  onComplete?: () => void;
}

interface TimerGroupProps extends ComponentProps<'div'>, ComponentProps<'div'> {
  value: { display: string; raw: number };
  label: string;
}

const TimeGroup: FC<TimerGroupProps> = ({ value, className, label }) => {
  return <TimerSlot count={value.display} label={label} className={cn('text-center', className)} />;
};

export const OtpTimer: FC<OtpTimerProps> = ({ targetDate, className = '', onComplete }) => {
  const { getFormattedParts, isCompleted, timeLeft } = useTimerWithIntl(
    targetDate,
    {
      onComplete,
      autoStart: true,
    },
    'reusable.timer'
  );
  if (isCompleted) {
    return null;
  }

  const originalFormattedTimeParts = getFormattedParts(false);
  const formattedParts = {
    ...originalFormattedTimeParts,
    months: { ...originalFormattedTimeParts.months, isSignificant: false, value: 0 },
    days: {
      ...originalFormattedTimeParts.days,
      value: originalFormattedTimeParts.days.value + originalFormattedTimeParts.months.value * 30,
    },
  };
  const significantParts: FormattedTimePart[] = [];
  for (const k in formattedParts) {
    const key = k as keyof typeof formattedParts;
    if (formattedParts[key].isSignificant) {
      significantParts.push(formattedParts[key]);
    }
  }

  const formatValue = (value: number): { display: string; raw: number } => {
    return {
      display: value.toString().padStart(2, '0'),
      raw: value,
    };
  };

  const renderTimeParts = () => {
    return significantParts.map((part) => (
      <TimeGroup key={part.label} value={formatValue(part.value)} label={part.label} />
    ));
  };

  const timeParts = renderTimeParts();

  if (timeParts.length === 0) {
    return null;
  }
  return <div className={cn('flex', className)}>{timeParts}</div>;
};
