import type { ReactNode } from 'react';
import * as React from 'react';
import { useState } from 'react';

import * as HoverCardPrimitive from '@radix-ui/react-hover-card';
import { cn } from '@re/ui-kit/utils/cn';

const HoverCard = HoverCardPrimitive.Root;

const HoverCardTrigger = HoverCardPrimitive.Trigger;

type HoverCardContentProps = React.ComponentProps<typeof HoverCardPrimitive.Content>;

const HoverCardContent = ({
  className,
  align = 'center',
  sideOffset = 4,
  ...props
}: HoverCardContentProps) => {
  return (
    <HoverCardPrimitive.Content
      align={align}
      sideOffset={sideOffset}
      className={cn(
        'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-64 rounded-md border p-4 shadow-md outline-hidden',
        className
      )}
      {...props}
    />
  );
};

HoverCardContent.displayName = 'HoverCardContent';

export { HoverCard, HoverCardContent, HoverCardTrigger };

export const HoverCardCustom = ({
  content,
  trigger,
}: {
  content: ReactNode;
  trigger: ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <HoverCard open={open} onOpenChange={setOpen}>
      <HoverCardTrigger asChild>
        <div
          onClick={() => {
            setOpen((v) => !v);
          }}
        >
          {trigger}
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-auto" asChild>
        <div>{open && content}</div>
      </HoverCardContent>
    </HoverCard>
  );
};

export { HoverCardPrimitive };
