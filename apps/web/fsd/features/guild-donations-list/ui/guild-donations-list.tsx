'use client';

import { useState } from 'react';

import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import dayjs from 'dayjs';

import { getV2NextPageParam } from '@re/api/exports-core';
import { v2ClubsDonateHistoryRetrieveInfiniteOptions } from '@re/api/generated/@tanstack/react-query.gen';
import type { ClubDonateHistory } from '@re/api/generated/types.gen';
import Coin from '@re/ui-kit/icons/activity';
import Ordering from '@re/ui-kit/icons/ordering';
import { Avatar, AvatarFallback, AvatarImage } from '@re/ui-kit/ui/avatar';
import { Badge } from '@re/ui-kit/ui/badge';
import { Button } from '@re/ui-kit/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@re/ui-kit/ui/popover';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@re/ui-kit/ui/select';
import { SkeletonV2 } from '@re/ui-kit/ui/skeleton';
import { cn } from '@re/ui-kit/utils/cn';

import { useSiteConfig } from '~app/providers/site-config-provider';
import { useGuildQuery } from '~entities/guild/model/hooks';
import { client } from '~shared/api/client';
import { ContentSuspenseInfiniteQuery } from '~shared/lib/react-query/content-suspense-query';
import { QuerySuspenseContainer } from '~shared/lib/react-query/query-suspense-container';
import { Calendar } from '~shared/ui/calendar';
import { Input } from '~shared/ui/input';
import { VirtualizedDataTable } from '~shared/ui/virtualized-data-table';
import { UrlFormatter } from '~shared/utils/url-formatter';

interface GuildDonationsListProps {
  className?: string;
}

const ORDERING_MAP: Record<'id' | 'sum', string> = {
  id: 'По новизне',
  sum: 'По сумме',
};

const columns: ColumnDef<ClubDonateHistory>[] = [
  {
    accessorKey: 'user',
    header: () => <div className="flex min-h-[40px] items-center justify-center">Пользователь</div>,
    cell: ({ row }) => {
      const user = row.getValue('user') as ClubDonateHistory['user'];
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={UrlFormatter.media(user?.avatar?.mid)} alt={user.username} />
            <AvatarFallback>U{/*{user.username.charAt(0).toUpperCase()}*/}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{user.username}</span>
            {user.tagline && <span className="text-muted-foreground text-xs">{user.tagline}</span>}
          </div>
        </div>
      );
    },
    size: 300,
  },
  {
    accessorKey: 'sum',
    header: () => <div className="flex min-h-[40px] items-center justify-center">Сумма</div>,
    cell: ({ row }) => {
      const sum = row.getValue('sum') as number;
      return (
        <div className="flex h-full items-center justify-center gap-2">
          <Badge variant="secondary" className="flex gap-1 font-mono">
            {sum.toLocaleString()} <Coin className="size-4" />
          </Badge>
        </div>
      );
    },
    size: 150,
  },
  {
    accessorKey: 'created_at',
    header: () => <div className="flex min-h-[40px] items-center justify-center">Дата</div>,
    cell: ({ row }) => {
      const date = row.getValue('created_at') as string;
      return (
        <div className="flex h-full items-center justify-center">
          <span className="text-muted-foreground text-sm">
            {format(new Date(date), 'dd MMM yyyy, HH:mm', { locale: ru })}
          </span>
        </div>
      );
    },
    size: 200,
  },
];

