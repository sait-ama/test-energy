'use client';

import * as React from 'react';
import { ComponentProps } from 'react';

import * as TabsPrimitive from '@radix-ui/react-tabs';
import { createContext } from '@re/core/utils/create-context';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../utils/cn';

const Tabs = (props: ComponentProps<typeof TabsPrimitive.Root>) => {
  return <TabsPrimitive.Root {...props} className={cn('cs-tabs-root', props.className)} />;
};

const tabsListVariants = cva('inline-flex items-center justify-center gap-2  text-foreground', {
  variants: {
    size: {
      xs: 'h-8 py-0.5',
      sm: 'h-9 py-1',
      md: 'h-10 p-1',
    },
    variant: {
      default: 'cs-tabs-list bg-white dark:bg-secondary rounded-full',
      underline: 'cs-tabs-list-underline pb-[2px] gap-6',
      pill: 'cs-tabs-list-pill gap-2 ',
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
  compoundVariants: [
    {
      variant: 'underline',
      size: 'xs',
      className: 'p-0',
    },
    {
      variant: 'underline',
      size: 'sm',
      className: 'p-0',
    },
    {
      variant: 'underline',
      size: 'md',
      className: 'p-0 h-11',
    },
    {
      variant: 'pill',
      size: 'xs',
      className: 'p-0',
    },
    {
      variant: 'pill',
      size: 'sm',
      className: 'p-0 h-10',
    },
    {
      variant: 'pill',
      size: 'md',
      className: 'p-0 h-10',
    },
  ],
});

type Tabs = {
  variant?: 'default' | 'underline' | 'pill';
  size?: 'xs' | 'sm' | 'md';
};

export const { Provider: TabsProvider, useStore: useTabsContext } = createContext<Tabs, Tabs>(
  (v) => v
);

export interface TabsListProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>,
    VariantProps<typeof tabsListVariants> {}

const TabsList = (
  props: TabsListProps & {
    ref?: React.RefObject<React.ComponentRef<typeof TabsPrimitive.List>>;
  } & Tabs
) => {
  const { ref, className, variant = 'default', size = 'md', ...rest } = props;

  return (
    <TabsProvider value={{ variant, size }}>
      <TabsPrimitive.List
        ref={ref}
        className={cn(tabsListVariants({ size, variant }), className)}
        {...rest}
      />
    </TabsProvider>
  );
};
TabsList.displayName = TabsPrimitive.List.displayName;

export const tabsTriggerVariants = cva(
  'inline-flex relative text-sm items-center h-full justify-center whitespace-nowrap  ring-offset-background transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ',
  {
    variants: {
      variant: {
        default:
          'cs-tabs-item font-medium rounded-md hover:bg-accent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow data-[state=active]:hover:opacity-85',
        underline:
          'cs-tabs-item-underline font-medium data-[state=active]:font-semibold bg-transparent data-[state=active]:after:bg-primary after:absolute after:bottom-[0px] after:left-0 after:right-0 hover:after:bg-foreground/20 after:bg-transparent after:content-[""] after:h-[2px] data-[state=active]:after:h-[2px]  data-[state=active]:hover:opacity-85',
        pill: 'cs-tabs-item-pill font-semibold rounded-md bg-secondary data-[state=active]:bg-foreground data-[state=active]:border-foreground/20 border-1 border-transparent data-[state=active]:text-background data-[state=active]:hover:opacity-85',
      },
      size: {
        xs: 'px-3 py-0.5',
        sm: 'px-3 py-0.5',
        md: 'px-4 py-1',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
    compoundVariants: [
      {
        variant: 'underline',
        size: 'xs',
        className: 'pb-1 p-0',
      },
      {
        variant: 'underline',
        size: 'sm',
        className: 'pb-1.5 px-0',
      },
      {
        variant: 'underline',
        size: 'md',
        className: 'pb-1.5 text-md px-0',
      },
      {
        variant: 'pill',
        size: 'xs',
        className: 'px-2 py-0.5 h-6',
      },
      {
        variant: 'pill',
        size: 'sm',
        className: 'px-3 py-1 h-8',
      },
      {
        variant: 'pill',
        size: 'md',
        className: 'px-4 py-1.5',
      },
    ],
  }
);

interface TabsTriggerProps
  extends React.ComponentProps<typeof TabsPrimitive.Trigger>,
    Omit<VariantProps<typeof tabsTriggerVariants>, 'variant'> {}

const TabsTrigger = (props: TabsTriggerProps) => {
  const { ref, className, asChild, ...rest } = props;
  const { variant, size } = useTabsContext();

  return (
    <TabsPrimitive.Trigger
      asChild={asChild}
      ref={ref}
      className={cn(tabsTriggerVariants({ variant, size, className }))}
      {...rest}
    />
  );
};
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = ({
  ref,
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'ring-offset-background focus-visible:ring-ring mt-2 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden',
      className
    )}
    {...props}
  />
);
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsContent, TabsList, TabsTrigger };
