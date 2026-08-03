import { CurrentUser, MinimalUser } from '@re/api/generated/types.gen';

import type { ChapterFragmentSchema } from '~shared/api/models/chapter';
import type { Type } from '~shared/api/models/forms';
import type { FriendStatus } from '~shared/api/models/friend';
import type { ClubSchemaFragment } from '~shared/api/models/guild-club';
import type { PublisherSchemaFragment } from '~shared/api/models/publisher';
import type { EmojiSchema } from '~shared/api/models/shop';
import type { TitleSchemaFragment } from '~shared/api/models/title';
import type {
  PaginationQuerySchema,
  PaginationResponse,
  ResponseResults,
  UpdateImageTransformer,
} from '~shared/types/buisines';
import { Redefine } from '~shared/types/global';

export enum FriendsShipStatus {
  WAITING = 'wait',
  ACCESSED = 'friends',
  NO_FRIENDS = 'no_friends',
}

export enum SocialProviders {
  VK = 'app_vk',
  VK_CONNECT = 'vk_privazka',
  GOOGLE = 'google',
  YANDEX = 'yandex',
  TELEGRAM = 'tg',
  DISCORD = 'discord',
}

export interface Badge {
  id: number;
  name: string;
  icon: string;
  description: string;
}

export enum Preference {
  ALL = 0,
  ADAM = 1,
  EVA = 2,
}

interface UserLevelBase {
  level: number;
  name: string;
  goal: number;
  color: string; // hex
}

export type UserLevel = UserLevelBase & {
  prev: UserLevelBase | null;
  next: UserLevelBase | null;
};

export type UserSchemaFragment =
  | Pick<UserSchema, 'avatar' | 'id' | 'username' | 'frame'>
  | MinimalUser;

export type DetailedUserSchema = Omit<
  UserSchema,
  'vk_id' | 'google_id' | 'yandex_id' | 'mail_id' | 'tg_id'
>;

export interface DetailedUserParamsSchema extends UserIdParam {}

export interface DetailedUserQuerySchema {}

export type DetailedUserResponseSchema = DetailedUserSchema;

export interface UpdateUserEmailRequestSchema {
  email: string;
}

export type UpdateUserEmailResponseSchema = void;

export type DetailedCurrentUserSchema = CurrentUser;
// common
export interface UserIdParam {
  userId: NumberIsomorphic;
}

// achievements
export enum UserAchievementLevel {
  'S' = 'S',
  'A' = 'A',
  'B' = 'B',
  'C' = 'C',
  'D' = 'D',
  'E' = 'E',
  'F' = 'F',
}

interface UserAchievementBase {
  level: UserAchievementLevel;
  goal: number;
  image: string; // todo: or not string ?
}

export interface UserAchievementSchema {
  user: number;
  publisher: null;
  progress: number;
  current: UserAchievementBase | null;
  next: UserAchievementBase | null;
  achievement: {
    id: number;
    name: string;
    description: string | null;
    type: {
      id: number; // todo как назвать этот тип с айди и неймом?
      name: string;
    };
    group: {
      id: number;
      name: string;
    };
  };
}

export interface UserAchievementsPaginatedListQuerySchema extends Partial<PaginationQuerySchema> {}

export interface UserAchievementsPaginatedListParamsSchema extends UserIdParam {}

export interface UserAchievementsPaginatedListResponseSchema
  extends PaginationResponse,
    ResponseResults<UserAchievementSchema[]> {}

export interface UserBadgesPaginatedListQuerySchema extends Partial<PaginationQuerySchema> {}

export interface UserBadgesPaginatedListParamsSchema extends UserIdParam {}

export interface UserBadgesPaginatedListResponseSchema
  extends PaginationResponse,
    ResponseResults<Badge[]> {}

export interface UserBadgeByIdQuerySchema {}

export interface UserBadgeByIdParamsSchema {
  badgeId: number | string;
}

export interface UserBadgeByIdResponseSchema extends Badge {}

export interface OwnersByBadgeIdQuerySchema extends Partial<PaginationQuerySchema> {}

export interface OwnersByBadgeIdParamsSchema {
  badgeId: number | string;
}

export type BadgeCardOwnerSchema = Pick<
  UserSchema,
  'avatar' | 'frame' | 'tagline' | 'is_premium' | 'username' | 'id'
>;
export interface OwnersByBadgeIdResponseSchema
  extends PaginationResponse,
    ResponseResults<BadgeCardOwnerSchema[]> {}

