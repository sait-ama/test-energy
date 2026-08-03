'use client';

import Book from '@re/ui-kit/icons/book';
import Cycle from '@re/ui-kit/icons/cycle';
import InPlan from '@re/ui-kit/icons/in-plan';
import Locked from '@re/ui-kit/icons/locked';
import Postponed from '@re/ui-kit/icons/postponed';
import Stack from '@re/ui-kit/icons/stack';
import TimeReverse from '@re/ui-kit/icons/time-reverse';

import { getAbbreviatedNumber } from '~shared/utils/get-abbreviated-number';

interface ReadingStatusProps {
  status: string;
  count: number;
  percentage: number;
  delay?: number;
}

const statusIcons = {
  Читаю: Book,
  'Буду читать': InPlan,
  Прочитано: Locked,
  Отложено: TimeReverse,
  Брошено: Cycle,
  'Не интересно': Postponed,
  Другое: Stack,
};

export const statusIndex = {
  Читаю: 1,
  'Буду читать': 2,
  Прочитано: 3,
  Отложено: 4,
  Брошено: 5,
  'Не интересно': 6,
  Другое: 7,
};

export function ReadingStatus({ status, count, percentage, delay = 0 }: ReadingStatusProps) {
  const Icon = statusIcons[status as keyof typeof statusIcons];

  return (
    <div className="rating-item" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center gap-2 text-sm">
        <div className="flex min-w-[120px] items-center gap-2">
          <Icon className="size-4 min-h-4 min-w-4" />
          <span className="w-max whitespace-nowrap">{status}</span>
        </div>
        <div className="bg-secondary relative h-2 w-full overflow-hidden rounded-full">
          <div className="progress-bar h-full bg-blue-400" style={{ width: `${percentage}%` }} />
        </div>
        <span style={{ width: 'max-width' }} className="text-muted-foreground w-max font-semibold">
          {getAbbreviatedNumber(count)}
        </span>
      </div>
    </div>
  );
}
