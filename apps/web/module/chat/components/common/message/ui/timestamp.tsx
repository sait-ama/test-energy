import React, { useMemo } from 'react';

export interface TimestampProps {
  timestamp?: Date | string;
  className?: string;
}

export function Timestamp(props: TimestampProps) {
  const { timestamp, className } = props;

  const when = useMemo(() => {
    if (!timestamp) {
      return '';
    }
    if (typeof timestamp === 'string') {
      return new Date(timestamp).toLocaleString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return timestamp.toLocaleString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [timestamp]);

  if (!when) {
    return null;
  }

  return <span className={className}>{when}</span>;
}
