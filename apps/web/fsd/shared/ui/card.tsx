import * as React from 'react';

import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';

import { Slot } from '@re/ui-kit/ui/slot';
import { cn } from '@re/ui-kit/utils/cn';

const cardVariants = cva('rounded-md border border-border text-card-foreground', {
  variants: {
    variant: {
      surface: 'bg-card',
      classic: 'bg-card',
      ghost: 'bg-none',
    },
  },
  defaultVariants: {
    variant: 'surface',
  },
});

interface SlotProps {
  asChild?: boolean;
}

export interface CardProps
  extends React.ComponentProps<'div'>,
    VariantProps<typeof cardVariants>,
    SlotProps {}

const Card = ({ ref, asChild, variant, className, ...props }: CardProps) => {
  const Comp = asChild ? Slot : 'div';

  return (
    <Comp
      data-slot="card"
      ref={ref}
      className={cn(cardVariants({ variant, className }))}
      {...props}
    />
  );
};
Card.displayName = 'Card';

const CardHeader = ({
  ref,
  className,
  asChild,
  ...props
}: React.ComponentProps<'div'> & SlotProps) => {
  const Comp = asChild ? Slot : 'div';

  return (
    <Comp
      data-slot="card-header"
      ref={ref}
      className={cn('flex flex-col gap-1.5 p-4', className)}
      {...props}
    />
  );
};
CardHeader.displayName = 'CardHeader';

const CardTitle = ({
  ref,
  className,
  asChild,
  ...props
}: React.ComponentProps<'h3'> & SlotProps) => {
  const Comp = asChild ? Slot : 'h3';
  return (
    <Comp
      ref={ref}
      className={cn('leading-none font-semibold tracking-tight', className)}
      {...props}
    />
  );
};
CardTitle.displayName = 'CardTitle';

const CardDescription = ({
  ref,
  className,
  asChild,
  ...props
}: React.ComponentProps<'p'> & SlotProps) => {
  const Comp = asChild ? Slot : 'p';
  return <Comp ref={ref} className={cn('text-muted-foreground text-sm', className)} {...props} />;
};
CardDescription.displayName = 'CardDescription';

const CardContent = ({
  ref,
  className,
  withHover = true,
  ...props
}: React.ComponentProps<'div'> & { withHover?: boolean }) => (
  <div
    ref={ref}
    className={cn('p-4 pt-0 transition', withHover && 'hover:opacity-[0.7]', className)}
    {...props}
  />
);
CardContent.displayName = 'CardContent';

const CardFooter = ({ ref, className, ...props }: React.ComponentProps<'div'>) => (
  <div ref={ref} className={cn('flex items-center p-4 pt-0', className)} {...props} />
);
CardFooter.displayName = 'CardFooter';

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
