import React, { MouseEvent } from 'react';

import { Switch } from '@re/ui-kit/ui/switch';
import { ReText } from '@re/ui-kit/ui/text';

import { useSnow } from '~app/providers/snow-provider';
import { isNewYearDate } from '~shared/lib/event-management/is-new-year';

export const SnowSwitch = () => {
  const { isSnowEnabled, toggleSnow } = useSnow();
  const isNewYear = isNewYearDate();

  if (!isNewYear) return null;

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    toggleSnow();
  };

  return (
    <div className="flex w-full items-center justify-between" onClick={handleClick}>
      <ReText size="sm">Включить снег</ReText>
      <Switch className="ml-auto" checked={isSnowEnabled} />
    </div>
  );
};
