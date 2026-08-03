import { UserEndpoints } from '~entities/user/model/endpoints';
import { api } from '~shared/api/$api';
import { apiToolkit } from '~shared/api/api-toolkit';
import type {
  UserRequestListQuerySchema,
  UserRequestListResponseSchema,
  UserRequestParamsSchema,
  UserRequestResponseSchema,
} from '~shared/api/models/panel';
import {
  ActivateUserRequestSchema,
  CardOwnersPaginatedListParamsSchema,
  CardOwnersPaginatedListQuerySchema,
  CardOwnersPaginatedListResponseSchema,
  ChangeNotifyBookmarksUserRequestSchema,
  ChangePushNotifyBookmarksUserRequestSchema,
  CreatePromocodeUsageRequestSchema,
  CreateUserBookmarkRequestSchema,
  CurrentUserSchemaResponse,
  DeleteUserBookmarkRequestSchema,
  DeleteUserHistoryParamsSchema,
  DeleteUserHistoryQuerySchema,
  DeleteUserHistoryRequestSchema,
  DeleteUserHistoryResponseSchema,
  DetailedCurrentUserSchema,
  MoveBookmarksUserRequestSchema,
  OwnersByBadgeIdParamsSchema,
  OwnersByBadgeIdQuerySchema,
  OwnersByBadgeIdResponseSchema,
  TickersPaginatedListQuerySchema,
  TicketsPaginatedListResponseSchema,
  TransferBookmarksUserRequestSchema,
  UpdateCurrentUserRequestSchema,
  UpdateUserBookmarkRequestSchema,
  UpdateUserEmailRequestSchema,
  UpdateUserEmailResponseSchema,
  UserAchievementsPaginatedListParamsSchema,
  UserAchievementsPaginatedListQuerySchema,
  UserAchievementsPaginatedListResponseSchema,
  UserBadgeByIdParamsSchema,
  UserBadgeByIdQuerySchema,
  UserBadgeByIdResponseSchema,
  UserBadgesPaginatedListParamsSchema,
  UserBadgesPaginatedListQuerySchema,
  UserBadgesPaginatedListResponseSchema,
  UserBookmarksPaginatedListParamsSchema,
  UserBookmarksPaginatedListQuerySchema,
  UserBookmarksPaginatedListResponseSchema,
  UserBookmarksTypesPaginatedListParamsSchema,
  UserBookmarksTypesPaginatedListQuerySchema,
  UserBookmarksTypesPaginatedListResponseSchema,
  UserChangePublisherOrderRequestSchema,
  UserDetailParamsSchema,
  UserDetailQuerySchema,
  UserDetailResponseSchema,
  UserHistoryPaginatedListParamsSchema,
  UserHistoryPaginatedListQuerySchema,
  UserHistoryPaginatedListResponseSchema,
  UserIdParam,
  UserTopPaginatedListQuerySchema,
  UserTopPaginatedListResponseSchema,
} from '~shared/api/models/user';
import { sanitizeAsync } from '~shared/lib/sanitize/sanitize-async';
import type { Res } from '~shared/types/buisines';
import type { CookieOptions } from '~shared/utils/cookie-service';

