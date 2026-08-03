import React, { useMemo } from 'react';
import { useFormatter, useNow } from 'next-intl';

export type DateSeparatorProps = {
  date: Date | string;
};

const UnMemoizedDateSeparator = (props: DateSeparatorProps) => {
  const { date } = props;
  const formatter = useFormatter();

  const now = useNow({
    updateInterval: 30000,
  });

  const timestamp = useMemo(() => {
    if (!date) return '';

    const realNow = new Date();

    return formatter.relativeTime(new Date(date), realNow);
  }, [date, now]);

  return (
    <div className="flex w-full justify-center py-4" data-testid="date-separator">
      <div className="text-muted-foreground text-sm">{timestamp}</div>
    </div>
  );
};

export const DateSeparator = React.memo(UnMemoizedDateSeparator) as typeof UnMemoizedDateSeparator;
