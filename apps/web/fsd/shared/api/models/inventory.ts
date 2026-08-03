import { CardItem, InventoryCard, Moment } from '@re/api/generated/types.gen';

import type { UserSchemaFragment } from '~shared/api/models/common';
import { LikeDislikeType } from '~shared/api/models/post';
import { DeckSchema, EmojiSchema } from '~shared/api/models/shop';

import type { PaginationQuerySchema, ResponseResults } from '../../types/buisines';

import { UserTheme } from './user';

export const UNIFIED_INVENTORY_ITEM_TYPE = ['card' /*'avatar', 'wallpaper', 'frame' */] as const;
export type UnifiedInventoryItemTypeSchema = (typeof UNIFIED_INVENTORY_ITEM_TYPE)[number];
export type UnifiedInventoryItemSchemaFabric = {
  card: HeroCardItemSchema;
  avatar: CustomizationSchema<CustomizationItemType.AVATAR>;
  wallpaper: CustomizationSchema<CustomizationItemType.WALLPAPER>;
  frame: CustomizationSchema<CustomizationItemType.FRAME>;
};

export type UnifiedInventoryItemSchema =
  UnifiedInventoryItemSchemaFabric[UnifiedInventoryItemTypeSchema];

export type InventoryItem = HeroCardSchema;

export interface CreateInventoryCardSchemaRequest {
  title: number;
  description?: string;
  rank: HeroCardRank;
  character: number;
  cover: string;
}

export type CreateInventoryCardSchemaResponse = void;

export enum InventoryItemType {
  CARDS = 'cards',
  PROMOCODES = 'promocodes',
  TITLES = 'read_titles',
  CUSTOMIZATIONS = 'customizations',
  MOMENT = 'moments',
  DECKS = 'decks',
}

export enum ExchangeStatus {
  WAIT = 'wait',
  ACCEPTED = 'accepted',
  DENIED = 'denied',
}

export const ExchangeStatusLabelsMap = {
  all: 'Все',
  [ExchangeStatus.ACCEPTED]: 'Принятые',
  [ExchangeStatus.DENIED]: 'Отклоненные',
  [ExchangeStatus.WAIT]: 'В ожидании',
} as const;

export const ExchangeStatusColorsMap = {
  [ExchangeStatus.ACCEPTED]: 'success',
  [ExchangeStatus.DENIED]: 'destructive',
  [ExchangeStatus.WAIT]: 'muted-foreground',
} as const;

export interface ExchangeSchema {
  id: number;
  status: ExchangeStatus;

  cards_creator: HeroCardItemSchema[];
  cards_partner: HeroCardItemSchema[];

  items_creator: InventoryExchangeCreateItemsSchema;
  items_partner: InventoryExchangeCreateItemsSchema;

  message_creator?: string;
  message_partner?: string;

  creator: UserSchemaFragment;
  partner: UserSchemaFragment;
}

export enum HeroCardRank {
  A = 'rank_a',
  B = 'rank_b',
  C = 'rank_c',
  D = 'rank_d',
  E = 'rank_e',
  F = 'rank_f',
  S = 'rank_s',
  RE = 'rank_re',
}

export interface Cover {
  low?: string;
  mid?: string;
  high?: string;
}

export interface HeroCardAuthor {
  id: number;
  username: string;
}

export interface HeroCardCharacter {
  cover: Cover;
  name: string;
}

export interface HeroCardSchema extends CardItem {}

export const WishTypeObj = {
  WANNA_GET: 1, // хочу получить
  WANNA_GET_RID_OF: 2, // готов обменять
} as const;

export const enum WishType {
  WANNA_GET = 1,
  WANNA_GET_RID_OF = 2,
}

export interface HeroCardItemSchema extends InventoryCard {
  id: number;
  index: number;
  stack_count: number;
  is_favorite: boolean;
  is_exchangeable: boolean;
  wish_type: (typeof WishTypeObj)[keyof typeof WishTypeObj];
}

export type HeroCardOrdering =
  | '-id'
  | 'rank'
  | 'card__character_id'
  | '-stack_count'
  | '-is_favorite'
  | 'card__title_id';

export interface HeroCardUpgradeSchema {
  id: number;
  user: UserSchemaFragment;
  new_card: HeroCardSchema;
  old_cards_objects: HeroCardSchema[];
  created_at: string;
}

export interface MomentSchema extends Moment {}

export interface MomentListPaginatedResponseSchema extends ResponseResults<MomentSchema[]> {}

export enum MomentListOrdering {
  SCORE = 'score',
  SCORE_DESC = '-score',
  CREATED_AT = 'created_at',
  CREATED_AT_DESC = '-created_at',
  COUNT_COMMENTS = 'count_comments',
  COUNT_COMMENTS_DESC = '-count_comments',
  TRENDING = 'trend',
  TRENDING_DESC = '-trend',
  RANDOM = 'random',
}

