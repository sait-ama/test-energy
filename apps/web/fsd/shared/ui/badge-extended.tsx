import type { ComponentProps, PropsWithChildren } from 'react';
import React from 'react';

import { cva } from 'class-variance-authority';

import type { BadgeProps } from '@re/ui-kit/ui/badge';
import { badgeVariants } from '@re/ui-kit/ui/badge';
import { Slot } from '@re/ui-kit/ui/slot';
import { cn } from '@re/ui-kit/utils/cn';

interface BadgeRootProps extends ComponentProps<'div'> {
  asChild?: boolean;
}

export const BadgeRoot = (props: BadgeRootProps) => {
  const { children, asChild, className, ...rest } = props;
  const Component = asChild ? Slot : 'div';

  return (
    <Component {...rest} className={cn('relative', className)}>
      {children}
    </Component>
  );
};

const badgeValueVariants = cva(
  'ease-out-cubic absolute z-10 box-border flex items-center justify-center rounded-full px-1 py-0.5 text-[0.65rem] font-medium leading-none transition-transform',
  {
    variants: {
      horizontal: {
        left: 'left-[14%]',
        right: 'right-0',
        center: 'right-[14%]',
      },
      vertical: {
        top: 'top-0',
        center: 'top-[14%]',
        bottom: 'bottom-[14%]',
      },
      invisible: {
        true: 'scale-0 transform',
        false: '',
      },
    },
    compoundVariants: [
      {
        horizontal: 'left',
        vertical: 'top',
        class: 'origin-top-left -translate-x-1/2 -translate-y-1/2',
      },
      {
        horizontal: 'left',
        vertical: 'bottom',
        class: 'origin-bottom-left -translate-x-1/2 translate-y-1/2',
      },
      {
        horizontal: 'center',
        vertical: 'bottom',
        class: 'origin-bottom-center translate-x-1/2 translate-y-1/2',
      },
    ],
    defaultVariants: {
      horizontal: 'right',
      vertical: 'top',
    },
  }
);

interface BadgeValueProps extends BadgeProps {
  max?: number;
  showZero?: boolean;
  horizontalAxis?: 'left' | 'center' | 'right';
  verticalAxis?: 'bottom' | 'center' | 'top';
  className?: string;
}

export const BadgeValue = (props: PropsWithChildren<BadgeValueProps>) => {
  const {
    children,
    variant,
    max = 99,
    showZero,
    horizontalAxis = 'right',
    verticalAxis = 'top',
    className,
    ...rest
  } = props;

  // if (typeof children !== 'number') throw Error("It's forbidden to use not number value");

  let displayValue = children;

  if (typeof children === 'number') {
    if (children === 0 && !showZero) return null;
    displayValue = children > max ? `${max}+` : children;
  }

  return (
    <div
      data-slot="badge"
      className={cn(
        badgeVariants({ variant }),
        badgeValueVariants({
          horizontal: horizontalAxis,
          vertical: verticalAxis,
        }),
        className
      )}
      {...rest}
    >
      {displayValue}
    </div>
  );
};
