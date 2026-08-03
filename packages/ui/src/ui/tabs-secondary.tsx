'use client';

import * as React from 'react';
import { ComponentProps } from 'react';

import * as TabsPrimitive from '@radix-ui/react-tabs';
import { createContext } from '@re/core/utils/create-context';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../utils/cn';

const TabsSecondaryRoot = (props: ComponentProps<typeof TabsPrimitive.Root>) => {
  return <TabsPrimitive.Root {...props} className={cn('cs-tabs-root', props.className)} />;
};

const tabsSecondaryListVariants = cva(
  'inline-flex items-center justify-center gap-2  text-foreground',
  {
    variants: {
      size: {
        xs: 'h-9 py-0.5',
        sm: 'h-9 py-1',
        md: 'h-10 p-1',
      },
      variant: {
        default: '',
      },
      defaultVariants: {
        variant: 'default',
        size: 'md',
      },
    },
  }
);

type Tabs = {
  variant?: 'default' | 'secondary';
  size?: 'xs' | 'sm' | 'md';
};

export const { Provider: TabsProvider, useStore: useTabsContext } = createContext<Tabs, Tabs>(
  (v) => v
);

export interface TabsSecondaryListProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>,
    VariantProps<typeof tabsSecondaryListVariants> {}

const TabsSecondaryList = (
  props: TabsSecondaryListProps & {
    ref?: React.RefObject<React.ComponentRef<typeof TabsPrimitive.List>>;
  } & Tabs
) => {
  const { ref, className, variant = 'default', size = 'md', ...rest } = props;

  return (
    <TabsProvider value={{ variant, size }}>
      <TabsPrimitive.List
        ref={ref}
        className={cn(tabsSecondaryListVariants({ size, variant }), className)}
        {...rest}
      />
    </TabsProvider>
  );
};
TabsSecondaryList.displayName = TabsPrimitive.List.displayName;

const tabsSecondaryTriggerVariants = cva(
  'inline-flex relative text-sm items-center h-full justify-center whitespace-nowrap  ring-offset-background transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ',
  {
    variants: {
      variant: {
        default:
          'cs-tabs-item bg-secondary font-medium rounded-md hover:bg-accent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow data-[state=active]:hover:opacity-85',
        secondary:
          'cs-tabs-item bg-muted font-medium rounded-md hover:bg-muted/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow data-[state=active]:hover:opacity-85',
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
  }
);

interface TabsSecondaryTriggerProps
  extends React.ComponentProps<typeof TabsPrimitive.Trigger>,
    Omit<VariantProps<typeof tabsSecondaryTriggerVariants>, 'variant'> {}

const TabsSecondaryTrigger = (props: TabsSecondaryTriggerProps) => {
  const { ref, className, asChild, ...rest } = props;
  const { variant, size } = useTabsContext();

  return (
    <TabsPrimitive.Trigger
      asChild={asChild}
      ref={ref}
      className={cn(tabsSecondaryTriggerVariants({ variant, size, className }))}
      {...rest}
    />
  );
};
TabsSecondaryTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsSecondaryContent = ({
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
TabsSecondaryContent.displayName = TabsPrimitive.Content.displayName;

export const TabsSecondary = {
  Root: TabsSecondaryRoot,
  Content: TabsSecondaryContent,
  List: TabsSecondaryList,
  Trigger: TabsSecondaryTrigger,
};
