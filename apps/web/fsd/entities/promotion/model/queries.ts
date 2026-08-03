import { PromotionsKeys } from '~entities/promotion/model/query-keys';
import { PromotionsRepository } from '~entities/promotion/model/repository';
import type { EndpointMeta } from '~shared/api/api-toolkit';
import type { PromotionsListResponseSchema } from '~shared/api/models/promotion';
import { queryKit } from '~shared/api/react-query';

export const { getKey: getPromotionsListSuspenseQuery, useQuery: usePromotionsListSuspenseQuery } =
  queryKit.createSuspenseQuery<EndpointMeta<void, void>, PromotionsListResponseSchema>(
    ({ fetchOptions }) => ({
      queryKey: PromotionsKeys.list({}),
      staleTime: Infinity,
      queryFn: () =>
        PromotionsRepository.list(
          {},
          {
            cache: 'force-cache',
            next: {
              revalidate: 3600,
            },
            ...fetchOptions,
          }
        ),
    })
  );
