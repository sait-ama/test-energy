'use client';

import { Suspense } from 'react';

import { useSimilarTitlesSuspenseInfinite } from '~entities/title/model/queries';
import { ActionButton, HorizontalSimilarCard } from '~entities/title/ui/horizontal-similar-card';
import type { EndpointMeta } from '~shared/api/api-toolkit';
import type {
  SimilarTitle,
  SimilarTitlesPaginatedListParamsSchema,
  SimilarTitlesPaginatedListQuerySchema,
} from '~shared/api/models/title';
import { TestProps } from '~shared/lib/test/utils/test-props';
import type { FlatListType } from '~shared/ui/flat-list-v2';
import { FlatList as _FlatList } from '~shared/ui/flat-list-v2';

interface SimilarListProps {
  variables: EndpointMeta<
    SimilarTitlesPaginatedListParamsSchema,
    SimilarTitlesPaginatedListQuerySchema
  >;
}

export const SimilarList = (props: SimilarListProps) => {
  const { variables } = props;

  const { data, isFetchingNextPage } = useSimilarTitlesSuspenseInfinite({ variables });

  const FlatList: FlatListType<SimilarTitle[]> = _FlatList;

  return (
    <FlatList.Root
      content={data?.pages.flatMap((it) => it.results) ?? []}
      isLoading={isFetchingNextPage}
      className="flex flex-col gap-2"
      {...TestProps.id('similar-list')}
    >
      <FlatList.Content>
        {({ item, attributes, index }) => (
          <HorizontalSimilarCard
            {...attributes}
            className="dark:bg-background/50 dark:rounded-md dark:p-2"
            renderAction={({ similarDir, type, rated }) => (
              <Suspense fallback={null}>
                <ActionButton
                  type={type}
                  titleDir={variables.params!.dir}
                  similarDir={similarDir}
                  rated={rated}
                />
              </Suspense>
            )}
            key={item.id ?? `it-${index}`}
            model={item}
          />
        )}
      </FlatList.Content>
    </FlatList.Root>
  );
};