export interface MomentListPaginatedQuerySchema extends Partial<PaginationQuerySchema> {
  ordering?: MomentListOrdering;
  chapters?: number[];
  exclude_chapters?: number[];
  exclude_titles?: number[];
  titles?: number[];
  authors?: number[];
  exclude_authors?: number[];
  exclude_tags?: number[];
  tags?: number[];
  is_friends?: boolean;
}

export interface MomentDetailedParamsSchema {
  dir: string;
}

export interface MomentDetailedResponseSchema extends MomentSchema {}

export enum CustomizationItemType {
  FRAME = 'frame',
  AVATAR = 'avatar',
  WALLPAPER = 'wallpaper',
  EMOJI = 'pack',
  MOMENT = 'moments',
  THEME = 'theme',
}

export interface CustomizationSchema<T extends CustomizationItemType> {
  id: number;
  image_item: T extends CustomizationItemType.EMOJI
    ? null
    : {
        id: number;
        name?: string;
        type: T;
        image: {
          high: string;
        };
        author: {
          id: number;
          username: string;
          avatar: {
            high: string;
            mid: string;
          };
        };
      };
  emoji_pack: T extends CustomizationItemType.EMOJI
    ? {
        id: number;
        name: string;
        emojis: EmojiSchema[];
      }
    : null;
  cost: number;
  dir: string;
  amount: number;
  is_bought: false;
  is_using: true;
  theme: T extends CustomizationItemType.THEME ? UserTheme : null;
}

export interface InventoryItemByUserParamsSchema {
  userId: NumberIsomorphic;
}

export interface InventoryItemByUserQuerySchema {
  type: InventoryItemType;
}

export interface InventoryCustomizationParamsSchema {
  userId: NumberIsomorphic;
}

export type InventoryCustomizationQuerySchema = Partial<PaginationQuerySchema> & {
  filter_by?: CustomizationItemType;
};

export interface InventoryHeroCardByUserParamsSchema {
  userId: NumberIsomorphic;
}

export type InventoryHeroCardByUserQuerySchema = Partial<PaginationQuerySchema> & {
  ordering?: string;
  // card__is_exchangeable?: 0 | 1;
  card__is_exchangeable?: number;
  // card__rank?: HERO_CARD_RANK;
  card__rank?: string;
  // is_exchangeable?: 0 | 1;
  is_exchangeable?: number;
  is_favorite?: number;
  card_id?: number;
  card__title_id?: number | string;
  card__title__main_name__iexact?: string;
};

export type InventoryHeroCardByUserRetrieveResponseSchema = ResponseResults<HeroCardItemSchema[]>;

export interface InventoryUpgradeHistoryParamsSchema {}

export type InventoryUpgradeHistoryQuerySchema = Partial<PaginationQuerySchema> & {
  ordering?: string;
};

export type InventoryUpgradeHistoryRetrieveResponseSchema = ResponseResults<
  HeroCardUpgradeSchema[]
>;

export interface DeckItemSchema {
  id: number;
  deck: DeckSchema;
  to_choose_cards: [HeroCardSchema, HeroCardSchema, HeroCardSchema];
}

export interface InventoryDeckParamsSchema {
  userId: NumberIsomorphic;
}

export interface InventoryDeckQuerySchema extends Partial<PaginationQuerySchema> {
  deck_id?: string;
  ordering?: 'id' | '-id';
}

export type InventoryDeckRetrieveListResponseSchema = ResponseResults<DeckItemSchema>;

export interface InventoryHeroCardByTitleParamsSchema {
  titleId: NumberIsomorphic;
}

export type InventoryHeroCardByTitleQuerySchema = Partial<PaginationQuerySchema> & {};

export type InventoryHeroCardByTitleRetrieveResponseSchema = ResponseResults<HeroCardSchema>;

export interface InventoryHeroCardByCharacterParamsSchema {
  characterId: NumberIsomorphic;
}

export interface InventoryHeroCardByCharacterQuerySchema {}

export type InventoryHeroCardByCharacterRetrieveResponseSchema =
  ResponseResults<HeroCardItemSchema>;

export interface InventoryHeroCardMergeParamsSchema {
  userId: NumberIsomorphic;
}

export interface InventoryHeroCardMergeQuerySchema {}

export interface InventoryHeroCardMergeRequestSchema {
  cards: number[];
}

export type InventoryHeroCardMergeResponseSchema = HeroCardSchema;

export interface InventoryHeroCardByIdParamsSchema {
  cardId: NumberIsomorphic;
}

export interface InventoryHeroCardByIdQuerySchema {}

export type InventoryHeroCardByIdResponseSchema = HeroCardSchema;

export interface InventoryHeroCardFavoriteParamsSchema {
  userId: NumberIsomorphic;
}

export interface InventoryHeroCardFavoriteQuerySchema {}

export type InventoryHeroCardFavoriteRetrieveResponseSchema = (HeroCardSchema & {
  index: number;
})[];

export interface InventoryHeroCardChangeFavoriteParamsSchema {
  userId: NumberIsomorphic;
}

