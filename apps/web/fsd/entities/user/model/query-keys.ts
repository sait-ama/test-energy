import type { UserRequestListQuerySchema, UserRequestParamsSchema } from '~shared/api/models/panel';
import type {
  CardOwnersPaginatedListParamsSchema,
  CardOwnersPaginatedListQuerySchema,
  OwnersByBadgeIdParamsSchema,
  OwnersByBadgeIdQuerySchema,
  TickersPaginatedListQuerySchema,
  UserAchievementsPaginatedListParamsSchema,
  UserAchievementsPaginatedListQuerySchema,
  UserBadgeByIdParamsSchema,
  UserBadgeByIdQuerySchema,
  UserBookmarksPaginatedListParamsSchema,
  UserBookmarksPaginatedListQuerySchema,
  UserBookmarksTypesPaginatedListParamsSchema,
  UserBookmarksTypesPaginatedListQuerySchema,
  UserDetailParamsSchema,
  UserDetailQuerySchema,
  UserHistoryPaginatedListParamsSchema,
  UserHistoryPaginatedListQuerySchema,
} from '~shared/api/models/user';
import { queryKit } from '~shared/api/react-query';

export namespace UserKeys {
  export const bookmarksTypesByUserId = queryKit.createQueryKey<
    UserBookmarksTypesPaginatedListParamsSchema,
    UserBookmarksTypesPaginatedListQuerySchema
  >((variables) => ['bookmarks-types', { ...variables, authDepend: true }]);
  export const bookmarksByUserId = queryKit.createQueryKey<
    UserBookmarksPaginatedListParamsSchema,
    UserBookmarksPaginatedListQuerySchema
  >((variables) => ['bookmarks', { ...variables, authDepend: true }]);
  export const detailById = queryKit.createQueryKey<UserDetailParamsSchema, UserDetailQuerySchema>(
    ({ params: { userId, ...params } = {}, ...variables }) => [
      'user',
      {
        ...variables,
        query: { ...params, userId: String(userId) },
        authDepend: true,
      },
    ]
  );
  export const promocodes_tickets = queryKit.createQueryKey<
    UserDetailParamsSchema,
    TickersPaginatedListQuerySchema
  >((v) => ['promocodes_tickets', { ...v, authDepend: true }]);
  export const achievementsUserId = queryKit.createQueryKey<
    UserAchievementsPaginatedListParamsSchema,
    UserAchievementsPaginatedListQuerySchema
  >((variables) => ['achievements', variables]);

  export const badgesUserId = queryKit.createQueryKey<
    UserAchievementsPaginatedListParamsSchema,
    UserAchievementsPaginatedListQuerySchema
  >((variables) => ['badges', variables]);

  export const badgeById = queryKit.createQueryKey<
    UserBadgeByIdParamsSchema,
    UserBadgeByIdQuerySchema
  >((variables) => ['badge-by-id', variables]);

  export const ownersByBadgeId = queryKit.createQueryKey<
    OwnersByBadgeIdParamsSchema,
    OwnersByBadgeIdQuerySchema
  >((variables) => ['owners-by-badge-id', variables]);

  export const historyByUserId = queryKit.createQueryKey<
    UserHistoryPaginatedListParamsSchema,
    UserHistoryPaginatedListQuerySchema
  >((variables) => [
    'history',
    {
      ...variables,
      authDepend: true,
    },
  ]);
  export const cardOwnersByCardId = queryKit.createQueryKey<
    CardOwnersPaginatedListParamsSchema,
    CardOwnersPaginatedListQuerySchema
  >((variables) => ['card-owners', variables]);

  export const requestList = queryKit.createQueryKey<void, UserRequestListQuerySchema>(
    (variables) => ['user-request-list', variables]
  );
  export const requestItem = queryKit.createQueryKey<UserRequestParamsSchema, void>((variables) => [
    'user-request',
    variables,
  ]);
  export const top = queryKit.createQueryKey<void, UserRequestListQuerySchema>((variables) => [
    'top',
    variables,
  ]);
}
