import type { Dayjs } from 'dayjs';

export interface UseTimerOptions {
  onComplete?: () => void;
  autoStart?: boolean;
}

export interface TimeParts {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  durationSeconds: number;
}

export interface TimerProps {
  targetDate: string | Dayjs;
  className?: string;
  showZeroValues?: boolean;
  render?: (formattedParts: FormattedTimeParts, showZeroValues: boolean) => React.ReactNode;
  onComplete?: () => void;
  autoStart?: boolean;
}

export interface FormattedTimePart {
  value: number;
  label: string;
  isSignificant: boolean;
}

export interface FormattedTimeParts {
  years: FormattedTimePart;
  months: FormattedTimePart;
  days: FormattedTimePart;
  hours: FormattedTimePart;
  minutes: FormattedTimePart;
  seconds: FormattedTimePart;
}

export interface TimerState {
  timeLeft: TimeParts;
  isRunning: boolean;
  isCompleted: boolean;
  // formattedParts: FormattedTimeParts;
}