export interface InventoryHeroCardChangeFavoriteQuerySchema {}

export interface InventoryHeroCardChangeFavoriteRequestSchema {
  prevValue: number[];
  value: number[];
}

export type InventoryHeroCardChangeFavoriteResponseSchema = void;

export interface InventoryHeroCardChangeExchangeableParamsSchema {
  userId: NumberIsomorphic;
}

export interface InventoryHeroCardChangeExchangeableQuerySchema {}

export type InventoryHeroCardChangeExchangeableRequestSchema = {
  card_id: number;
  is_exchangeable: boolean;
}[];

export type InventoryHeroCardChangeExchangeableResponseSchema = void;

export interface InventoryHeroCardChangeWishTypeParamsSchema {}

export interface InventoryHeroCardChangeWishTypeQuerySchema {}

export type InventoryHeroCardChangeWishTypeRequestSchema = {
  card: number;
  wish_type: number;
};

export type InventoryHeroCardChangeWishTypeResponseSchema = void;

export interface InventoryHeroCardDeleteWishTypeParamsSchema {
  cardId: number;
}

export interface InventoryHeroCardDeleteWishTypeQuerySchema {}

export type InventoryHeroCardDeleteWishTypeRequestSchema = {};

export type InventoryHeroCardDeleteWishTypeResponseSchema = void;

export interface InventoryExchangeByUserParamsSchema {
  userId: NumberIsomorphic;
}

export type InventoryExchangeByUserQuerySchema = Partial<PaginationQuerySchema> & {
  status?: ExchangeStatus;
  ordering?: string;
};

export interface InventoryExchangeByIdParamsSchema {
  userId: NumberIsomorphic;
  exchangeId: NumberIsomorphic;
}

export interface InventoryExchangeByIdQuerySchema {}

export type InventoryExchangeByUserRetrieveListResponseSchema = ExchangeSchema[];

export type InventoryExchangeCreateItemsSchema = {
  cards?: number[];
  customizations?: number[];
};
export interface InventoryExchangeCreateRequestSchema {
  creator: NumberIsomorphic;
  partner: NumberIsomorphic;
  cards_creator?: number[];
  cards_partner?: number[];
  items_creator?: InventoryExchangeCreateItemsSchema;
  items_partner?: InventoryExchangeCreateItemsSchema;
  message_creator?: string;
}

export interface InventoryExchangeChangeStatusRequestSchema {
  status: ExchangeStatus.DENIED | ExchangeStatus.ACCEPTED;
  message_partner?: string;
  message_creator?: string;
}

export interface InventoryExchangeAcceptRequestSchema {
  status: ExchangeStatus.DENIED | ExchangeStatus.ACCEPTED;
}

export type InventoryExchangeDenyRequestSchema = InventoryExchangeAcceptRequestSchema;

export enum HeroCardCatalogOrderings {
  ID = 'id',
  ID_DESC = '-id',
  RANK = 'rank',
  RANK_DESC = '-rank',
  POWER = 'power',
  POWER_DESC = '-power',
  CHARACTER_NAME = 'character_name',
  CHARACTER_NAME_DESC = '-character_name',
  POPULAR = 'popular',
  POPULAR_DESC = '-popular',
}

export interface InventoryHeroCardCatalogQuerySchema extends Partial<PaginationQuerySchema> {
  ordering?: string;
}

export interface InventoryHeroCardCatalogListResponseSchema
  extends ResponseResults<HeroCardSchema[]> {}

export interface InventoryHeroCardCreateRequestSchema {
  data: {
    description?: string;
    rank: HeroCardRank;
    character: number;
    cover: string;
  };
  user_message?: string;
}

export interface InventoryHeroCardUpdateRequestSchema {
  data: {
    description?: string;
    rank?: HeroCardRank;
    character?: number;
    cover?: string;
  };
  user_message?: string;
}

export interface InventoryHeroCardUpdateParamsSchema {
  cardId: NumberIsomorphic;
}

export interface InventoryMomentListParamsSchema {
  userId: number;
}

export interface InventoryMomentListQuerySchema extends Partial<PaginationQuerySchema> {}

export interface InventoryMomentListResponseSchema extends ResponseResults<MomentSchema[]> {}

export interface InventoryMomentLikeRequestSchema {
  moment: number;
  type: LikeDislikeType;
}

export interface InventoryDeckOpenParamsSchema {
  id: number;
}

export interface InventoryDeckOpenRequestSchema {
  chosen_card_id: number;
}

export interface InventoryWishesByHeroCardIdParamsSchema {
  cardId: number;
}

export interface InventoryWishesByHeroCardIdQuerySchema {
  wish_type?: (typeof WishTypeObj)[keyof typeof WishTypeObj] | null;
}

export interface InventoryWishesByHeroCardIdResponseSchema
  extends Array<{
    id: number;
    users: UserSchemaFragment;
    wish_type: (typeof WishTypeObj)[keyof typeof WishTypeObj] | null;
  }> {}
