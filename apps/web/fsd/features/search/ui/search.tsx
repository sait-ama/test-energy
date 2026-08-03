import type { ChangeEvent, KeyboardEventHandler, MouseEvent, ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { FallbackProps } from 'react-error-boundary';
import { ErrorBoundary } from 'react-error-boundary';
import { useTranslations } from 'next-intl';

import { QueryErrorResetBoundary } from '@tanstack/react-query';
import dayjs from 'dayjs';

import Close from '@re/ui-kit/icons/close';
import History from '@re/ui-kit/icons/history';
import SearchIcon from '@re/ui-kit/icons/search';
import type { ButtonProps } from '@re/ui-kit/ui/button';
import { Button, buttonVariants } from '@re/ui-kit/ui/button';
import { ScrollArea, ScrollBar } from '@re/ui-kit/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@re/ui-kit/ui/tabs';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { HorizontalCharacterCard } from '~entities/character/ui/horizontal-character-card';
import { HorizontalCreatorCard } from '~entities/creator/ui/horizontal-creator-card';
import { HeroCardHorizontalCard } from '~entities/inventory/ui/hero-card-horizontal-card';
import { HorizontalPublisherCard } from '~entities/publisher/ui/horizontal-publisher-card';
import { usePopularTitles } from '~entities/title/model/queries';
import {
  HorizontalSimpleTitleCard,
  HorizontalSimpleTitleCardProps,
} from '~entities/title/ui/horizontal-simple-title-card';
import { HorizontalUserCard } from '~entities/user/ui/horizontal-user-card';
import { ErrorView } from '~features/error-view';
import type { SearchResultsOptions } from '~features/search/model/context';
import {
  HistoryProvider,
  SearchResultsProvider,
  useSearchHistory,
  useSearchResultsStore,
} from '~features/search/model/context';
import type { PopularTitlesResponseSchema, SearchItem } from '~shared/api/models/search';
import { SearchField } from '~shared/api/models/search';
import type { SearchState } from '~shared/lib/search/use-search-modal';
import {
  SearchStateProvider,
  useSearchModal,
  useSearchState,
} from '~shared/lib/search/use-search-modal';
import type { FlatListType } from '~shared/ui/flat-list-v2';
import { FlatList as _FlatList } from '~shared/ui/flat-list-v2';
import { Input } from '~shared/ui/input';
import { debounce } from '~shared/utils/debounce';
import { NArray } from '~shared/utils/NArray';

interface SearchProps extends SearchState {
  children: ReactNode;
}

export const SearchProvider = (props: SearchProps) => {
  const { filters, setFilters, fields, onClick, children } = props;

  return (
    <SearchStateProvider value={{ filters, setFilters, fields, onClick }}>
      <HistoryProvider>{children}</HistoryProvider>
    </SearchStateProvider>
  );
};

interface SearchErrorBoundaryProps {
  children: ReactNode;
}

export const SearchErrorBoundary = (props: SearchErrorBoundaryProps) => {
  const { children } = props;

  const Fallback = (props: FallbackProps) => {
    const { resetErrorBoundary, error } = props;

    return (
      <div className="flex h-[50vh] items-center justify-center rounded-sm p-4">
        <ErrorView
          status={501}
          msg={error?.detail?.message ?? 'Что-то сломалось...'}
          onReload={resetErrorBoundary}
        />
      </div>
    );
  };

  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary onReset={reset} fallbackRender={Fallback}>
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
};

export const SearchInput = () => {
  const { setFilters, filters } = useSearchState();
  const { setHistory } = useSearchHistory();

  const debouncedHandleSaveQuery = useCallback(
    debounce((value: string) => {
      setHistory((prevHistory) => {
        const historyGroupedByQuery = NArray.newBy(prevHistory).recordBy((it) => it.query);

        if (!value) return prevHistory;
        if (historyGroupedByQuery[value]) return prevHistory;

        const newHistory = [
          {
            query: value,
            date: dayjs().toString(),
          },
          ...prevHistory!,
        ].slice(0, 5);

        return newHistory;
      });
    }, 500),
    []
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    debouncedHandleSaveQuery(value);

    setFilters({ ...filters, query: value });
  };

  const handleClear = () => {
    setFilters({ ...filters, query: '' });
  };

  return (
    <Input
      value={filters.query}
      placeholder="Что ищем, семпай?"
      onChange={handleChange}
      className="h-12 focus-within:!ring-[0] focus-within:!ring-offset-[0] focus-visible:!ring-[0]"
      startIcon={<SearchIcon size={20} className="ml-2" />}
      endIcon={
        filters.query ? (
          <Button circle size="xs" color="secondary" className="text-muted-foreground">
            <Close size={16} onClick={handleClear} />
          </Button>
        ) : null
      }
    />
  );
};

export const SearchHistory = () => {
  const { setFilters, filters } = useSearchState();
  const { history, setHistory } = useSearchHistory();
  const itemsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const [focusIndex, setFocusIndex] = useState<number>(-1);

  const length = history?.length ?? 0;

  useEffect(() => {
    if (!history?.length) return;
    const handleKeyUp: KeyboardEventHandler = (e) => {
      if (e.key === 'ArrowDown' || (e.key === 'Tab' && !e.shiftKey)) {
        const itemIndex = (focusIndex + 1) % history.length;
        itemsRef.current[itemIndex]?.focus();
        setFocusIndex(itemIndex);
      }
      if (e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey)) {
        const itemIndex = (focusIndex - 1 + history.length) % history.length;
        itemsRef.current[itemIndex]?.focus();
        setFocusIndex(itemIndex);
      }
    };

    // @ts-ignore
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      // @ts-ignore
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [focusIndex, length]);

  if (!history!.length) return null;

  const handleDelete = (e: MouseEvent<HTMLSpanElement>, query: string) => {
    e.stopPropagation();
    setHistory((prevHistory) => prevHistory!.filter((it) => it.query !== query));
  };

  const handleClick = (query: string) => {
    setFilters({ ...filters, query });
  };

  return (
    <div className="flex max-w-full flex-col overflow-x-auto rounded-md p-2" role="list">
      {history!.slice(0, 3).map((item, index) => (
        <Button
          key={item.query}
          variant="ghost"
          data-testid={`history-item-${index}`}
          className="flex w-full max-w-full items-center justify-between px-3 pr-0"
          onClick={() => {
            handleClick(item.query);
          }}
          onKeyUp={(e) => e.key === 'Enter' && handleClick(item.query)}
          ref={(ref) => {
            itemsRef.current[index] = ref;
          }}
          role="listitem"
        >
          <div className="flex max-w-full items-center gap-2 truncate">
            <History size={16} className="shrink-0" />
            <ReText size="sm" color="foreground" className="max-w-full truncate">
              {item.query}
            </ReText>
          </div>
          {}
          <span
            className={cn('shrink-0', buttonVariants({ circle: true, variant: 'ghost' }))}
            onClick={(e) => {
              handleDelete(e, item.query);
            }}
          >
            <Close size={14} data-testid="delete-button" className="shrink-0" />
          </span>
        </Button>
      ))}
    </div>
  );
};

export const SearchRecommendations = () => {
  const { data, isPlaceholderData, isLoading } = usePopularTitles();
  const { close } = useSearchModal();
  const tEmpty = useTranslations('reusable.empty_states');

  const FlatList: FlatListType<PopularTitlesResponseSchema> = _FlatList;

  return (
    <div className="flex flex-col gap-3 rounded-md p-2">
      <ReText size="sm" weight="medium" className="ml-1">
        Часто ищут
      </ReText>

      <FlatList.Root content={data?.slice(0, 4) ?? []} isLoading={isPlaceholderData || isLoading}>
        <FlatList.Layout layout="list" className="gap-2">
          <FlatList.Content>
            {/* @ts-ignore */}
            {({ item, attributes }) => (
              <HorizontalSimpleTitleCard
                size="xs"
                asDiv={false}
                className="hover-card"
                onClick={close}
                {...attributes}
                key={item.title.id}
                model={item.title}
              />
            )}
          </FlatList.Content>
          <FlatList.Loading count={4}>
            {({ key }) => <HorizontalSimpleTitleCard key={key} size="xs" isLoading model={null} />}
          </FlatList.Loading>
        </FlatList.Layout>
        <FlatList.Empty text={tEmpty('empty')} emoji="🎴" />
      </FlatList.Root>
    </div>
  );
};

export const SearchTabs = () => {
  const { fields, setFilters, filters } = useSearchState((v) => v);

  if (!fields || fields.length <= 1) return null;

  const handleChange = (value: string) => {
    setFilters({ ...filters, field: value as SearchField });
  };

  return (
    <Tabs value={filters.field} onValueChange={handleChange} className="flex w-full overflow-auto">
      <ScrollArea>
        <TabsList>
          {fields.map((it) => (
            <TabsTrigger key={it.name} disabled={it.disabled} value={it.value}>
              {it.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </Tabs>
  );
};

export interface FieldItemProps {
  asDiv?: boolean;
}

const field2CardMap = {
  [SearchField.titles]: (props: HorizontalSimpleTitleCardProps) => (
    <HorizontalSimpleTitleCard {...props} className={cn('', props.className)} asDiv={false} />
  ),
  [SearchField.creators]: HorizontalCreatorCard,
  [SearchField.publishers]: HorizontalPublisherCard,
  [SearchField.characters]: HorizontalCharacterCard,
  [SearchField.users]: HorizontalUserCard,
  [SearchField.cards]: HeroCardHorizontalCard,
};

export interface SearchResultsRootProps extends Partial<SearchResultsOptions> {
  children: ReactNode;
}

export const SearchResultsRoot = (props: SearchResultsRootProps) => {
  const { children, loadNext = false, count = 20 } = props;

  return (
    <SearchResultsProvider value={{ options: { loadNext, count } }}>
      {children}
    </SearchResultsProvider>
  );
};

export const SearchResultsContainer = (props: { className?: string; children: ReactNode }) => {
  const { className, children } = props;

  return <div className={cn('flex h-full flex-col gap-2 rounded-md', className)}>{children}</div>;
};

export interface SearchResultsLoadMoreButtonProps extends ButtonProps {}

export const SearchResultsLoadMoreButton = (props: SearchResultsLoadMoreButtonProps) => {
  const { searchQuery } = useSearchResultsStore();
  const { hasNextPage, isFetchingNextPage } = searchQuery;

  return (
    <Button
      disabled={!hasNextPage || isFetchingNextPage}
      onClick={() => {
        searchQuery.fetchNextPage();
      }}
      {...props}
    />
  );
};
//todo dreeling!!!
export const SearchResults = () => {
  const { options, searchQuery } = useSearchResultsStore();
  const { loadNext, count } = options;
  const { filters, onClick } = useSearchState();
  const { close, asDiv } = useSearchModal();

  const { data, isFetching, isFetchingNextPage, hasNextPage, fetchNextPage } = searchQuery;

  const Component = field2CardMap[filters.field];

  const handleClick = (e: MouseEvent<HTMLAnchorElement>, it: SearchItem<SearchField>) => {
    close();
    if (!onClick) return;
    e.preventDefault();
    e.stopPropagation();
    onClick(it, filters);
  };

  if (!Component) return 'not supported';

  const FlatList: FlatListType<SearchItem<SearchField>[]> = _FlatList;

  const p = asDiv ? { asDiv } : {};

  const t = useTranslations('common');
  const tEmpty = useTranslations('reusable.empty_states');

  const renderLoading = useCallback(
    ({ key }: { key: any }) => <Component {...p} size="sm" isLoading model={null} key={key} />,
    [Component]
  );

  return (
    <FlatList.Root
      content={data?.pages.flatMap((it) => it.results) ?? []}
      isLoading={isFetching || isFetchingNextPage}
    >
      <FlatList.Layout layout="list">
        <FlatList.Content>
          {/*// @ts-ignore*/}
          {({ item }) => (
            <Component
              {...p}
              {...options}
              size="sm"
              key={item.id}
              onClickCapture={(e: MouseEvent<HTMLAnchorElement>) => {
                handleClick(e, item);
              }}
              // @ts-ignore
              model={item}
            />
          )}
        </FlatList.Content>
        {/*// @ts-ignore*/}
        <FlatList.Loading count={count}>{renderLoading}</FlatList.Loading>
        {loadNext ? (
          <FlatList.EdgeTrigger canTrigger={hasNextPage} onTrigger={fetchNextPage} />
        ) : null}
      </FlatList.Layout>

      <FlatList.Empty className="col-span-2 rounded-md" text={tEmpty('empty')} emoji="🎴" />
    </FlatList.Root>
  );
};
