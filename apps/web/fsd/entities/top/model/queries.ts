import { TopKeys } from '~entities/top/model/query-keys';
import { TopRepository } from '~entities/top/model/repository';
import type { EndpointMeta } from '~shared/api/api-toolkit';
import type { TopTabsResponseSchema } from '~shared/api/models/top';
import { queryKit } from '~shared/api/react-query';

export const { useQuery: useTopTabsSuspenseQuery, getKey: getTopTabsQueryKey } =
  queryKit.createSuspenseQuery<EndpointMeta<void, void>, TopTabsResponseSchema>(
    ({ variables, fetchOptions }) => ({
      queryKey: TopKeys.tabs(variables),
      staleTime: Infinity,
      refetchOnMount: false,
      retry: false,
      queryFn: () =>
        TopRepository.tabs(variables, {
          next: { revalidate: 3600 },
          ...fetchOptions,
        }),
    })
  );
