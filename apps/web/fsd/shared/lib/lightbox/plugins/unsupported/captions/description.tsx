import * as React from 'react';

import { cn } from '@re/ui-kit/utils/cn';

import { useCaptionsContext } from './captions-context';

import classes from './classes.module.scss';

interface DescriptionProps {
  description: React.ReactNode;
}

export function Description({ description }: DescriptionProps) {
  const { visible } = useCaptionsContext();

  if (!visible) {
    return null;
  }

  return (
    <div className={cn(classes.captionsContainer, classes.descriptionContainer)}>
      <div
        className={cn(classes.description, 'overflow-hidden text-start hyphens-auto text-white')}
      >
        {description}
      </div>
    </div>
  );
}
