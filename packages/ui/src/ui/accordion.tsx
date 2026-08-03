'use client';
import * as React from 'react';

import * as AccordionPrimitive from '@radix-ui/react-accordion';

import ChevronDown from '../icons/chevron-down';
import { cn } from '../utils/cn';

import type { IconProps } from './icon';

function Accordion({ ...props }: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return <AccordionPrimitive.Item data-slot="accordion-item" className={className} {...props} />;
}

function AccordionHeader({
  children,
  className,
  ...rest
}: React.ComponentProps<typeof AccordionPrimitive.Header>) {
  return (
    <AccordionPrimitive.Header className={cn('flex cursor-pointer', className)} {...rest}>
      {children}
    </AccordionPrimitive.Header>
  );
}

function AccordionIndicator({ className, ...rest }: IconProps) {
  return (
    <ChevronDown
      className={cn(
        'accordion-indicator ml-4 h-4 w-4 shrink-0 transition-transform duration-200',
        className
      )}
      {...rest}
    />
  );
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Trigger
      data-slot="accordion-trigger"
      className={cn(
        'flex flex-1 items-center justify-between py-0 font-medium transition-all [&[data-state=open]>svg]:rotate-180',
        className
      )}
      {...props}
    >
      {children}
    </AccordionPrimitive.Trigger>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm"
      {...props}
    >
      <div className={cn('pt-0 pb-4', className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionIndicator,
  AccordionItem,
  AccordionTrigger,
};
