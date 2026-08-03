'use client';

import * as React from 'react';
import { useMemo } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';

import { useQuery } from '@tanstack/react-query';

import { Badge } from '@re/ui-kit/ui/badge';
import { Button } from '@re/ui-kit/ui/button';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { safeResolveCollectionCover } from '~entities/collection/model/utils';
import { HorizontalTitleCard } from '~entities/title/ui/horizontal-title-card';
import { TitleCardRoot } from '~entities/title/ui/title-card-base/title-card-base';
import { CollectionRetrieveActions } from '~features/(collections)/ui/retrieve/collection-retrieve-actions';
import { useCollectionStore } from '~pages/(collection)/collection-detail-page/model/store';
import { client } from '~shared/api/client';
import { v2TitlesCollectionsRetrieveOptions } from '~shared/api/generated/tanstack';
import type { Type } from '~shared/api/models/forms';
import { useOpen } from '~shared/hooks/use-open';
import { FanItem, FanLayout, FanPosition } from '~shared/ui/fan-collections/fan-collections';
import type { FlatListType } from '~shared/ui/flat-list-v2';
import { FlatList as _FlatList } from '~shared/ui/flat-list-v2';
import { MediaContent, MediaFallback, MediaRoot } from '~shared/ui/media';
import { RichText } from '~shared/ui/rich-text';
import { Underline } from '~shared/ui/underline';
import { CommentsAsync } from '~widgets/activity/ui/comments.async';

const CollectionTitles = () => {
  const params = useParams<{ id: string }>();
  const { data: { titles: list = [] } = {} } = useQuery(
    v2TitlesCollectionsRetrieveOptions({
      client,
      path: { id: +params.id },
    })
  );

  const { value } = useCollectionStore();
  const titles = value.length
    ? list.filter((it) => value.every((genre) => it.genres?.map((it) => it.id).includes(genre)))
    : list;

  const FlatList: FlatListType<typeof titles> = _FlatList;

  return (
    <FlatList.Root content={titles} className="w-full">
      <FlatList.Layout layout="list">
        <FlatList.Content>
          {({ item, attributes }) => (
            <HorizontalTitleCard key={item.id} {...attributes} model={item} />
          )}
        </FlatList.Content>
        <FlatList.Empty className="col-span-2" text="Пусто" emoji="🎴" />
      </FlatList.Layout>
    </FlatList.Root>
  );
};
const FilterItem = (props: FilterItemProps) => {
  const { id, name, value, isActive, onClick } = props;

  return (
    <Badge
      className="flex cursor-pointer items-center justify-center whitespace-nowrap"
      variant={isActive ? 'default' : 'secondary'}
      onClick={() => {
        onClick(id);
      }}
    >
      {name}&nbsp;
      {value ? (
        <ReText size="xs" weight="semibold" color={isActive ? 'secondary-foreground' : 'primary'}>
          x{value}
        </ReText>
      ) : null}
    </Badge>
  );
};

const CollectionFilters = () => {
  const params = useParams<{ id: `${number}` }>();
  const { data } = useQuery(
    v2TitlesCollectionsRetrieveOptions({
      client,
      path: { id: +params.id },
    })
  );
  const { valueMap, value, setValue, reset } = useCollectionStore();

  const list = data?.titles ?? [];

  const genres = useMemo(
    () =>
      list
        .flatMap((item) => item.genres)
        .filter(Boolean)
        .reduce<Record<number, Type & { count: number }>>((acc, currValue) => {
          // @ts-ignore
          acc[currValue.id!] = {
            ...(currValue || {}),
            // @ts-ignore
            count: (acc[currValue.id]?.count ?? 0) + 1,
          };
          return acc;
        }, {}),
    []
  );

  const sortedGenresIds = useMemo(
    () =>
      Object.entries(genres)
        .sort((x, y) => {
          if (x[1].count < y[1].count) {
            return 1;
          }
          if (x[1].count > y[1].count) {
            return -1;
          }
          return 0;
        })
        .filter((genres) => genres[1].count >= 4)
        ?.map((item) => item[0]) as `${number}`[],
    []
  );

  const [open, toggle] = useOpen(sortedGenresIds.length <= 9);

  if (!sortedGenresIds) return null;

  const ids = open ? sortedGenresIds : sortedGenresIds.slice(0, 9);

  const handleToggle = (id: number) => {
    setValue(id);
  };

  return (
    <div className="flex flex-wrap justify-center gap-2">
      <FilterItem
        id="all"
        name="Все"
        value={list.length}
        isActive={!value.length}
        onClick={reset}
      />

      {ids?.map((it) =>
        !genres?.[it] ? null : (
          <FilterItem
            key={it}
            id={it}
            name={genres[it]!.name}
            value={genres[it]!.count}
            onClick={() => {
              handleToggle(+it);
            }}
            isActive={!!valueMap?.[it]}
          />
        )
      )}

      {sortedGenresIds.length > 9 && (
        <Button size="sm" onClick={toggle} variant="ghost">
          {open ? 'Скрыть' : `Больше`}
        </Button>
      )}
    </div>
  );
};

