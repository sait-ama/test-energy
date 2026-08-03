'use client';

import * as React from 'react';

import * as ProgressPrimitive from '@radix-ui/react-progress';

import { cn } from '../utils/cn';

interface ProgressProps extends React.ComponentProps<typeof ProgressPrimitive.Root> {
  noSuccessState?: boolean;
  label?: string;
}
const Progress = ({
  ref,
  className,
  value,
  noSuccessState = false,
  label = 'Loading progress',
  ...props
}: ProgressProps) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn('bg-secondary relative h-4 w-full overflow-hidden rounded-full', className)}
    aria-label={label}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(
        'h-full w-full flex-1 transition-all',
        !noSuccessState && { 'bg-success': value === 100 },
        value && 'bg-primary' /* prevent calc bug if zero  */
      )}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
);
Progress.displayName = ProgressPrimitive.Root.displayName;

interface CircleProgressProps extends React.ComponentProps<typeof ProgressPrimitive.Root> {
  label?: string;
}

const CircleProgress = ({
  ref,
  className,
  value,
  label = 'Progress',
  ...props
}: CircleProgressProps) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      `relative flex size-9 items-center justify-center overflow-hidden rounded-full select-none`,
      className
    )}
    aria-label={label}
    {...props}
    style={{
      background: `radial-gradient(closest-side, hsl(var(--r-background)) 79%, transparent 80% 100%), conic-gradient(hsl(var(--r-primary)) ${value || 0}%, hsl(var(--r-secondary)) 0)`,
    }}
  >
    <span className="">{`${value || 0}`}</span>
  </ProgressPrimitive.Root>
);

CircleProgress.displayName = 'CircleProgress';

export { CircleProgress, Progress };
