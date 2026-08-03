import { LatestChaptersKeys } from '~entities/latest-chapter/model/query-keys';
import { LatestChaptersRepository } from '~entities/latest-chapter/model/repository';
import type { EndpointMeta } from '~shared/api/api-toolkit';
import type {
  LatestChaptersListQuerySchema,
  LatestChaptersListResponseSchema,
} from '~shared/api/models/latest-chapter';
import { queryKit } from '~shared/api/react-query';
import { defaultNextParam, defaultPreviousParam } from '~shared/lib/react-query/default-next-param';

export const {
  useQuery: useLatestChaptersListSuspenseInfiniteQuery,
  getKey: getLatestChaptersListSuspenseInfiniteQuery,
} = queryKit.createSuspenseInfiniteQuery<
  EndpointMeta<void, LatestChaptersListQuerySchema>,
  LatestChaptersListResponseSchema
>(({ variables, fetchOptions }) => ({
  queryKey: LatestChaptersKeys.list(variables),
  initialPageParam: variables.query?.page || 1,
  staleTime: Infinity,
  refetchOnMount: true,
  retry: false,
  getPreviousPageParam: defaultPreviousParam,
  // @ts-ignore
  getNextPageParam: defaultNextParam,
  queryFn: ({ pageParam }) =>
    LatestChaptersRepository.list(
      {
        query: { ...variables.query, count: 20, page: pageParam },
      },
      fetchOptions
    ),
}));
