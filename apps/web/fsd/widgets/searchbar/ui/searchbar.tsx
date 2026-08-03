'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import Close from '@re/ui-kit/icons/close';
import { Button, buttonVariants } from '@re/ui-kit/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@re/ui-kit/ui/dialog';
import { cn } from '@re/ui-kit/utils/cn';

import { tabs } from '~features/search/model/consts';
import {
  SearchErrorBoundary,
  SearchHistory,
  SearchInput,
  SearchProvider,
  SearchRecommendations,
  SearchResults,
  SearchResultsContainer,
  SearchResultsLoadMoreButton,
  SearchResultsRoot,
  SearchTabs,
} from '~features/search/ui/search';
import { SearchField } from '~shared/api/models/search';
import { Routing } from '~shared/config/routing';
import type { Filters } from '~shared/lib/search/use-search-modal';
import {
  PaginationMode,
  SearchStateConsumer,
  useSearchModal,
} from '~shared/lib/search/use-search-modal';

interface MoreButtonProps {
  paginationMode: PaginationMode;
  filters: Filters;
}

const MoreButton = (props: MoreButtonProps) => {
  const { paginationMode, filters } = props;
  const { close } = useSearchModal();

  switch (paginationMode) {
    case PaginationMode.LOAD_MORE:
      return <SearchResultsLoadMoreButton>Больше</SearchResultsLoadMoreButton>;

    case PaginationMode.REDIRECT:
    default:
      return (
        <Link
          shallow={false}
          prefetch={false}
          onClick={close}
          href={Routing.Search.search({ query: filters })}
          className={cn(
            buttonVariants({ className: 'mx-2', variant: 'default', color: 'secondary' })
          )}
        >
          Больше
        </Link>
      );
  }
};

const defineField = (fields: SearchField[]) =>
  fields?.length === 1 ? fields[0]! : SearchField.titles;

export const Searchbar = () => {
  const {
    isOpen,
    close,
    history,
    hits,
    fields,
    onClick,
    paginationMode = PaginationMode.REDIRECT,
  } = useSearchModal();

  const [filters, setFilters] = useState<Filters>({
    field: defineField(fields ?? []),
    query: '',
  });

  useEffect(() => {
    setFilters((prev) => ({ ...prev, field: defineField(fields) }));
  }, [fields]);

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent
        className="top-1 translate-y-0 gap-2 border-none p-2 max-sm:max-w-[calc(100dvw-8px)] sm:max-w-2xl md:top-4"
        withClose={false}
      >
        <DialogTitle className="sr-only">Поиск по сайту</DialogTitle>

        <SearchProvider
          filters={filters}
          setFilters={setFilters}
          fields={(fields ?? [SearchField.titles]).map((it) => tabs[it])}
          onClick={onClick}
        >
          <div className="flex flex-row items-center gap-2">
            <SearchInput />
            <Button onClick={close} color="secondary" size="xl" circle className="rounded-full">
              <Close className="size-6" />
            </Button>
          </div>
          <SearchStateConsumer>
            {({ filters }) =>
              !filters.query ? (
                <>
                  {history && <SearchHistory />}
                  {hits && <SearchRecommendations />}
                </>
              ) : (
                <>
                  <SearchTabs />
                  <SearchErrorBoundary>
                    <SearchResultsRoot count={10}>
                      <SearchResultsContainer>
                        <SearchResults />
                      </SearchResultsContainer>
                      <div className="my-1 flex justify-end">
                        <MoreButton paginationMode={paginationMode} filters={filters} />
                      </div>
                    </SearchResultsRoot>
                  </SearchErrorBoundary>
                </>
              )
            }
          </SearchStateConsumer>
        </SearchProvider>
      </DialogContent>
    </Dialog>
  );
};
