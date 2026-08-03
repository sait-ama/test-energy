import { ActivityKeys } from '~entities/activity/model/query-keys';
import type { EndpointMeta } from '~shared/api/api-toolkit';
import type {
  ActivityPaginatedListQuerySchema,
  ActivityPaginatedListResponseSchema,
  ActivityTargetQuerySchema,
} from '~shared/api/models/activity';
import { queryKit } from '~shared/api/react-query';

export const { useQuery: useActivityListSuspenseQuery } = queryKit.createSuspenseInfiniteQuery<
  EndpointMeta<
    ActivityTargetQuerySchema,
    ActivityPaginatedListQuerySchema<ActivityTargetQuerySchema>
  >,
  ActivityPaginatedListResponseSchema
>(({ variables }) => ({
  queryKey: ActivityKeys.activity(variables),
  initialPageParam: variables.query?.page || 1,
  staleTime: Infinity,
  refetchOnMount: true,
  retry: false,
  getPreviousPageParam: (_firstPage, _, firstPageParam) => {
    if (firstPageParam <= 1) return null;
    return firstPageParam - 1;
  },
  // @ts-ignore
  getNextPageParam: (lastPage, _, lastPageParam) => {
    if (lastPage?.results?.length < (variables.query?.count ?? 20)) return null;
    return lastPageParam + 1;
  },
}));
