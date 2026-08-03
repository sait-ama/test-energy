import { keepPreviousData } from '@tanstack/react-query';

import { NotificationsQueryKeys } from '~entities/notification/model/query-keys';
import { NotificationRepository } from '~entities/notification/model/repository';
import type { EndpointMeta } from '~shared/api/api-toolkit';
import type {
  NotificationsGetListQuerySchema,
  NotificationsGetListResponseSchema,
} from '~shared/api/models/notifications';
import { queryKit } from '~shared/api/react-query';

export const { useQuery: useInfiniteNotificationsList, getKey: getInfiniteNotificationsList } =
  queryKit.createInfiniteQuery<
    EndpointMeta<void, NotificationsGetListQuerySchema>,
    NotificationsGetListResponseSchema
  >(({ variables, fetchOptions }) => ({
    queryKey: NotificationsQueryKeys.getList(variables),
    queryFn: ({ pageParam }) =>
      NotificationRepository.getList(
        {
          ...variables,
          query: { ...variables.query, page: pageParam, count: 20 },
        },
        fetchOptions
      ),
    initialPageParam: variables.query?.page ?? 1,
    getNextPageParam: (lastPage, _, lastPageParam) => {
      return lastPage.content.length === 20 ? lastPageParam + 1 : null;
    },
    placeholderData: keepPreviousData,
  }));
