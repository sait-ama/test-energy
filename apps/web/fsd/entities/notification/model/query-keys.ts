import type { NotificationsGetListQuerySchema } from '~shared/api/models/notifications';
import { queryKit } from '~shared/api/react-query';

export namespace NotificationsQueryKeys {
  export const getList = queryKit.createQueryKey<void, NotificationsGetListQuerySchema>(
    (variables) => ['notifications', variables]
  );
}
