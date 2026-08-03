import type { ToolkitEndpointBuilder } from '~shared/api/api-toolkit';
import type { UserRequestListQuerySchema, UserRequestParamsSchema } from '~shared/api/models/panel';
import {
  CardOwnersPaginatedListParamsSchema,
  CardOwnersPaginatedListQuerySchema,
  DeleteUserHistoryParamsSchema,
  DeleteUserHistoryQuerySchema,
  OwnersByBadgeIdParamsSchema,
  OwnersByBadgeIdQuerySchema,
  TickersPaginatedListQuerySchema,
  UserAchievementsPaginatedListParamsSchema,
  UserAchievementsPaginatedListQuerySchema,
  UserBadgeByIdParamsSchema,
  UserBadgeByIdQuerySchema,
  UserBadgesPaginatedListParamsSchema,
  UserBadgesPaginatedListQuerySchema,
  UserBookmarksPaginatedListParamsSchema,
  UserBookmarksPaginatedListQuerySchema,
  UserBookmarksTypesPaginatedListQuerySchema,
  UserDetailParamsSchema,
  UserDetailQuerySchema,
  UserHistoryPaginatedListParamsSchema,
  UserHistoryPaginatedListQuerySchema,
  UserTopPaginatedListQuerySchema,
} from '~shared/api/models/user';
import { UrlBuilder } from '~shared/utils/url-formatter';

export namespace UserEndpoints {
  export const achievementsByUserId: ToolkitEndpointBuilder<
    UserAchievementsPaginatedListParamsSchema,
    UserAchievementsPaginatedListQuerySchema
  > = ({ params, query }) =>
    new UrlBuilder(`/api/v2/users/${params!.userId}/achievements/`).query(query).build();

  export const badgesById: ToolkitEndpointBuilder<
    UserBadgesPaginatedListParamsSchema,
    UserBadgesPaginatedListQuerySchema
  > = ({ params, query }) =>
    new UrlBuilder(`/api/v2/users/${params!.userId}/badges/`).query(query).build();

  export const ownersByBadgeId: ToolkitEndpointBuilder<
    UserBadgeByIdParamsSchema,
    UserBadgeByIdQuerySchema
  > = ({ params, query }) =>
    new UrlBuilder(`/api/v2/users/badges/${params!.badgeId}/owners/`).query(query).build();

  export const badgeById: ToolkitEndpointBuilder<
    OwnersByBadgeIdParamsSchema,
    OwnersByBadgeIdQuerySchema
  > = ({ params, query }) =>
    new UrlBuilder(`/api/v2/users/badges/${params!.badgeId}/`).query(query).build();

  export const bookmarksTypesByUserId: ToolkitEndpointBuilder<
    UserBookmarksPaginatedListParamsSchema,
    UserBookmarksTypesPaginatedListQuerySchema
  > = ({ params, query }) =>
    new UrlBuilder(`/api/v2/users/${params!.userId}/user_bookmarks/`).query(query).build();
  //api/users/${id}/tickets/?page=${page}&count=5&ordering=-date
  export const bookmarksByUserId: ToolkitEndpointBuilder<
    UserBookmarksPaginatedListParamsSchema,
    UserBookmarksPaginatedListQuerySchema
  > = ({ params, query }) =>
    new UrlBuilder(`/api/v2/users/${params!.userId}/bookmarks/`).query(query).build();
  //todo schema fix
  export const userById: ToolkitEndpointBuilder<UserDetailParamsSchema, UserDetailQuerySchema> = ({
    params,
    query,
  }) => {
    return new UrlBuilder(`/api/v2/users/${params!.userId}/`).query(query).build();
  };
  export const session: ToolkitEndpointBuilder<void, void> = () => '/api/v2/users/current/';
  //todo schema fix +-
  export const login: ToolkitEndpointBuilder<void, void> = () => '/api/users/login/';
  export const register: ToolkitEndpointBuilder<void, void> = () => '/api/users/signup/';
  export const resetPassword: ToolkitEndpointBuilder<void, void> = () =>
    '/api/users/password-reset/';
  //todo schema fix+_
  export const changePassword: ToolkitEndpointBuilder<void, void> = () =>
    '/api/v2/users/password-change/';
  //todo schema fix
  export const social: ToolkitEndpointBuilder<void, void> = () => '/api/users/social/';
  //todo schema fix
  export const changeEmail: ToolkitEndpointBuilder<void, void> = () =>
    '/api/v2/users/email-change/';
  //todo schema fix
  export const subscription: ToolkitEndpointBuilder<void, void> = () => '/api/billing/premium/';
  //todo schema fix
  export const historyByUserId: ToolkitEndpointBuilder<
    UserHistoryPaginatedListParamsSchema,
    UserHistoryPaginatedListQuerySchema
  > = ({ query, params }) =>
    new UrlBuilder(`/api/v2/users/${params!.userId}/history/`).query(query).build();

  export const deleteHistory: ToolkitEndpointBuilder<
    DeleteUserHistoryParamsSchema,
    DeleteUserHistoryQuerySchema
  > = ({ query, params }) =>
    new UrlBuilder(`/api/v2/users/${params!.userId}/history/delete/`).query(query).build();

  export const activate: ToolkitEndpointBuilder<void, void> = () =>
    new UrlBuilder('/api/users/activate/').build();
  //todo schema fix
  export const cardOwners: ToolkitEndpointBuilder<
    CardOwnersPaginatedListParamsSchema,
    CardOwnersPaginatedListQuerySchema
  > = ({ params, query }) =>
    new UrlBuilder(`/api/v2/users/have-card/${params!.cardId}/`).query(query).build();
  //todo schema fix

  export const bookmarks: ToolkitEndpointBuilder<UserDetailParamsSchema, void> = ({ params }) =>
    new UrlBuilder(`/api/v2/users/${params!.userId}/bookmarks/`).build();
  export const transferBookmarks: ToolkitEndpointBuilder<void, void> = () =>
    new UrlBuilder(`/api/users/bookmarks/import/`).build();
  //todo schema fix

  export const requestList: ToolkitEndpointBuilder<void, UserRequestListQuerySchema> = ({
    query,
  }) => new UrlBuilder(`/api/v2/users/requests/`).query(query!).build();
  export const requestItemById: ToolkitEndpointBuilder<UserRequestParamsSchema, void> = ({
    params,
  }) => new UrlBuilder(`/api/v2/users/requests/${params!.requestId}/`).build();
  export const cancelRequestItemById: ToolkitEndpointBuilder<UserRequestParamsSchema, void> = ({
    params,
  }) => new UrlBuilder(`/api/v2/users/requests/${params!.requestId}/cancel/`).build();
  export const top: ToolkitEndpointBuilder<void, UserTopPaginatedListQuerySchema> = ({ query }) =>
    new UrlBuilder(`/api/v2/users/top/`).query(query).build();
  export const changePublisherOrder: ToolkitEndpointBuilder<void, void> = () =>
    new UrlBuilder(`/api/v2/users/publishers-order/`).build();
  export const promocodes_tickets: ToolkitEndpointBuilder<
    UserDetailParamsSchema,
    TickersPaginatedListQuerySchema
  > = ({ query, params }) =>
    new UrlBuilder(`api/users/${params?.userId!}/tickets/`).query(query).build();
  export const applyPromocode: ToolkitEndpointBuilder<void, void> = () =>
    new UrlBuilder(`api/billing/promo-codes/`).build();
  export const getTourReward: ToolkitEndpointBuilder<void, void> = () =>
    new UrlBuilder(`api/v2/users/current/tour-reward/`).build();
}
