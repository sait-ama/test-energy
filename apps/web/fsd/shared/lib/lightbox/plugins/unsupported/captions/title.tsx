import * as React from 'react';

import { cn } from '@re/ui-kit/utils/cn';

import { useCaptionsContext } from './captions-context';

import classes from './classes.module.scss';

interface TitleProps {
  title: React.ReactNode;
}

export function Title({ title }: TitleProps) {
  const { visible } = useCaptionsContext();

  if (!visible) {
    return null;
  }

  return (
    <div className={cn(classes.captionsContainer, classes.titleContainer)}>
      <div
        className={cn(
          classes.title,
          'min-w-0 flex-1 overflow-hidden font-bold text-ellipsis whitespace-nowrap text-white'
        )}
        style={{ textOverflow: 'ellipsis' }}
      >
        {title}
      </div>
    </div>
  );
}