export function GuildDonationsList({ className }: GuildDonationsListProps) {
  const [ordering, setOrdering] = useState<'id' | 'sum' | '-id' | '-sum'>('-id');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);

  const { data: clubData, isLoading: isLoadingClubMembers } = useGuildQuery();

  const serverDateFormat = useSiteConfig((v) => v.localization.serverDateFormat);
  const dateFormat = useSiteConfig((v) => v.localization.dateFormat);

  if (isLoadingClubMembers) return null;

  const members = clubData?.members || [];

  return (
    <div className={className}>
      <div className="mb-4 space-y-4">
        <div className="flex flex-col justify-between gap-2 md:flex-row">
          <div className="flex flex-wrap gap-2">
            <div className="flex h-10">
              <Select
                value={ordering?.replace('-', '')}
                onValueChange={(value) => {
                  setOrdering(ordering?.startsWith('-') ? `-${value}` : value);
                }}
              >
                <Button
                  asChild
                  variant="outline"
                  className="bg-input h-full justify-between overflow-ellipsis"
                >
                  <SelectTrigger
                    className={cn(
                      'h-full rounded-r-none border-r-0 outline-none focus:ring-0 focus:ring-offset-0'
                    )}
                    data-testid="catalog-ordering-value"
                  >
                    <SelectValue className="line-clamp-1" />
                  </SelectTrigger>
                </Button>
                <SelectContent>
                  <SelectGroup>
                    {Object.entries(ORDERING_MAP).map(([id, name]) => (
                      <SelectItem value={id} key={id}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Button
                size="lg"
                circle
                variant="outline"
                className="bg-input rounded-l-none pr-0.5"
                onClick={() => {
                  setOrdering(ordering?.startsWith('-') ? ordering.slice(1) : `-${ordering}`);
                }}
              >
                <Ordering
                  className="transition-all data-[state=reverse]:rotate-180"
                  data-state={ordering?.startsWith('-') ? 'default' : 'reverse'}
                  size={16}
                />
              </Button>
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Input
                  className="h-10 text-sm"
                  readOnly
                  value={`${dayjs(startDate).format(dateFormat) || dateFormat} - ${dayjs(endDate).format(dateFormat) || dateFormat}`}
                />
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Calendar
                  captionLayout="dropdown-buttons"
                  mode="range"
                  selected={{
                    from: !startDate ? undefined : dayjs(startDate, serverDateFormat).toDate(),
                    to: !endDate ? undefined : dayjs(endDate, serverDateFormat).toDate(),
                  }}
                  onSelect={(dateRange) => {
                    const { from, to } = dateRange ?? {};
                    setStartDate(
                      !from ? undefined : dayjs(from).format(`${serverDateFormat} 00:00:00`)
                    );
                    setEndDate(!to ? undefined : dayjs(to).format(`${serverDateFormat} 00:00:00`));
                  }}
                  disabled={(date) => date > new Date()}
                  initialFocus
                  toYear={dayjs().year() + 1}
                  fromYear={dayjs().year()}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите пользователя" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Все пользователи</SelectItem>
                {members.map((member) => (
                  <SelectItem key={member.user.id} value={member.user.id.toString()}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={UrlFormatter.media(member.user.avatar?.mid)}
                          alt={member.user.username}
                        />
                        <AvatarFallback>U{/*{member.user.username?.[0] ?? 'M'}*/}</AvatarFallback>
                      </Avatar>
                      <span>{member.user.username}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <QuerySuspenseContainer fallback={<GuildDonationsListSkeleton />}>
        <ContentSuspenseInfiniteQuery
          queryOptions={{
            ...v2ClubsDonateHistoryRetrieveInfiniteOptions({
              client,
              path: { dir: clubData?.dir! },
              query: {
                ordering,
                user_id:
                  selectedUserId && selectedUserId !== 'ALL' ? parseInt(selectedUserId) : undefined,
                start_at: startDate,
                end_at: endDate,
              },
            }),
            getNextPageParam: getV2NextPageParam,
            initialPageParam: 1,
          }}
        >
          {({ data, isFetchingNextPage, isLoading, fetchNextPage, hasNextPage }) => {
            const flatten = data?.pages?.flatMap((page) => page.results) ?? [];

            return (
              <VirtualizedDataTable
                columns={columns}
                data={flatten}
                isLoading={isLoading}
                onTrigger={fetchNextPage}
                canTrigger={!isFetchingNextPage && hasNextPage}
                isEmpty={flatten.length === 0}
                className="w-full"
              />
            );
          }}
        </ContentSuspenseInfiniteQuery>
      </QuerySuspenseContainer>
    </div>
  );
}

export const GuildDonationsListSkeleton = () => {
  return (
    <div className="space-y-3">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-lg border p-4">
          <SkeletonV2 className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-2">
            <SkeletonV2 className="h-4 w-32" />
            <SkeletonV2 className="h-3 w-24" />
          </div>
          <SkeletonV2 className="h-6 w-20" />
          <SkeletonV2 className="h-4 w-32" />
        </div>
      ))}
    </div>
  );
};
