import { ComponentProps, memo } from 'react';

import { Slot } from '@re/ui-kit/ui/slot';
import { cn } from '@re/ui-kit/utils/cn';
import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';

export const textVariants = cva('cs-text', {
  variants: {
    size: {
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-md',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl',
    },
    leading: {
      none: 'leading-none',
      xs: 'leading-xs',
      sm: 'leading-sm',
      md: 'leading-md',
      lg: 'leading-lg',
      xl: 'leading-xl',
      '2xl': 'leading-2xl',
      '3xl': 'leading-3xl',
    },
    indent: {
      xxs: 'mb-xxs',
      xs: 'mb-3',
      sm: 'mb-3',
      md: 'mb-4',
      lg: 'mb-5',
      xl: 'mb-6',
      '2xl': 'mb-7',
      '3xl': 'mb-8',
      '4xl': 'mb-9',
      '5xl': 'mb-10',
    },
    weight: {
      light: 'font-light',
      regular: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
      extrabold: 'font-extrabold',
    },
    breakable: {
      true: 'break-all',
    },
    noWrap: {
      true: 'no-wrap',
    },
    lineClamp: {
      1: 'line-clamp-1',
      2: 'line-clamp-2',
      3: 'line-clamp-3',
      4: 'line-clamp-4',
      5: 'line-clamp-5',
      6: 'line-clamp-6',
    },
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
      justify: 'text-justify',
      start: 'text-start',
      end: 'text-end',
    },
    color: {
      foreground: 'text-foreground',
      'accent-foreground': 'text-accent-foreground',
      'primary-foreground': 'text-primary-foreground',
      'secondary-foreground': 'text-secondary-foreground',
      'muted-foreground': 'text-muted-foreground',
      'card-foreground': 'text-card-foreground',
      'popover-foreground': 'text-popover-foreground',
      'destructive-foreground': 'text-destructive-foreground',
      accent: 'text-accent',
      primary: 'text-primary',
      background: 'text-background',
      secondary: 'text-secondary',
      muted: 'text-muted',
      card: 'text-card',
      popover: 'text-popover',
      destructive: 'text-destructive',
      success: 'text-success',
    },
  },
  defaultVariants: {
    color: 'foreground',
    weight: 'regular',
  },
});

export type TextElements = 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'label';
export type TextVariants = VariantProps<typeof textVariants>;

export type TextProps = {
  breakable?: boolean;
  component?: TextElements;
  asChild?: boolean;
  /**
   * Чтобы отобразить с учётом &shy без setHtml ->\u00AD
   * */
  safeHyphen?: boolean;
} & TextVariants &
  ComponentProps<TextElements>;

export const ReText = memo((props: TextProps) => {
  const {
    noWrap,
    breakable,
    ref,
    asChild,
    align,
    component = 'p',
    size = 'md',
    leading = size,
    weight,

    color,
    indent,
    dangerouslySetInnerHTML,
    lineClamp,
    className,
    ...other
  } = props;

  const Component = asChild ? Slot : component;

  return (
    <Component
      ref={ref}
      dangerouslySetInnerHTML={dangerouslySetInnerHTML}
      className={cn(
        textVariants({
          breakable,
          lineClamp,
          noWrap,
          align,
          color,
          leading,
          size,
          weight,
          indent,
        }),
        className
      )}
      {...other}
    />
  );
});
