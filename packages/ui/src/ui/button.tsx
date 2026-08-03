import * as React from 'react';
import { ComponentProps, memo, ReactElement } from 'react';

import { Slot, Slottable } from '@radix-ui/react-slot';
import { cn } from '@re/ui-kit/utils/cn';
import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';

import { Spinner } from './spinner';

const dataFocusVisibleClasses = ['outline-none', 'focus-visible:outline-hidden', 'ring-0'];

const buttonVariants = cva(
  [
    'cs-button',
    'z-0',
    'cursor-pointer',
    'group',
    'relative',
    'inline-flex',
    'items-center',
    'justify-center',
    'box-border',
    'appearance-none',
    'outline-none',
    'select-none',
    'whitespace-nowrap',
    'min-w-max',
    'font-medium',
    'subpixel-antialiased',
    'transition-all',
    'tap-highlight-transparent',
    'transform-gpu data-[pressed=true]:scale-[0.97]',
    'opacity-100',
    ...dataFocusVisibleClasses,
  ],
  {
    variants: {
      variant: {
        default: '',
        outline: 'border bg-transparent',
        muted: 'bg-muted hover:bg-muted/60 border border-border',
        // @deprecated
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        // @deprecated
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        ghost: 'bg-transparent',
        link: 'bg-transparent underline-offset-4 hover:underline',
        flat: '',
        shadow: 'shadow-lg hover:shadow-md',
      },
      color: {
        default: '',
        primary: '',
        secondary: '',
        success: '',
        warning: '',
        danger: '',
        background: '',
        muted: '',
        gray: '',
      },
      radius: {
        none: 'rounded-none',
        sm: 'rounded-small',
        md: 'rounded-medium',
        lg: 'rounded-large',
        full: 'rounded-full',
      },
      size: {
        xs: 'px-2 h-[20px] min-w-[20px] text-xs',
        sm: 'px-3 h-[30px] min-w-[30px] text-xs',
        default: 'px-4 h-9 min-w-9 text-sm',
        lg: 'px-5 h-10 min-w-10 text-sm',
        xl: 'px-6 h-12 min-w-12 text-md font-semibold',
      },
      circle: {
        true: 'px-0 aspect-square',
      },
      fullWidth: {
        true: 'w-full',
      },
      isDisabled: {
        true: 'opacity-50 pointer-events-none',
      },
      disableAnimation: {
        true: '!transition-none data-[pressed=true]:scale-100',
        false: 'transition-transform-colors-opacity motion-reduce:transition-none',
      },
    },
    defaultVariants: {
      variant: 'default',
      color: 'primary',
      size: 'default',
      fullWidth: false,
      radius: 'full',
      isDisabled: false,
    },
    compoundVariants: [
      // Default + Colors compound variants
      {
        variant: 'default',
        color: 'default',
        class: 'bg-primary text-primary-foreground hover:bg-primary/90',
      },
      {
        variant: 'default',
        color: 'background',
        class: 'bg-background text-secondary-foreground hover:bg-[rgba(255,255,255,0.12)]',
      },
      {
        variant: 'default',
        color: 'primary',
        class: 'bg-primary text-primary-foreground hover:bg-primary/90',
      },
      {
        variant: 'default',
        color: 'secondary',
        class: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
      },
      {
        variant: 'default',
        color: 'success',
        class: 'bg-success text-success-foreground hover:bg-success/90',
      },
      {
        variant: 'default',
        color: 'warning',
        class: 'bg-warning text-warning-foreground hover:bg-warning/90',
      },
      {
        variant: 'default',
        color: 'danger',
        class: 'bg-danger text-danger-foreground hover:bg-danger/90',
      },
      {
        variant: 'default',
        color: 'muted',
        class: 'bg-muted text-foreground hover:bg-muted/90',
      },
      // Outline + Colors compound variants
      {
        variant: 'outline',
        color: 'default',
        class: 'border-border hover:bg-accent/50 hover:text-accent-foreground',
      },
      {
        variant: 'outline',
        color: 'primary',
        class: 'border border-primary hover:bg-primary/20 hover:text-foreground',
      },
      {
        variant: 'outline',
        color: 'secondary',
        class: 'border-secondary hover:bg-secondary/20 hover:text-foreground',
      },
      {
        variant: 'outline',
        color: 'success',
        class: 'border-success hover:bg-success/20 hover:text-foreground',
      },
      {
        variant: 'outline',
        color: 'warning',
        class: 'border-warning hover:bg-warning/20 hover:text-foreground',
      },
      {
        variant: 'outline',
        color: 'danger',
        class: 'border-danger hover:bg-danger/20 hover:text-foreground',
      },
      // Ghost + Colors compound variants
      {
        variant: 'ghost',
        color: 'default',
        class: 'hover:bg-accent hover:text-accent-foreground',
      },
      {
        variant: 'ghost',
        color: 'primary',
        class: 'hover:bg-primary/20 hover:text-primary',
      },
      {
        variant: 'ghost',
        color: 'secondary',
        class: 'hover:bg-secondary/20 hover:text-secondary',
      },
      {
        variant: 'ghost',
        color: 'success',
        class: 'hover:bg-success/20 hover:text-success',
      },
      {
        variant: 'ghost',
        color: 'warning',
        class: 'hover:bg-warning/20 hover:text-warning',
      },
      {
        variant: 'ghost',
        color: 'danger',
        class: 'hover:bg-danger/20 hover:text-danger',
      },
      {
        variant: 'ghost',
        color: 'muted',
        class: 'hover:bg-muted/80',
      },
      // Link + Colors compound variants
      {
        variant: 'link',
        color: 'default',
        class: 'text-primary',
      },
      {
        variant: 'link',
        color: 'primary',
        class: 'text-primary',
      },
      {
        variant: 'link',
        color: 'secondary',
        class: 'text-secondary-foreground',
      },
      {
        variant: 'link',
        color: 'success',
        class: 'text-success',
      },
      {
        variant: 'link',
        color: 'warning',
        class: 'text-warning',
      },
      {
        variant: 'link',
        color: 'danger',
        class: 'text-danger',
      },
      // Flat + Colors compound variants
      {
        variant: 'flat',
        color: 'default',
        class: 'bg-accent/40 hover:bg-accent hover:text-accent-foreground',
      },
      {
        variant: 'flat',
        color: 'primary',
        class: 'bg-primary/20 hover:bg-primary hover:text-primary-foreground',
      },
      {
        variant: 'flat',
        color: 'secondary',
        class: 'bg-secondary/70 hover:bg-secondary hover:text-secondary-foreground',
      },
      {
        variant: 'flat',
        color: 'success',
        class: 'bg-success/20 hover:bg-success hover:text-success-foreground',
      },
      {
        variant: 'flat',
        color: 'warning',
        class: 'bg-warning/20 hover:bg-warning hover:text-warning-foreground',
      },
      {
        variant: 'flat',
        color: 'danger',
        class: 'bg-danger/20 hover:bg-danger hover:text-danger-foreground',
      },
      // Shadow + Colors compound variants
      {
        variant: 'shadow',
        color: 'default',
        class: ' shadow-accent/50 bg-accent font-semibold text-accent-foreground',
      },
      {
        variant: 'shadow',
        color: 'primary',
        class: 'shadow-primary/50 bg-primary font-semibold text-primary-foreground',
      },
      {
        variant: 'shadow',
        color: 'secondary',
        class: 'shadow-secondary/50 bg-secondary text-secondary-foreground',
      },
      {
        variant: 'shadow',
        color: 'success',
        class: 'shadow-success/50 bg-success text-success-foreground',
      },
      {
        variant: 'shadow',
        color: 'warning',
        class: 'shadow-warning/50 bg-warning font-semibold text-warning-foreground',
      },
      {
        variant: 'shadow',
        color: 'danger',
        class: 'shadow-danger/50 bg-danger text-danger-foreground',
      },
      {
        variant: 'flat',
        color: 'gray',
        class: 'bg-gray-400',
      },
    ],
  }
);