// bookmarks
export interface UserBookmark {
  rated: number | null;
  id: number;
  type: number;
  title: TitleSchemaFragment;
  read_progress: number;
  read_progress_total: number | null;
  is_notify_paid_chapters: boolean;
  view_state: number;
}

export interface UserBookmarksPaginatedListQuerySchema extends Partial<PaginationQuerySchema> {
  type?: NumberIsomorphic;
  ordering?: string;
}

export interface UserBookmarksPaginatedListParamsSchema extends UserIdParam {}

export interface UserBookmarksPaginatedListResponseSchema
  extends PaginationResponse,
    ResponseResults<UserBookmark[]> {}

export enum UserBookmarkViewState {
  UNREAD_FREE = 2,
  UNREAD_DONATE = 1,
}

export interface UserBookmarkType {
  id: number;
  count: number;
  is_default: boolean;
  name: string;
  is_notify: boolean;
  is_visible: boolean;
  view_state: UserBookmarkViewState;
}

export interface UserBookmarksTypesPaginatedListQuerySchema
  extends Partial<PaginationQuerySchema> {}

export interface UserBookmarksTypesPaginatedListParamsSchema extends UserIdParam {}

export interface UserBookmarksTypesPaginatedListResponseSchema
  extends PaginationResponse,
    ResponseResults<UserBookmarkType[]> {}

export interface UserTheme {
  css_code: string;
  js_code: string;
  id: number;
  name: string;
  cover: Record<'high' | 'mid', string>;
}

// user
export interface UserSchema {
  id: number;
  username: string;
  badges: Badge[];
  publishers: PublisherSchemaFragment[];
  clubs: ClubSchemaFragment[];
  description: string;
  tagline: string | null;
  birthday: string;
  event_points: number;
  preference: Preference;
  main_club: {
    id: number;
    name: string;
    dir: string;
  };

  is_private: boolean;
  is_superuser: boolean;
  is_staff: boolean;
  is_premium: boolean;
  is_online: boolean;
  balance: string;
  ticket_balance: number;
  theme?: UserTheme;
  frame: {
    high: string;
  };
  wallpaper: {
    high: string;
  };
  avatar: {
    mid: string;
    high: string;
  };

  email: string;
  friend_meta: {
    status: { name: string; emoji: EmojiSchema } | null;
    created: string;
  } | null;
  yaoi: number;
  adult: number;
  sex: number;

  vk_id: null | string;
  google_id: null | string;
  yandex_id: null | string;
  mail_id: null | string;
  tg_id: null | string;

  is_two_factor_auth: boolean;
  app_extended_catalog: boolean;
  email_not: boolean;
  is_notify_bookmark: boolean;
  vk_not: boolean;

  chapters_read: number;

  level: UserLevel;

  count_subscribers: number;
  date_joined: string;
  count_views: number;
  count_votes: number;
  count_friends: number;
  count_comments: number;
  is_subscribed: boolean;
  count_posts: number;
  count_cards: number;
  friend_status: FriendStatus;
  is_exchanges_enable: boolean | null;
}

export interface UserDetailParamsSchema extends UserIdParam {}

export interface UserDetailQuerySchema {}

export interface UserDetailResponseSchema extends UserSchema {}

export type CurrentUserSchemaResponse = DetailedCurrentUserSchema;
export type UpdateCurrentUserRequestSchema = Partial<
  UpdateImageTransformer<Redefine<CurrentUserSchemaResponse, { main_club: number }>>
>;

export interface ActivateUserRequestSchema {
  uid: string;
  token: string;
  email: string;
}

// history
export interface TitleUserHistory {
  id: number;
  date: string | null;
  page: number;
  chapter: ChapterFragmentSchema;
  title: TitleSchemaFragment;
  bookmark_type: Type | null;
}

export interface UserHistoryPaginatedListQuerySchema extends Partial<PaginationQuerySchema> {
  only_unread?: 1 | 0;
}

export interface UserHistoryPaginatedListParamsSchema extends UserIdParam {}

export interface UserHistoryPaginatedListResponseSchema
  extends PaginationResponse,
    ResponseResults<TitleUserHistory[]> {}

export interface DeleteUserHistoryQuerySchema {}

export interface DeleteUserHistoryParamsSchema extends UserIdParam {}

export interface DeleteUserHistoryRequestSchema {
  ids: number[] | '__all__';
}

export interface DeleteUserHistoryResponseSchema {}

