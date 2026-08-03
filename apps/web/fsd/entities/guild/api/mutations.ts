import type { DefaultError, InfiniteData } from '@tanstack/query-core';
import type { UseMutationOptions } from '@tanstack/react-query';

import { ClubKeys } from '~entities/guild/api/query-keys';
import { ClubRepository } from '~entities/guild/api/repository';
import { useDirDepClub } from '~entities/guild/model/hooks';
import type {
  ClubCreateUpdateRequestSchema,
  ClubCreateUpdateResponseSchema,
  ClubRequestPaginatedListResponseSchema,
  ClubRequestSchemaUpdateParamsSchema,
  ClubRequestSchemaUpdateRequestSchema,
} from '~shared/api/models/guild-club';
import type { Invalidate } from '~shared/api/react-query';
import { getQueryClient, useOptimisticMutation } from '~shared/api/react-query';

export const clubsCreateMutation = () => {
  return useOptimisticMutation<ClubCreateUpdateResponseSchema, void, ClubCreateUpdateRequestSchema>(
    {
      mutationFn: (data) => ClubRepository.clubsCreate({ data }),
    }
  );
};
export const useChangeClub = () => {
  const dir = useDirDepClub();
  return useOptimisticMutationWithClubInvalidate<
    ClubCreateUpdateResponseSchema,
    ClubCreateUpdateRequestSchema
  >({
    mutationFn: (data) => ClubRepository.clubsUpdate({ params: { dir }, data }),
  });
};

export const useOptimisticMutationWithClubInvalidate = <
  Data = void,
  TRequest = void,
  TContext = void,
>(
  options: UseMutationOptions<Data, BackendValidationError, TRequest, TContext> & {
    invalidate?: Invalidate;
  }
) => {
  const dir = useDirDepClub();

  return useOptimisticMutation({
    invalidateV2: ClubKeys.clubsRetrieveQueryKey({ path: { dir } }),
    ...options,
  });
};

export const useClubRequestMutation = (params: ClubRequestSchemaUpdateParamsSchema) => {
  const dir = useDirDepClub();
  return useOptimisticMutation<void, DefaultError, ClubRequestSchemaUpdateRequestSchema>({
    mutationFn: (data) => ClubRepository.clubsRequestsUpdate({ data, params }),
    invalidateV2: ClubKeys.clubsRetrieveQueryKey({ path: { dir } }),
    onSuccess: async () => {
      getQueryClient().setQueriesData<InfiniteData<ClubRequestPaginatedListResponseSchema>>(
        {
          predicate: ({ queryKey }) => {
            const [key] = queryKey as ({ _id: string } | string)[];
            if (typeof key !== 'object' || !('_id' in key) || !('_infinite' in key)) return false;
            const params = key as { _id: string };
            const clubKeyParams = ClubKeys.clubsRequestsListQueryKey({ path: { dir } })[0];
            if (params._id !== clubKeyParams._id) return false;
            return clubKeyParams.path.dir === dir;
          },
        },
        (v) =>
          !v
            ? v
            : {
                ...v,
                pages: v.pages.map((page) => ({
                  ...page,
                  results: page.results.filter((result) => result.id !== params.id),
                })),
              }
      );
    },
  });
};
