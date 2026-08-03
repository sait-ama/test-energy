import type { ComponentProps, ReactNode } from 'react';
import { useMemo } from 'react';

import { Slot } from '@re/ui-kit/ui/slot';
import type { TextProps } from '@re/ui-kit/ui/text';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

interface RootProps extends ComponentProps<'div'> {
  value?: number | null | undefined;
  children?: ReactNode;
}

const Root = (props: RootProps) => {
  const { value: _value, children, className, ...rest } = props;
  const value = props.value ?? 0;

  const circleProps = useMemo<ComponentProps<'circle'>>(() => {
    if (value < 1) return { className: 'hidden' };
    if (value > 99) return {};

    return {
      strokeDashoffset: `calc(${100 - value})`,
      strokeDasharray: '100',
    };
  }, [value]);

  return (
    <div className={cn('relative', className)} {...rest}>
      <svg className="-rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke="hsl(var(--r-secondary))"
          strokeWidth="6"
        />
        <circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke="hsl(var(--r-primary))"
          strokeWidth="6"
          pathLength="100"
          {...circleProps}
        />
      </svg>
      {children}
    </div>
  );
};

interface ContentProps extends Omit<TextProps, 'asChild' | 'children'> {
  asChild?: boolean;
  children?: ReactNode;
}

const Content = (props: ContentProps) => {
  const { asChild, children, className, ...rest } = props;

  const Comp = asChild ? Slot : ReText;

  return (
    <Comp
      size="sm"
      className={cn(
        'absolute top-1/2 top-50 left-1/2 -translate-x-1/2 -translate-y-1/2',
        className
      )}
      {...rest}
    >
      {children}
    </Comp>
  );
};

export interface ProgressCircularProps {
  Root: RootProps;
  Content: ContentProps;
}

export const ProgressCircular = { Content, Root };
