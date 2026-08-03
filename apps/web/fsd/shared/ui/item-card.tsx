import type { ComponentProps, ComponentPropsWithoutRef, ReactNode } from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import type { TextProps } from '@re/ui-kit/ui/text';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

export type ContentType = {
  children?: ReactNode;
} & ComponentPropsWithoutRef<'div'>;

export const Content = ({ children, className, ...other }: ContentType) => (
  <div className={cn('flex aspect-square items-center justify-center', className)} {...other}>
    {children}
  </div>
);

export interface FooterType {
  className?: string;
  children?: ReactNode;
}

export const Footer = ({ children, className }: FooterType) => (
  <div className={cn('mt flex items-center justify-between p-2', className)}>{children}</div>
);

export type FooterLabelType = {
  children: ReactNode;
} & TextProps;

export const Label = ({ children, ...other }: FooterLabelType) => (
  <ReText weight="medium" size="sm" color="muted-foreground" {...other}>
    {children}
  </ReText>
);

export const itemCardRootVariants = cva('border-border relative rounded-md border p-2', {
  variants: {
    variant: {
      default: '',
      solid: 'bg-secondary',
    },
    isActive: {
      true: '!border-primary',
    },
    withHover: {
      true: 'group dark:hover:bg-accent/70 cursor-pointer transition-all duration-200 hover:shadow-lg dark:hover:shadow-none',
    },
  },
});

export interface RootProps
  extends ComponentProps<'div'>,
    VariantProps<typeof itemCardRootVariants> {}

export const Root = (props: RootProps) => {
  const { withHover, variant, className, isActive, ...rest } = props;

  return (
    <div
      className={cn(itemCardRootVariants({ withHover, isActive, variant }), 'bg-card', className)}
      {...rest}
    />
  );
};

export type RightCornerProps = {
  children: ReactNode;
  className?: string;
} & ComponentProps<'div'>;

export const RightCorner = ({ className, ...rest }: RightCornerProps) => (
  <div className={cn('right-xs absolute top-2', className)} {...rest} />
);
