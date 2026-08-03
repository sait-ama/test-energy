import type { FollowersPaginatedListQuerySchema } from '~shared/api/models/follower';
import type { UserSubscriptionsPaginatedListQuerySchema } from '~shared/api/models/user-subscriptions';
import { queryKit } from '~shared/api/react-query';

export namespace UserSubscriptionQueryKey {
  export namespace Followers {
    export const UNIQUE_PART = 'followers';
    export const list = queryKit.createQueryKey<
      void,
      FollowersPaginatedListQuerySchema,
      typeof UNIQUE_PART
    >((variables) => [UNIQUE_PART, { ...variables }]);
  }
  export namespace Subscriptions {
    export const UNIQUE_PART = 'subscriptions';
    export const list = queryKit.createQueryKey<
      void,
      UserSubscriptionsPaginatedListQuerySchema,
      typeof UNIQUE_PART
    >((variables) => [UNIQUE_PART, { ...variables }]);
  }
}
