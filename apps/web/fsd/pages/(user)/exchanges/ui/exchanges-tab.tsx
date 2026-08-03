'use client';

import React, { ComponentProps, useMemo } from 'react';
import { useParams } from 'next/navigation';

import { useSuspenseInfiniteQuery } from '@tanstack/react-query';

import { v2InventoryExchangesRetrieveInfiniteOptions } from '@re/api/generated/@tanstack/react-query.gen';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@re/ui-kit/ui/select';
import { cn } from '@re/ui-kit/utils/cn';

import { ExchangeSkeleton, ExchangeView } from '~features/inventory/ui/exchanges/exchange-view';
import {
  ExchangeListQueryProvider,
  useExchangeListQuery,
} from '~pages/(user)/exchanges/model/context';
import { client } from '~shared/api/client';
import { ExchangeStatus, ExchangeStatusLabelsMap } from '~shared/api/models/inventory';
import { defaultNextParam } from '~shared/lib/react-query/default-next-param';
import { FlatList } from '~shared/ui/flat-list-v2';

interface ExchangeRootProps extends ComponentProps<'div'> {}

export const ExchangeRoot = (props: ExchangeRootProps) => {
  const { children, className, ...rest } = props;

  return (
    <ExchangeListQueryProvider>
      <div className={cn('cs-exchanges-section cs-section flex flex-col', className)} {...rest}>
        {children}
      </div>
    </ExchangeListQueryProvider>
  );
};

export const statusOptions = [
  { label: ExchangeStatusLabelsMap.all, value: 'all' },
  { label: ExchangeStatusLabelsMap[ExchangeStatus.ACCEPTED], value: ExchangeStatus.ACCEPTED },
  { label: ExchangeStatusLabelsMap[ExchangeStatus.DENIED], value: ExchangeStatus.DENIED },
  { label: ExchangeStatusLabelsMap[ExchangeStatus.WAIT], value: ExchangeStatus.WAIT },
];

export const ExchangeFilters = () => {
  const { status, setStatus } = useExchangeListQuery();

  return (
    <div className="flex self-end">
      <Select value={status} onValueChange={(value) => setStatus(value)}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {statusOptions.map((tab) => (
              <SelectItem key={tab.value} value={tab.value} color="secondary">
                {tab.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export const ExchangesContent = () => {
  const params = useParams<{ id: string }>();
  const userId = params.id;

  const { status: _status, ordering } = useExchangeListQuery();

  const status = Object.values(ExchangeStatus).find((v) => v == _status) || 'all';

  const { data, hasNextPage, isLoading, fetchNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery({
      ...v2InventoryExchangesRetrieveInfiniteOptions({
        client,
        path: {
          user_id: +userId,
        },
        query: {
          ordering,
          ...(status !== 'all' ? { status } : {}),
        },
      }),
      initialPageParam: 1,
      getNextPageParam: defaultNextParam,
    });

  const exchanges = useMemo(() => data?.pages.flatMap((it) => it.results) || [], [data]);

  return (
    <FlatList.Root
      content={exchanges}
      isLoading={isLoading}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={hasNextPage}
    >
      <FlatList.Container className="grid grid-cols-1 gap-3">
        <FlatList.Content>
          {({ item, attributes }) => <ExchangeView {...attributes} key={item.id} exchange={item} />}
        </FlatList.Content>
        <FlatList.Loading count={3}>{({ key }) => <ExchangeSkeleton key={key} />}</FlatList.Loading>
        <FlatList.Empty text="Пусто" emoji="🎴" />
        <FlatList.EdgeTrigger
          onTrigger={fetchNextPage}
          canTrigger={hasNextPage && !isFetchingNextPage}
        />
      </FlatList.Container>
    </FlatList.Root>
  );
};