export interface ButtonBaseProps extends Omit<ComponentProps<'button'>, 'color'> {
  asChild?: boolean;
  startIcon?: ReactElement<ComponentProps<'div'>>;
  loading?: boolean;
  endIcon?: ReactElement<ComponentProps<'div'>>;
  startIconClassName?: string;
  endIconClassName?: string;
}

export interface ButtonProps extends ButtonBaseProps, VariantProps<typeof buttonVariants> {}

const startIconSizeVariants = {
  xs: { size: 'h-3 w-3', margin: 'mr-1' },
  sm: { size: 'h-3.5 w-3.5', margin: 'mr-2' },
  default: { size: 'h-4 w-4', margin: 'mr-2' },
  lg: { size: 'h-5 w-5', margin: 'mr-3' },
  xl: { size: 'h-5 w-5', margin: 'mr-3' },
};

const endIconSizeVariants = {
  xs: { size: 'h-3 w-3', margin: 'ml-1.5' },
  sm: { size: 'h-3.5 w-3.5', margin: 'ml-2' },
  default: { size: 'h-4 w-4', margin: 'ml-2' },
  lg: { size: 'h-5 w-5', margin: 'ml-3' },
  xl: { size: 'h-5 w-5', margin: 'ml-3' },
};

const Button = memo(
  ({
    ref,
    className,
    variant,
    color = 'default',
    loading,
    size = 'default',
    circle = false,
    asChild = false,
    type = asChild ? undefined : 'button',
    fullWidth,
    startIcon,
    startIconClassName,
    endIcon,
    endIconClassName,
    disabled,
    children,
    ...props
  }: ButtonProps) => {
    const Comp = asChild ? Slot : 'button';
    const startIconVariant =
      (size && startIconSizeVariants?.[size]) || startIconSizeVariants.default;
    const endIconVariant = (size && endIconSizeVariants?.[size]) || startIconSizeVariants.default;

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, color, size, fullWidth, circle, isDisabled: disabled }),
          className
        )}
        type={type}
        ref={ref}
        disabled={loading || disabled}
        data-slot="button"
        {...props}
      >
        {startIcon && (
          <span className={cn('flex items-center', startIconVariant.margin, startIconClassName)}>
            {/*// @ts-ignore*/}
            {React.cloneElement(startIcon, {
              className: cn(startIcon.props?.className, startIconVariant.size),
            })}
          </span>
        )}
        <Slottable>{children}</Slottable>
        {endIcon && (
          <span className={cn('flex items-center', endIconVariant.margin, endIconClassName)}>
            {/*// @ts-ignore*/}
            {React.cloneElement(endIcon, {
              className: cn(endIcon.props?.className, endIconVariant.size),
            })}
          </span>
        )}
        {loading && <Spinner show={loading} />}
      </Comp>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