const createUserRouter = apiToolkit(({ api, toolbox }) => ({
  achievementsById: toolbox.createMethod<
    UserAchievementsPaginatedListResponseSchema,
    void,
    UserAchievementsPaginatedListParamsSchema,
    UserAchievementsPaginatedListQuerySchema
  >((variables, options) => api.get(UserEndpoints.achievementsByUserId(variables), options)),
  badgesById: toolbox.createMethod<
    UserBadgesPaginatedListResponseSchema,
    void,
    UserBadgesPaginatedListParamsSchema,
    UserBadgesPaginatedListQuerySchema
  >((variables, options) => api.get(UserEndpoints.badgesById(variables), options)),
  ownersByBadgeId: toolbox.createMethod<
    OwnersByBadgeIdResponseSchema,
    void,
    OwnersByBadgeIdParamsSchema,
    OwnersByBadgeIdQuerySchema
  >((variables, options) => api.get(UserEndpoints.ownersByBadgeId(variables), options)),
  badgeById: toolbox.createMethod<
    UserBadgeByIdResponseSchema,
    void,
    UserBadgeByIdParamsSchema,
    UserBadgeByIdQuerySchema
  >((variables, options) => api.get(UserEndpoints.badgeById(variables), options)),

  bookmarksTypesByUserId: toolbox.createMethod<
    UserBookmarksTypesPaginatedListResponseSchema,
    void,
    UserBookmarksTypesPaginatedListParamsSchema,
    UserBookmarksTypesPaginatedListQuerySchema
  >((variables, opts) => api.get(UserEndpoints.bookmarksTypesByUserId(variables), opts)),
  bookmarksByUserId: toolbox.createMethod<
    UserBookmarksPaginatedListResponseSchema,
    void,
    UserBookmarksPaginatedListParamsSchema,
    UserBookmarksPaginatedListQuerySchema
  >((variables, options) => api.get(UserEndpoints.bookmarksByUserId(variables), options)),
  userById: toolbox.createMethod<
    UserDetailResponseSchema,
    void,
    UserDetailParamsSchema,
    UserDetailQuerySchema
  >((variables, options) => {
    return api
      .get<UserDetailResponseSchema>(UserEndpoints.userById(variables), options)
      .then(async (v) => ({
        ...v,
        description: await sanitizeAsync(v.description, { FORBID_TAGS: ['img'] }),
      }));
  }),

  session: toolbox.createMethod<CurrentUserSchemaResponse, void, void, void>((_, options) =>
    api.get(UserEndpoints.session({}), options)
  ),
  update: toolbox.createMethod<void, UpdateCurrentUserRequestSchema, void, void>(
    (variables, options) => api.put(UserEndpoints.session({}), variables.data, options)
  ),
  changeEmail: toolbox.createMethod<
    UpdateUserEmailResponseSchema,
    UpdateUserEmailRequestSchema,
    void,
    void
  >((variables, options) => api.post(UserEndpoints.changeEmail({}), variables.data, options)),
  cardOwnersByCardId: toolbox.createMethod<
    CardOwnersPaginatedListResponseSchema,
    void,
    CardOwnersPaginatedListParamsSchema,
    CardOwnersPaginatedListQuerySchema
  >((variables, opts) => api.get(UserEndpoints.cardOwners(variables), opts)),
  historyByUserId: toolbox.createMethod<
    UserHistoryPaginatedListResponseSchema,
    void,
    UserHistoryPaginatedListParamsSchema,
    UserHistoryPaginatedListQuerySchema
  >((variables, options) => api.get(UserEndpoints.historyByUserId(variables), options)),
  deleteHistoryByUserId: toolbox.createMethod<
    DeleteUserHistoryResponseSchema,
    DeleteUserHistoryRequestSchema,
    DeleteUserHistoryParamsSchema,
    DeleteUserHistoryQuerySchema
  >((variables, options) =>
    api.delete(UserEndpoints.deleteHistory(variables), variables.data, options)
  ),
  deactivate: toolbox.createMethod<void, void, void, void>((variables, options) =>
    api.delete(UserEndpoints.session({}), variables.data, options)
  ),
  activate: toolbox.createMethod<void, ActivateUserRequestSchema, void, void>(
    (variables, options) => api.post(UserEndpoints.activate({}), variables.data, options)
  ),
  moveBookmarks: toolbox.createMethod<
    void,
    MoveBookmarksUserRequestSchema,
    UserDetailParamsSchema,
    void
  >((variables, options) =>
    api.put(
      UserEndpoints.bookmarks(variables),
      { ...variables.data, method: 'change_bookmark' },
      options
    )
  ),
  bookmarksChangeNotify: toolbox.createMethod<
    void,
    ChangeNotifyBookmarksUserRequestSchema,
    UserDetailParamsSchema,
    void
  >((variables, options) =>
    api.put(
      UserEndpoints.bookmarks(variables),
      { ...variables.data, method: 'change_notify' },
      options
    )
  ),
  bookmarksChangePushNotify: toolbox.createMethod<
    void,
    ChangePushNotifyBookmarksUserRequestSchema,
    UserDetailParamsSchema,
    void
  >((variables, options) =>
    api.put(
      UserEndpoints.bookmarks(variables),
      { ...variables.data, method: 'change_push' },
      options
    )
  ),
  transferBookmarks: toolbox.createMethod<void, TransferBookmarksUserRequestSchema, void, void>(
    (variables, options) => api.post(UserEndpoints.transferBookmarks({}), variables.data, options)
  ),
  updateBookmark: toolbox.createMethod<
    void,
    UpdateUserBookmarkRequestSchema,
    UserBookmarksPaginatedListParamsSchema,
    UserBookmarksPaginatedListQuerySchema
  >((variables, options) =>
    api.put(UserEndpoints.bookmarksTypesByUserId(variables), variables.data, options)
  ),
  createBookmark: toolbox.createMethod<
    void,
    CreateUserBookmarkRequestSchema,
    UserBookmarksPaginatedListParamsSchema,
    UserBookmarksPaginatedListQuerySchema
  >((variables, options) =>
    api.post(UserEndpoints.bookmarksTypesByUserId(variables), variables.data, options)
  ),
  deleteBookmark: toolbox.createMethod<
    void,
    DeleteUserBookmarkRequestSchema,
    UserBookmarksPaginatedListParamsSchema,
    UserBookmarksPaginatedListQuerySchema
  >((variables, options) =>
    api.delete(UserEndpoints.bookmarksTypesByUserId(variables), variables.data, options)
  ),
  requestList: toolbox.createMethod<
    UserRequestListResponseSchema,
    void,
    void,
    UserRequestListQuerySchema
  >((variables, options) => api.get(UserEndpoints.requestList(variables), options)),
  requestItemById: toolbox.createMethod<
    UserRequestResponseSchema,
    void,
    UserRequestParamsSchema,
    void
  >((variables, options) => api.get(UserEndpoints.requestItemById(variables), options)),
  cancelRequestItemById: toolbox.createMethod<void, void, UserRequestParamsSchema, void>(
    (variables, options) => api.put(UserEndpoints.cancelRequestItemById(variables), options)
  ),
  top: toolbox.createMethod<
    UserTopPaginatedListResponseSchema,
    void,
    void,
    UserTopPaginatedListQuerySchema
  >((variables, options) => api.get(UserEndpoints.top(variables), options)),
  changePublisherOrder: toolbox.createMethod<
    void,
    UserChangePublisherOrderRequestSchema,
    void,
    void
  >((variables, options) =>
    api.put(UserEndpoints.changePublisherOrder({}), variables.data, options)
  ),
  promocodes_tickets: toolbox.createMethod<
    TicketsPaginatedListResponseSchema,
    void,
    UserIdParam,
    TickersPaginatedListQuerySchema
  >((variables, options) => api.get(UserEndpoints.promocodes_tickets(variables), options)),
  applyPromocode: toolbox.createMethod<
    {
      msg?: string;
    },
    CreatePromocodeUsageRequestSchema,
    void,
    void
  >((variables, options) =>
    api.post(UserEndpoints.applyPromocode(variables), variables.data, options)
  ),
  getTourReward: toolbox.createMethod<void, void, void, void>((variables, options) =>
    api.post(UserEndpoints.getTourReward(variables), options)
  ),
}));

