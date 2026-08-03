'use client';

import * as React from 'react';

import { Slot } from '@re/ui-kit/ui/slot';
import { cn } from '@re/ui-kit/utils/cn';

interface FanLayoutProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const FanLayout = ({ children, className, size = 'md' }: FanLayoutProps) => {
  const sizeClasses = {
    sm: 'w-32 h-44',
    md: 'w-40 h-56',
    lg: 'w-48 h-64',
  };

  return <div className={cn('relative', sizeClasses[size], className)}>{children}</div>;
};

export enum FanPosition {
  LEFT,
  CENTER,
  RIGHT,
}
interface FanItemProps {
  children: React.ReactNode;
  position: FanPosition;
  className?: string;
  asChild?: boolean;
  withHoverEffect?: boolean;
}
const positionClasses = [
  'rotate-[-13deg] z-25 -translate-x-[40px] translate-y-[20px]',
  'rotate-[2deg] z-20 translate-x-[7%]',
  'rotate-[12deg] z-15 translate-x-[35%]',
] as [string, string, string];

export const FanItem = ({
  withHoverEffect = true,
  children,
  position,
  className,
  asChild,
}: FanItemProps) => {
  const Comp = asChild ? Slot : 'div';
  return (
    <Comp
      className={cn(
        'absolute inset-0 scale-[0.9] shadow transition-all duration-300',
        positionClasses[position],
        { 'hover:z-30 hover:scale-[1.009] hover:shadow-lg': withHoverEffect },
        className
      )}
    >
      {children}
    </Comp>
  );
};
