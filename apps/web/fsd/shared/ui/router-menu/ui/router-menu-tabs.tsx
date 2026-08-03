'use client';
import type { ReactNode } from 'react';
import React from 'react';

import type { TabsProps } from '@radix-ui/react-tabs';

import { ScrollArea, ScrollBar } from '@re/ui-kit/ui/scroll-area';
import type { TabsListProps } from '@re/ui-kit/ui/tabs';
import { Tabs, TabsList, TabsTrigger } from '@re/ui-kit/ui/tabs';

import { useQueryPrimitiveParams } from '~shared/hooks/use-query-params';

type Options = { value: string; label: string }[];

export const RouterMenuTabs = (
  props: Omit<TabsProps, 'children'> & {
    fieldName: string;
    options: Options;
    children?: (options: Options) => ReactNode;
    size?: TabsListProps['size'];
  }
) => {
  const { fieldName, options, size, children, defaultValue, className, ...other } = props;
  const { value, setValue } = useQueryPrimitiveParams({
    defaultValue,
    fieldName,
    // validatingOptions: options.flatMap((v) => v.value)
  });

  const items = children
    ? children(options)
    : options.map(({ value: val, label }) => (
        <TabsTrigger key={val} value={val}>
          {label}
        </TabsTrigger>
      ));

  return (
    <Tabs onValueChange={setValue} defaultValue={value} {...other} className="flex w-full">
      <ScrollArea>
        <TabsList className={className} defaultValue={value} size={size}>
          {items}
        </TabsList>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </Tabs>
  );
};
