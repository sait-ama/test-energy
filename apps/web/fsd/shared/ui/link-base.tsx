import * as React from 'react';

import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';

import { Slot } from '@re/ui-kit/ui/slot';
import { cn } from '@re/ui-kit/utils/cn';

export const linkBaseVariants = cva('cursor-pointer duration-200 transition-colors', {
  variants: {
    variant: {
      default: 'text-primary underline-offset-4 hover:underline',
      secondary: 'text-muted-foreground underline-offset-4 hover:text-primary hover:underline',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface LinkBaseProps extends VariantProps<typeof linkBaseVariants> {
  children: React.ReactNode;
  className?: string;
}

export const LinkBase = ({
  ref,
  className,
  ...props
}: LinkBaseProps & {
  ref?: React.RefObject<HTMLButtonElement>;
}) => {
  const { children, variant, ...rest } = props;

  return (
    <Slot className={cn(linkBaseVariants({ variant }), className)} ref={ref} {...rest}>
      {children}
    </Slot>
  );
};