export type UserCardOwnerSchema = Pick<
  UserSchema,
  'avatar' | 'count_cards' | 'frame' | 'tagline' | 'is_private' | 'is_premium' | 'username' | 'id'
>;

export interface CardOwnersPaginatedListParamsSchema {
  cardId: number;
}

export interface CardOwnersPaginatedListQuerySchema extends Partial<PaginationQuerySchema> {}

export interface CardOwnersPaginatedListResponseSchema
  extends PaginationResponse,
    ResponseResults<UserCardOwnerSchema[]> {}

export interface TransferBookmarksUserRequestSchema {
  profile_link: string;
}

export interface MoveBookmarksUserRequestSchema {
  // method: 'change_bookmark';
  include: '__all__' | number[];
  excude?: number[];
  type: number;
}

export interface ChangeNotifyBookmarksUserRequestSchema {
  // method: 'change_notify';
  include: number[];
  is_notify_paid_chapters: boolean;
}

export interface ChangePushNotifyBookmarksUserRequestSchema {
  // method: 'change_notify';
  include: '__all__' | number[];
  exclude?: number[];
  from?: string | number;
  is_push_notify: boolean;
}

export interface DeleteUserBookmarkRequestSchema {
  bookmark_id: string;
  // bookmark_id: number;
}

export enum BookmarkVisibility {
  VISIBLE = '1',
  HIDDEN = '0',
}

export enum BookmarkNotify {
  SHOW = 'show',
  HIDE = 'hide',
}

export interface CreateUserBookmarkRequestSchema {
  is_notify: BookmarkVisibility;
  is_visible: BookmarkNotify;
  name: string;
}

export interface UpdateUserBookmarkRequestSchema extends CreateUserBookmarkRequestSchema {
  bookmark_id: string;
}

export enum UserTopOrdering {
  VIEWS = 'views',
  VOTES = 'votes',
  SUBSCRIBERS = 'subscribers',
  FRIENDS = 'friends',
  POSTS = 'posts',
  COMMENTS = 'comments',
  EVENT_POINTS = 'event',
}

export interface UserTopPaginatedListQuerySchema extends Partial<PaginationQuerySchema> {
  ordering?: UserTopOrdering;
}

export interface TopUserSchema
  extends Pick<
    UserSchema,
    | 'id'
    | 'username'
    | 'count_views'
    | 'count_votes'
    | 'count_subscribers'
    | 'count_comments'
    | 'count_friends'
    | 'count_posts'
    | 'is_premium'
    | 'is_private'
    | 'event_points'
    | 'tagline'
    | 'avatar'
    | 'frame'
  > {}

export interface UserTopPaginatedListResponseSchema
  extends PaginationResponse,
    ResponseResults<TopUserSchema[]> {}

export interface UserChangePublisherOrderRequestSchema {
  publisher_ids: number[];
  indexes: number[];
}
export const ReasonGiftNames = {
  '1': 'BY_MODER',
  '2': 'BY_PUBLISHER',
  '3': 'BY_PROMO_CODE',
  '4': 'BY_SOCIAL_LINKING',
  '5': 'BY_CHAPTER_PAYMENT',
  '6': 'BY_ADD_BALANCE',
  '7': 'BY_BATTLE_PASS',
  '8': 'BY_UTM',
} as const;
export enum ReasonGift {
  BY_MODER = 1,
  BY_PUBLISHER,
  BY_PROMO_CODE,
  BY_SOCIAL_LINKING,
  BY_CHAPTER_PAYMENT,
  BY_ADD_BALANCE,
  BY_BATTLE_PASS,
  BY_UTM,
}
//1 - Выдача модератором
// 2 - Выдача переводчиком
// 3 - Выдача по промокоду
// 4 - Выдача за привязку соц. сетей
// 5 - Покупка главы
// 6 - Выдача при пополнении
// 7 - Выдача за батлпасс
// 8 - Награда UTM
export interface Ticket {
  type: ReasonGift;
  sum: number;
  sum_left: number;
  comment: string;
  date: string;
  date_expire: string;
  burned: boolean;
}
export interface TicketsPaginatedListResponseSchema
  extends PaginationResponse,
    V1Response<Ticket[]> {}
export interface TickersPaginatedListQuerySchema extends PaginationQuerySchema {
  ordering: '-date' | 'date';
}
export interface CreatePromocodeUsageRequestSchema {
  promo_code: string;
}
// export interface UserChangePublisherOrderResponseSchema extends PaginationResponse, ResponseResults<TitleUserHistory[]> {}
