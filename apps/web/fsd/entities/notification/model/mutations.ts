import type { DefaultError } from '@tanstack/query-core';

import { v2UsersCurrentRetrieveQueryKey } from '@re/api/generated/@tanstack/react-query.gen';

import { NotificationsQueryKeys } from '~entities/notification/model/query-keys';
import { NotificationRepository } from '~entities/notification/model/repository';
import type {
  NotificationsDeleteRequestSchema,
  NotificationsSetReadedRequestSchema,
} from '~shared/api/models/notifications';
import { useOptimisticMutation } from '~shared/api/react-query';

export const useDeleteNotifications = () =>
  useOptimisticMutation<void, DefaultError, NotificationsDeleteRequestSchema>({
    mutationFn: (data) => NotificationRepository.deleteNotifications({ data }),
    invalidate: (query) => {
      return (
        v2UsersCurrentRetrieveQueryKey({})[0]._id === query.queryKey[0]?._id ||
        query.queryKey[0] === NotificationsQueryKeys.getList({})[0]
      );
    },
  });

export const useReadNotifications = () => {
  return useOptimisticMutation<void, DefaultError, NotificationsSetReadedRequestSchema>({
    mutationFn: (data) => NotificationRepository.setReadNotifications({ data }),
    invalidate: (query) => {
      return (
        v2UsersCurrentRetrieveQueryKey({})[0]._id === query.queryKey[0]?._id ||
        query.queryKey[0] === NotificationsQueryKeys.getList({})[0]
      );
    },
  });
};
