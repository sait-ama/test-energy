import { InfiniteData } from '@tanstack/react-query';

import { CollectionsKeys } from '~entities/collection/model/query-keys';
import {
  CollectionRetrieveResponseSchema,
  CollectionsListResponseSchema,
} from '~shared/api/models/collectionSchema';
import { getQueryClient } from '~shared/api/react-query';
import { getMutationVote } from '~shared/lib/like-dislike/model/mutation';

export const useCollectionLikeAction = getMutationVote<'collection'>({
  voteType: 'collection',
  additional: {
    onMutate: async ({ entityId, getState }) => {
      const client = getQueryClient();
      client.setQueriesData<InfiniteData<CollectionsListResponseSchema>>(
        { queryKey: CollectionsKeys.list({ query: { count: 20, page: 1 } }), fetchStatus: 'idle' },
        (v) => {
          if (!v) return v;
          return {
            ...v,
            pages: v.pages.map((page) => ({
              ...page,
              results: page.results.map((result) => {
                return result.id !== entityId ? result : { ...result, ...getState(result) };
              }),
            })),
          };
        }
      );
      client.setQueryData<CollectionRetrieveResponseSchema>(
        CollectionsKeys.retrieve({ path: { id: entityId } }),
        (v: CollectionRetrieveResponseSchema) => {
          if (!v) return v;
          //todo fix type code gen(backend) add rated + score + titles in schema
          const state = getState(v);
          return { ...v, ...state };
        }
      );
    },
  },
});