export const CollectionPage = () => {
  const id = +useParams<{ id: string }>()?.id;

  const { data } = useQuery(
    v2TitlesCollectionsRetrieveOptions({
      client,
      path: { id },
    })
  );

  const { name = '', description = '', titles = [] } = data ?? {};
  const cover = !id ? undefined : safeResolveCollectionCover(data?.cover);
  const isCustomCoverGeneration = cover?.includes?.('data') || !cover || cover?.includes?.('None');

  return (
    <div className="flex flex-col items-center gap-6 md:mt-8">
      <div className="border-border bg-secondary dark:bg-background flex max-h-[100%] min-h-[269px] w-full flex-col-reverse justify-between gap-4 overflow-hidden rounded-md border md:max-h-[269px] md:flex-row md:gap-0">
        <div className="mb-5 ml-5 flex flex-col gap-2 md:self-end">
          <Underline>
            <ReText component="h1" size="xl" weight="semibold">
              {name}
            </ReText>
          </Underline>
          <RichText className="text-muted-foreground mr-5 text-sm">{description}</RichText>
          <span className="flex items-center gap-2">
            <CollectionRetrieveActions collection={data} />
          </span>
        </div>

        <div
          className={cn(
            'linear-gradient-container m-auto ml-5 aspect-square size-[269px] select-none after:![--r-linear-gradient-color:var(--r-secondary)] md:m-0 md:ml-0 dark:after:![--r-linear-gradient-color:var(--r-background)]',
            { 'h-[220px] md:!h-auto md:w-[370px]': false }
          )}
        >
          {isCustomCoverGeneration ? (
            <FanLayout size="lg" className="absolute top-4 right-0 -left-[24px] size-full">
              {[FanPosition.LEFT, FanPosition.CENTER, FanPosition.RIGHT].map((position) => (
                <FanItem
                  className={cn('hover:none aspect-[2/3] scale-96 cursor-pointer', {
                    'translate-x-[50%]': position === FanPosition.RIGHT,
                  })}
                  position={position}
                  asChild
                  key={position}
                >
                  <TitleCardRoot className="rounded-md">
                    <MediaRoot className="w-full" src={titles?.[position]?.cover?.high}>
                      <MediaContent alt="s" className="object-cover" />
                      <MediaFallback>
                        <div className="bg-secondary border-border aspect-[2/3] w-full rounded-md border border-2" />
                      </MediaFallback>
                    </MediaRoot>
                  </TitleCardRoot>
                </FanItem>
              ))}
            </FanLayout>
          ) : (
            <Image src={cover} fill className="object-cover" alt={data!.name} />
          )}
        </div>
      </div>

      <CollectionFilters />
      <CollectionTitles />
      <CommentsAsync
        className="w-full"
        target={{
          collection_id: id,
        }}
      />
    </div>
  );
};

interface FilterItemProps {
  name: string;
  value: number;
  id: string;
  isActive: boolean;
  onClick: (id: string) => void;
}
