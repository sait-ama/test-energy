'use client';

import * as React from 'react';
import { useId } from 'react';

import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { VariantProps } from 'class-variance-authority';

import Circle from '../icons/circle';
import { cn } from '../utils/cn';

import { buttonVariants } from './button';

const RadioGroup = ({
  ref,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> & {
  ref?: React.RefObject<React.ComponentRef<typeof RadioGroupPrimitive.Root>>;
}) => <RadioGroupPrimitive.Root className={cn('grid gap-2', className)} {...props} ref={ref} />;
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const RadioGroupInputItem = ({
  ref,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> & {
  ref?: React.RefObject<React.ComponentRef<typeof RadioGroupPrimitive.Item>>;
}) => (
  <RadioGroupPrimitive.Item
    ref={ref}
    className={cn(
      'text-primary ring-offset-background focus-visible:ring-ring aspect-square h-4 w-4 rounded-full border border-current focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    {...props}
  >
    <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
      <Circle className="size-2.5 fill-current text-current" />
    </RadioGroupPrimitive.Indicator>
  </RadioGroupPrimitive.Item>
);
RadioGroupInputItem.displayName = RadioGroupPrimitive.Item.displayName;

const RadioGroupButtonItem = ({
  ref,
  className,
  children,
  variant = 'outline',
  color = 'default',
  size = 'default',
  ...props
}: React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> &
  VariantProps<typeof buttonVariants> & {
    ref?: React.RefObject<React.ComponentRef<typeof RadioGroupPrimitive.Item>>;
  }) => {
  const id = useId();

  return (
    <label htmlFor={id} className="flex flex-1">
      <RadioGroupPrimitive.Item
        className={cn(
          buttonVariants({ variant, color, size }),
          'data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=unchecked]:text-secondary-foreground w-full',
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </RadioGroupPrimitive.Item>
    </label>
  );
};
RadioGroupButtonItem.displayName = RadioGroupPrimitive.Item.displayName;

export { RadioGroup, RadioGroupButtonItem, RadioGroupInputItem };
