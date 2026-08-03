'use client';
import React from 'react';

import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';

import { cn } from '../utils/cn';

const loaderVariants = cva('text-primary', {
  variants: {
    size: {
      xs: 'size-[20px]',
      sm: 'size-[30px]',
      default: 'size-4',
      lg: 'size-10',
      xl: 'size-11',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

interface SpinnerContentProps
  extends VariantProps<typeof loaderVariants>,
    VariantProps<typeof loaderVariants> {
  className?: string;
  children?: React.ReactNode;
  show?: boolean;
}

const Loading = ({ className }: { className?: string }) => (
  <div
    className={cn(
      className,
      'inline-block animate-spin rounded-full border-[3px] border-current border-t-transparent text-blue-600 dark:text-blue-500'
    )}
    role="status"
    aria-label="loading"
  >
    <span className="sr-only">Loading...</span>
  </div>
);

export function Spinner({ size, show, className }: SpinnerContentProps) {
  return show && <Loading className={cn(loaderVariants({ size }), className)} />;
}
