import type {
  FriendRequestPaginatedListParamsSchema,
  FriendRequestPaginatedListQuerySchema,
  FriendshipPaginatedListParamsSchema,
  FriendshipPaginatedListQuerySchema,
  FriendshipSearchPaginatedListQuerySchema,
} from '~shared/api/models/friend';
import { queryKit } from '~shared/api/react-query';

export namespace FriendQueryKeys {
  export namespace Friendship {
    export const UniquePart = 'friendship-list';

    export const list = queryKit.createQueryKey<
      FriendshipPaginatedListParamsSchema,
      FriendshipPaginatedListQuerySchema,
      typeof UniquePart
    >((variables) => [
      UniquePart,
      {
        ...variables,
        authDepend: true,
      },
    ]);

    export const search = queryKit.createQueryKey<
      void,
      FriendshipSearchPaginatedListQuerySchema,
      string
    >((variables) => [
      'friendship-search',
      {
        ...variables,
        authDepend: true,
      },
    ]);
  }

  export namespace FriendRequest {
    export const UniquePart = 'friends-requests-list';

    export const list = queryKit.createQueryKey<
      FriendRequestPaginatedListParamsSchema,
      FriendRequestPaginatedListQuerySchema,
      typeof UniquePart
    >((variables) => [UniquePart, { ...variables, authDepend: true }]);
  }
}
