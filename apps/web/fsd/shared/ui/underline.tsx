'use client';

import type { ReactNode } from 'react';

import NewYearUnderline from '@re/ui-kit/icons/new-year-underline';
import UnderlineIcon from '@re/ui-kit/icons/underline';
import { cn } from '@re/ui-kit/utils/cn';

import { isNewYearDate } from '~shared/lib/event-management/is-new-year';

export interface UnderlineProps {
  children: ReactNode;
  withHover?: boolean;
  className?: string;
}

export const Underline = (props: UnderlineProps) => {
  const { children, withHover = false, className } = props;
  const isNewYear = isNewYearDate();

  return (
    <div
      className={cn(
        'group inline-flex flex-col justify-between',
        withHover && 'cursor-pointer',
        className
      )}
    >
      {children}
      {isNewYear ? (
        <NewYearUnderline
          className={cn(
            'text-primary h-3 w-full rounded-md transition-all duration-200',
            withHover && 'group-hover:px-2'
          )}
        />
      ) : (
        <UnderlineIcon
          className={cn(
            'text-primary h-3 w-full transition-all duration-200',
            withHover && 'group-hover:px-2'
          )}
        />
      )}
    </div>
  );
};
