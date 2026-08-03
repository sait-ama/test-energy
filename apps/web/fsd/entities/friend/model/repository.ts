import { FriendEndpoints } from '~entities/friend/model/endpoints';
import { api } from '~shared/api/$api';
import { apiToolkit } from '~shared/api/api-toolkit';
import type {
  CreateFriendRequestSchema,
  CreateFriendshipRequestParamsSchema,
  FriendRequestPaginatedListParamsSchema,
  FriendRequestPaginatedListQuerySchema,
  FriendRequestPaginatedListResponseSchema,
  FriendSearchPaginatedListResponseSchema,
  FriendshipPaginatedListParamsSchema,
  FriendshipPaginatedListQuerySchema,
  FriendShipPaginatedListResponseSchema,
  FriendshipSearchPaginatedListQuerySchema,
  RemoveFriendshipParamsSchema,
  UpdateFriendRequestParamsSchema,
  UpdateFriendRequestQuerySchema,
  UpdateFriendRequestResponseSchema,
  UpdateFriendShipStatusParamsSchema,
  UpdateFriendShipStatusRequestSchema,
  UpdateFriendShipStatusResponseSchema,
} from '~shared/api/models/friend';

const createFriendRouter = apiToolkit(({ api, toolbox }) => ({
  removeFriendship: toolbox.createMethod<void, void, RemoveFriendshipParamsSchema, void>(
    (variables, opts) =>
      api.delete(FriendEndpoints.removeFriendship(variables), variables.data, opts)
  ),
  friendshipList: toolbox.createMethod<
    FriendShipPaginatedListResponseSchema,
    void,
    FriendshipPaginatedListParamsSchema,
    FriendshipPaginatedListQuerySchema
  >((variables, opts) => api.get(FriendEndpoints.friendshipList(variables), opts)),
  friendshipSearchList: toolbox.createMethod<
    FriendSearchPaginatedListResponseSchema,
    void,
    void,
    FriendshipSearchPaginatedListQuerySchema
  >((variables, opts) => api.get(FriendEndpoints.search(variables), opts)),

  friendRequestsList: toolbox.createMethod<
    FriendRequestPaginatedListResponseSchema,
    void,
    FriendRequestPaginatedListParamsSchema,
    FriendRequestPaginatedListQuerySchema
  >((variables, opts) => api.get(FriendEndpoints.friendRequestsList(variables), opts)),
  updateFriendRequest: toolbox.createMethod<
    UpdateFriendRequestResponseSchema,
    UpdateFriendRequestQuerySchema,
    UpdateFriendRequestParamsSchema,
    void
  >((variables, opt) =>
    api.put(FriendEndpoints.updateFriendRequest(variables), variables.data, opt)
  ),
  createFriendshipRequest: toolbox.createMethod<
    void,
    CreateFriendRequestSchema,
    CreateFriendshipRequestParamsSchema,
    void
  >((variables, opts) =>
    api.post(FriendEndpoints.createFriendRequest(variables), variables.data, opts)
  ),
  changeFriendShipStatus: toolbox.createMethod<
    UpdateFriendShipStatusResponseSchema,
    UpdateFriendShipStatusRequestSchema,
    UpdateFriendShipStatusParamsSchema,
    void
  >((variables, opts) =>
    api.put(FriendEndpoints.changeFriendShipStatus(variables), variables.data, opts)
  ),
}));

export namespace FriendRepository {
  export const {
    changeFriendShipStatus,
    removeFriendship,
    friendshipList,
    friendshipSearchList,
    createFriendshipRequest,
    friendRequestsList,
    updateFriendRequest,
  } = createFriendRouter({ api });
}
