'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { usePathname, useSearchParams } from 'next/navigation';

import { useRouter } from '@bprogress/next';
import queryString from 'query-string';

import { tabs } from '~features/search/model/consts';
import {
  SearchErrorBoundary,
  SearchInput,
  SearchProvider,
  SearchRecommendations,
  SearchResults,
  SearchResultsContainer,
  SearchResultsRoot,
  SearchTabs,
} from '~features/search/ui/search';
import { SearchField } from '~shared/api/models/search';
import { useDebouncedValue } from '~shared/hooks/use-debounced-value';
import { SearchStateConsumer } from '~shared/lib/search/use-search-modal';
import { Container } from '~shared/ui/container';

const SearchHistory = dynamic(
  () =>
    import('~features/search/ui/search').then((m) => ({
      default: m.SearchHistory,
    })),
  { ssr: false }
);

export const SearchPage = () => {
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState({
    query: searchParams.get('query') ?? '',
    field: (searchParams.get('field') ?? SearchField.titles) as SearchField,
  });

  const router = useRouter();
  const pathname = usePathname();

  const [debouncedFilters] = useDebouncedValue(filters, 200);

  useEffect(() => {
    router.replace(`${pathname}?${queryString.stringify(debouncedFilters)}`, { scroll: false });
  }, [debouncedFilters]);

  return (
    <Container
      layout="extraslim"
      className="bg-background-content mt-4 flex flex-col justify-start gap-3 rounded-md py-4 md:border"
    >
      <SearchProvider filters={filters} setFilters={setFilters} fields={Object.values(tabs)}>
        <SearchInput />
        <SearchStateConsumer>
          {({ filters }) =>
            !filters.query ? (
              <>
                <SearchHistory />
                <SearchRecommendations />
              </>
            ) : (
              <>
                <SearchTabs />
                <SearchErrorBoundary>
                  <SearchResultsRoot count={30} loadNext>
                    <SearchResultsContainer>
                      <SearchResults />
                    </SearchResultsContainer>
                  </SearchResultsRoot>
                </SearchErrorBoundary>
              </>
            )
          }
        </SearchStateConsumer>
      </SearchProvider>
    </Container>
  );
};
