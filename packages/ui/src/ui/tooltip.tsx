'use client';

import * as React from 'react';

import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@re/ui-kit/utils/cn';

const TooltipProvider = (
  props: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Provider>
) => {
  const { children, ...rest } = props;

  return (
    <TooltipPrimitive.Provider delayDuration={300} {...rest}>
      {children}
    </TooltipPrimitive.Provider>
  );
};

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipArrow = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.TooltipArrow>) => (
  <TooltipPrimitive.TooltipArrow
    className={cn('fill-primary animate-in fade-in-0 z-50 rounded-md duration-100', className)}
    {...props}
  />
);

TooltipArrow.displayName = TooltipPrimitive.TooltipArrow.displayName;

const TooltipContent = ({
  ref,
  className,
  sideOffset = 4,
  ...props
}: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> & {
  ref?: React.RefObject<React.ComponentRef<typeof TooltipPrimitive.Content>>;
}) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      'border-border bg-background text-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 overflow-hidden rounded-md border px-3 py-1.5 text-xs',
      className
    )}
    {...props}
  />
);
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipArrow, TooltipContent, TooltipProvider, TooltipTrigger };
