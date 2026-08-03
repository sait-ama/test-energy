'use client';

import { ComponentProps, type ReactNode, useCallback, useDeferredValue, useMemo } from 'react';
import Link from 'next/link';

import { cn } from '@re/ui-kit/utils/cn';

import { useContentType } from '~app/providers/site-config-provider';
import { useTitlesByQuerySuspenseInfinite } from '~entities/title/model/queries';
import { VerticalTitleCard } from '~entities/title/ui/vertical-title-card';
import { VerticalTitleCardSkeleton } from '~entities/title/ui/vertical-title-card-skeleton';
import type { CatalogTitleQuerySchema, TitleSchemaFragment } from '~shared/api/models/title';
import { Routing } from '~shared/config/routing';
import { FiltersState, InitialState, serializeFiltersToRequest } from '~shared/lib/filters';
import { QuerySuspenseContainer } from '~shared/lib/react-query/query-suspense-container';
import type { FlatListType } from '~shared/ui/flat-list-v2';
import { FlatList as _FlatList } from '~shared/ui/flat-list-v2';

import {
  TitleFiltersProvider,
  useTitleFiltersStore,
} from '../../../features/title-filters/model/context';
import {
  createTitleFiltersSchema,
  TitleFiltersSchema,
} from '../../../features/title-filters/model/schema';
import { TitleFiltersOptions } from '../../../features/title-filters/model/types';
import { TitlesFiltersStateProvider, useTitlesFiltersState } from '../model/context';

export type TitlesFeedRootProps = {
  children: ReactNode;
  initialState?: InitialState<TitleFiltersSchema>;
  onChange?: (filters: Partial<FiltersState<TitleFiltersSchema>>) => void;
} & (
  | {
      filtersOptions: TitleFiltersOptions;
      schema?: never;
    }
  | {
      filtersOptions?: never;
      schema: TitleFiltersSchema;
    }
);

export interface TitlesFeedContentProps {
  className?: string;
  emptyText?: string;
  emptyEmoji?: string;
  layout?: 'grid' | 'list';
  query?: CatalogTitleQuerySchema;
  responsiveFilters?: boolean;
}
export const TitlesFeedRoot = (props: TitlesFeedRootProps) => {
  const { children, filtersOptions, schema, initialState, onChange } = props;

  const filtersSchema = useMemo(
    () => (schema ? schema : createTitleFiltersSchema(filtersOptions)),
    [filtersOptions, schema]
  );

  return (
    <TitlesFiltersStateProvider>
      <TitleFiltersProvider initialState={initialState} schema={filtersSchema} onChange={onChange}>
        {children}
      </TitleFiltersProvider>
    </TitlesFiltersStateProvider>
  );
};

export type TitlesFeedLayoutProps = ComponentProps<'div'> &
  Pick<TitlesFeedContentProps, 'layout' | 'responsiveFilters'>;

export const TitlesFeedLayout = (props: TitlesFeedLayoutProps) => {
  const { className, responsiveFilters = true, ...rest } = props;

  const { filtersOpenUI, filtersOpen } = useTitlesFiltersState();

  const isFiltersOpen = filtersOpenUI || filtersOpen;

  const layoutClassName = cn(
    'grid space-y-3 md:space-y-6 gap-2 xs:gap-4 grid-cols-3 xs:grid-cols-3 md:grid-cols-4  md:gap-6 w-full py-2',
    !responsiveFilters && 'lg:grid-cols-5 xl:grid-cols-6',
    ...(responsiveFilters
      ? [
          !isFiltersOpen && 'lg:grid-cols-5 xl:grid-cols-6',
          isFiltersOpen && 'lg:grid-cols-3 xl:grid-cols-4 lg:pr-6',
        ]
      : []),
    className
  );

  return <_FlatList.Layout className={layoutClassName} {...rest} />;
};

export const TitlesFeedContentImpl = (props: TitlesFeedContentProps) => {
  const {
    className,
    query,
    emptyText,
    emptyEmoji,
    layout = 'grid',
    responsiveFilters = true,
    ...rest
  } = props;
  const contentType = useContentType();

  const { data, hasNextPage, isFetchingNextPage, isFetching, fetchNextPage } =
    useTitlesByQuerySuspenseInfinite({
      variables: { query },
    });

  const FlatList: FlatListType<TitleSchemaFragment[]> = _FlatList;

  const renderContent = useCallback(
    ({ item }: { item: TitleSchemaFragment }) => {
      return (
        <Link
          key={item.id}
          prefetch={false}
          href={Routing.Title.detail({
            params: { dir: item.dir, content: contentType, tab: 'main' },
          })}
          {...rest}
        >
          <VerticalTitleCard model={item} />
        </Link>
      );
    },
    [contentType]
  );

  return (
    <FlatList.Root
      content={data?.pages.flatMap((it) => it.results) ?? []}
      isLoading={isFetching || isFetchingNextPage}
      className="w-full"
      {...rest}
    >
      <TitlesFeedLayout layout={layout} className={className} responsiveFilters={responsiveFilters}>
        <FlatList.Content>{renderContent}</FlatList.Content>
        <FlatList.Loading count={15}>
          {({ key }) => <VerticalTitleCardSkeleton key={key} />}
        </FlatList.Loading>
        <FlatList.EdgeTrigger
          canTrigger={!isFetchingNextPage && hasNextPage}
          onTrigger={() => {
            if (!isFetchingNextPage) {
              fetchNextPage();
            }
          }}
        />
      </TitlesFeedLayout>
      <FlatList.Empty className="col-span-2 w-full" text={emptyText} emoji={emptyEmoji} />
    </FlatList.Root>
  );
};

export const TitlesFeedContent = (props: TitlesFeedContentProps & { fallback: ReactNode }) => {
  const { fallback, ...rest } = props;

  const activeFilters = useTitleFiltersStore((v) => v.activeFilters);
  const schema = useTitleFiltersStore((v) => v.schema);

  const [key, serializedFilters] = useMemo(() => {
    // Используем новую функцию serializeFiltersToRequest для правильной сериализации
    const serialized = serializeFiltersToRequest(activeFilters, schema);

    return [JSON.stringify(serialized), serialized];
  }, [activeFilters, schema]);

  const deferredQuery = useDeferredValue(serializedFilters);

  return (
    <QuerySuspenseContainer fallback={fallback} suspenseKey={key}>
      <TitlesFeedContentImpl query={deferredQuery} {...rest} />
    </QuerySuspenseContainer>
  );
};