export namespace UserRepository {
  export const {
    applyPromocode,
    achievementsById,
    bookmarksTypesByUserId,
    badgesById,
    bookmarksByUserId,
    userById,
    historyByUserId,
    deleteHistoryByUserId,
    activate,
    changeEmail,
    deactivate,
    update,
    session,
    cardOwnersByCardId,
    transferBookmarks,
    moveBookmarks,
    bookmarksChangeNotify,
    promocodes_tickets,
    bookmarksChangePushNotify,
    createBookmark,
    deleteBookmark,
    updateBookmark,
    requestList,
    requestItemById,
    top,
    changePublisherOrder,
    cancelRequestItemById,
    ownersByBadgeId,
    badgeById,
    getTourReward,
  } = createUserRouter({ api });
}

export namespace AuthRepository {
  export interface PasswordRecoveryRequestSchema {
    uid: string;
    token: string;
    password: string;
    confirm_password: string;
  }

  export type PasswordRecoveryResponseSchema = Res<DetailedCurrentUserSchema>;

  export type TwoFactorMethodsResponseSchema = Res<{
    msg: string;
    two_factor_auth: true;
    methods: {
      name: string;
      type: string;
    }[];
  }>;

  export type LoginSuccessResponseSchema = Res<
    DetailedCurrentUserSchema & {
      access_token: string;
      two_factor_auth: false;
    }
  >;

