import React, { ComponentProps, ReactNode } from 'react';

import { ReText } from '@re/ui-kit/ui/text';

import Person from '~shared/assets/placeholders/person';
import { cn } from '~shared/utils/cn';

//for avoiding i18n drilling
interface UnknownCharacterFallbackProps extends ComponentProps<'div'> {
  actions?: ReactNode;
  header: ReactNode;
  description: ReactNode;
}

export const UnknownHorizontalCharacterCardFallback = ({
  className,
  ref,
  actions,
  header,
  description,
  ...props
}: UnknownCharacterFallbackProps) => {
  return (
    <div
      className={cn(
        'bg-background-content group border-border flex items-center gap-2 overflow-hidden rounded-md border p-2',
        className
      )}
      ref={ref}
      {...props}
    >
      <div className="flex aspect-square h-16 items-center justify-center rounded-sm border">
        <Person size={48} />
      </div>

      <div className="flex p-2"></div>
      <div className="flex w-full flex-col gap-1 pr-2">
        <ReText size="md" lineClamp={1}>
          {header}
        </ReText>
        <ReText size="xs" color="muted-foreground" className="whitespace-nowrap">
          {description}
        </ReText>
      </div>
      {actions}
    </div>
  );
};
