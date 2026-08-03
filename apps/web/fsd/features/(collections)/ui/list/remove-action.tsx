'use client';
import { useCallback } from 'react';

import { InfiniteData } from '@tanstack/query-core';

import { RemoveCollection } from '~entities/collection/ui/actions';
import { v2TitlesCollectionsListInfiniteQueryKey } from '~shared/api/generated/tanstack';
import { CollectionsListResponseSchema } from '~shared/api/models/collectionSchema';
import { getQueryClient } from '~shared/api/react-query';
import { useSession } from '~shared/lib/session/use-session';

const useRemoveOnSuccessInListCollections = ({ collectionId }: { collectionId: number }) => {
  const client = getQueryClient();
  const sessionId = useSession((v) => v?.id);
  return () => {
    client.setQueriesData<InfiniteData<CollectionsListResponseSchema>>(
      {
        predicate: ({
          queryKey,
        }: {
          queryKey: ReturnType<typeof v2TitlesCollectionsListInfiniteQueryKey>;
        }) => {
          if (!sessionId) return false;
          const [{ _id: currentUnique }] = queryKey;
          const [{ _id: targetUnique }] = v2TitlesCollectionsListInfiniteQueryKey();
          return currentUnique === targetUnique;
        },
      },
      (v) =>
        !v
          ? v
          : {
              ...v,
              pages: v.pages.map((page) => ({
                ...page,
                results: page.results.filter((col) => col.id !== collectionId),
              })),
            }
    );
  };
};
export const RemoveCollectionInList = ({ collectionId }: { collectionId: number }) => {
  const onSuccess = useCallback(() => {
    // eslint-disable-next-line react-compiler/react-compiler
    return useRemoveOnSuccessInListCollections({ collectionId });
  }, [collectionId]);
  return <RemoveCollection onSuccess={onSuccess} collectionId={collectionId} />;
};
