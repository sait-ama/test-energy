'use client';

import * as React from 'react';

import * as SelectPrimitive from '@radix-ui/react-select';
import { Slottable } from '@radix-ui/react-slot';
import ChevronDown from '@re/ui-kit/icons/chevron-down';
import ChevronUp from '@re/ui-kit/icons/chevron-top';
import { cn } from '@re/ui-kit/utils/cn';

export interface SelectRootProps<T extends string = string>
  extends React.ComponentProps<typeof SelectPrimitive.Root> {
  value: T;
  defaultValue?: T;
  onValueChange?: (value: T) => void;
}

export function Select<T extends string = string>(props: SelectRootProps<T>) {
  return <SelectPrimitive.Root {...props} />;
}

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

export interface SelectProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> {
  withIcon?: boolean;
}

const SelectTrigger = ({
  ref,
  className,
  children,
  withIcon = true,
  ...props
}: SelectProps & {
  ref?: React.RefObject<React.ComponentRef<typeof SelectPrimitive.Trigger>>;
}) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      'cs-select-trigger border-border bg-input ring-offset-background placeholder:text-muted-foreground focus:ring-ring flex h-10 w-full items-center justify-between rounded-md border px-4 py-2 text-start text-sm focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
      className
    )}
    {...props}
  >
    <Slottable>{children}</Slottable>
    {withIcon && (
      <SelectPrimitive.Icon asChild className="group ml-1">
        <ChevronDown
          className="relative size-4 transition duration-300 group-data-[state=open]:rotate-180"
          aria-hidden="true"
        />
      </SelectPrimitive.Icon>
    )}
  </SelectPrimitive.Trigger>
);
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = ({
  ref,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton> & {
  ref?: React.RefObject<React.ComponentRef<typeof SelectPrimitive.ScrollUpButton>>;
}) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn('flex cursor-default items-center justify-center py-1', className)}
    {...props}
  >
    <ChevronUp />
  </SelectPrimitive.ScrollUpButton>
);
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = ({
  ref,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton> & {
  ref?: React.RefObject<React.ComponentRef<typeof SelectPrimitive.ScrollDownButton>>;
}) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn('flex rotate-180 cursor-default items-center justify-center py-1', className)}
    {...props}
  >
    <ChevronDown />
  </SelectPrimitive.ScrollDownButton>
);
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

const SelectContent = ({
  ref,
  className,
  children,
  position = 'popper',
  ...props
}: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> & {
  ref?: React.RefObject<React.ComponentRef<typeof SelectPrimitive.Content>>;
}) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        'cs-select-content border-border bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border shadow-md',
        position === 'popper' &&
          'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
        className
      )}
      position={position}
      {...props}
    >
      {/*<SelectScrollUpButton />*/}
      <SelectPrimitive.Viewport
        className={cn(
          'p-1',
          position === 'popper' &&
            'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]'
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      {/*<SelectScrollDownButton />*/}
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
);
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = ({
  ref,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label> & {
  ref?: React.RefObject<React.ComponentRef<typeof SelectPrimitive.Label>>;
}) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn('cs-select-label text-muted-foreground px-2 py-1.5 text-xs', className)}
    {...props}
  />
);
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = ({
  ref,
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> & {
  ref?: React.RefObject<React.ComponentRef<typeof SelectPrimitive.Item>>;
}) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'focus:bg-accent cs-select-item focus:text-accent-foreground data-[state="checked"]:bg-primary data-[state="checked"]:text-primary-foreground relative z-50 flex w-full cursor-default items-center rounded-full py-1.5 pr-2 pl-4 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className
    )}
    {...props}
  >
    <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator />
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
);
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = ({
  ref,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator> & {
  ref?: React.RefObject<React.ComponentRef<typeof SelectPrimitive.Separator>>;
}) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn('cs-select-separator bg-muted -mx-1 my-1 h-px', className)}
    {...props}
  />
);
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