  export interface LoginRequestSchema {
    password: string;
    user: string;
    'g-recaptcha-response': string;
    'smart-token': string;
  }

  export type LoginResponseSchema = TwoFactorMethodsResponseSchema | LoginSuccessResponseSchema;

  export const login = (options: LoginRequestSchema) => api.post(UserEndpoints.login({}), options);

  export interface SendTwoFactorCodeEmailRequestSchema {
    method: string;
    password: string;
    user: string;
  }

  export const sendTwoFactorCodeEmail = (options: SendTwoFactorCodeEmailRequestSchema) =>
    api.post<{ content: { msg: string } }>(UserEndpoints.login({}), options);

  export interface LoginTwoFactorRequestSchema {
    password: string;
    user: string;
    code: string;
  }

  export const loginTwoFactor = (options: LoginTwoFactorRequestSchema) =>
    api.post<LoginSuccessResponseSchema>(UserEndpoints.login({}), options);

  export type LoginSocialRequestSchema = {
    // + meta (referral + UTM)
    provider: string;
    redirect_uri?: string;
  } & ({ silent_token: string; uuid: string } | { code: string });

  export const loginSocial = (options: LoginSocialRequestSchema) =>
    api.post(UserEndpoints.social({}), options);

  export const linkSocial = (options: any) => api.put(UserEndpoints.session({}), options);

  export interface RegisterRequestSchema {
    'g-recaptcha-response'?: string | undefined;
    'smart-token'?: string | undefined;
    username: string;
    email: string;
    password: string;
    confirm_password: string;
  }

  export type RegisterResponseSchema = Res<DetailedCurrentUserSchema>;

  export const register = (options: RegisterRequestSchema) =>
    api.post<RegisterResponseSchema>(UserEndpoints.register({}), options);

  export interface SendPasswordRecoveryEmailRequestSchema {
    'g-recaptcha-response'?: string | undefined;
    'smart-token'?: string | undefined;
    email: string;
  }

  export const sendPasswordRecoveryEmail = (options: SendPasswordRecoveryEmailRequestSchema) =>
    api.post(UserEndpoints.resetPassword({}), options);

  export const resetPassword = (options: PasswordRecoveryRequestSchema) =>
    api.put<LoginSuccessResponseSchema>(UserEndpoints.resetPassword({}), options);

  export interface ChangePasswordResponseSchema {
    access_token: string;
  }

  export interface ChangePasswordRequestSchema {
    old_password: string;
  }

  export const changePassword = (options: ChangePasswordRequestSchema) =>
    api.post(UserEndpoints.changePassword({}), options);
}

export namespace AuthCredentialsRepository {
  export const setCookies = (
    options: {
      key: string;
      value: string;
      options?: Omit<CookieOptions, 'httpOnly' | 'expires'> & {
        expires?: number; // timestamp
      };
    }[]
  ) =>
    fetch('/bff-api/auth/credentials', {
      method: 'POST',
      body: JSON.stringify(options),
    });

  export const deleteCookies = (options: string[]) =>
    fetch('/bff-api/auth/credentials', {
      method: 'DELETE',
      body: JSON.stringify(options),
    });
}
