import type { ToolkitEndpointBuilder } from '~shared/api/api-toolkit';
import {
  CreateFriendshipRequestParamsSchema,
  FriendRequestPaginatedListParamsSchema,
  FriendRequestPaginatedListQuerySchema,
  FriendshipPaginatedListParamsSchema,
  FriendshipPaginatedListQuerySchema,
  FriendshipSearchPaginatedListQuerySchema,
  RemoveFriendshipParamsSchema,
  UpdateFriendRequestParamsSchema,
  UpdateFriendShipStatusParamsSchema,
} from '~shared/api/models/friend';
import { UrlBuilder } from '~shared/utils/url-formatter';

export namespace FriendEndpoints {
  export const removeFriendship: ToolkitEndpointBuilder<RemoveFriendshipParamsSchema, void> = ({
    params,
  }) => new UrlBuilder(`/api/v2/users/${params!.userId}/friends/${params!.friendId}/`).build();
  export const friendshipList: ToolkitEndpointBuilder<
    FriendshipPaginatedListParamsSchema,
    FriendshipPaginatedListQuerySchema
  > = ({ params, query }) =>
    new UrlBuilder(`/api/v2/users/${params!.userId}/friends/`).query(query).build();
  export const search: ToolkitEndpointBuilder<void, FriendshipSearchPaginatedListQuerySchema> = ({
    query,
  }) => new UrlBuilder(`/api/v2/users/search-friends/`).query(query).build();
  export const createFriendRequest: ToolkitEndpointBuilder<
    CreateFriendshipRequestParamsSchema,
    void
  > = ({ params }) => new UrlBuilder(`/api/v2/users/${params!.userId}/friends-requests/`).build();
  export const updateFriendRequest: ToolkitEndpointBuilder<
    UpdateFriendRequestParamsSchema,
    void
  > = ({ params }) =>
    new UrlBuilder(
      `/api/v2/users/${params?.user_id}/friends-requests/${params?.requestId!}/`
    ).build();
  export const friendRequestsList: ToolkitEndpointBuilder<
    FriendRequestPaginatedListParamsSchema,
    FriendRequestPaginatedListQuerySchema
  > = ({ params, query }) =>
    new UrlBuilder(`/api/v2/users/${params!.userId}/friends-requests/`).query(query).build();
  export const changeFriendShipStatus: ToolkitEndpointBuilder<
    UpdateFriendShipStatusParamsSchema,
    void
  > = ({ params, query }) =>
    new UrlBuilder(`/api/v2/users/${params!.user_id}/friends/${params!.friend_id}/`)
      .query(query)
      .build();
}
