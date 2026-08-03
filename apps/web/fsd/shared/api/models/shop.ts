import { Deck } from '@re/api/generated/types.gen';
import { removeUnusedQueryParams } from '@re/core/lib/query-params';
import queryString from 'query-string';

import { CharacterSchemaFragment } from '~shared/api/models/character';
import type { UserSchemaFragment, UserTheme } from '~shared/api/models/user';
import type {
  imgSizes,
  PaginationQuerySchema,
  PaginationResponse,
  ResponseResults,
} from '~shared/types/buisines';

import { ShortCardItem } from '../generated/models';

export interface EmojiSchema {
  id: number;
  is_emoji: boolean;
  name: string;
  image: Record<'high', string>;
}

export interface EmojiPackSchema {
  name: string;
  id: number;
  is_emoji: boolean;
  emojis: EmojiSchema[];
  cover: Record<imgSizes, string>;
}

export interface ImageItemSchema {
  id: number;
  name: string;
  type: ShopImageItemType;
  image: {
    high: string;
  };
  author: UserSchemaFragment;
}

export enum ShopImageItemType {
  FRAME = 'frame',
  AVATAR = 'avatar',
  WALLPAPER = 'wallpaper',
}

export enum ShopItemTypes {
  FRAME = 'frame',
  AVATAR = 'avatar',
  WALLPAPER = 'wallpaper',
  PACK = 'pack',
  _STICKER_PACK = 'stickersPack',
  DECK = 'deck',
  THEME = 'theme',
  // ALL = 'all',
}

export interface ShopItemSchemaPack {
  id: number;
  emoji_pack: EmojiPackSchema;
  cost: number;
  cost_tickets: number;
  cost_rub: string;
  is_bought: boolean;
  availability_end_date: string | null;
  availability_start_date: string | null;
  is_using: boolean;
  dir: string;
  amount: number | null;
}

export type ShopItemSchemaImage = {
  image_item: ImageItemSchema;
} & Omit<ShopItemSchemaPack, 'emoji_pack' | 'theme'>;

export type ShopItemSchemaTheme = {
  theme: UserTheme;
} & Omit<ShopItemSchemaPack, 'emoji_pack' | 'image_item'>;

export type ShopItemSchema = Omit<
  ShopItemSchemaPack & ShopItemSchemaImage & ShopItemSchemaTheme,
  'emoji_pack' | 'image_item' | 'theme'
> & {
  emoji_pack: EmojiPackSchema | null;
  image_item: ImageItemSchema | null;
  theme: UserTheme | null;
};

export enum ShopPaginatedListOrderings {
  EXPANSIVE = '-cost',
  CHEAP = 'cost',
  COUNT_UP = '-amount',
  COUNT_DOWN = 'amount',
  IS_BOUGHT_FIRST = '-is_bought',
  IS_BOUGHT_LAST = 'is_bought',
}

export interface ShopPaginatedListQuerySchema<T extends ShopItemTypes = ShopItemTypes>
  extends Partial<PaginationQuerySchema> {
  ordering?: ShopPaginatedListOrderings;
  type: T;
  is_emoji?: T extends ShopItemTypes.PACK ? boolean : never;
}

export interface ShopItemDirParamsSchema {
  shopItemDir: string;
}

export const ShopPaginatedListOrderingValues = [
  { value: ShopPaginatedListOrderings.CHEAP, label: 'Дешевые' },
  { value: ShopPaginatedListOrderings.EXPANSIVE, label: 'Дорогие' },
  { value: ShopPaginatedListOrderings.COUNT_DOWN, label: 'Осталось мало' },
] satisfies { value: ShopPaginatedListOrderings; label: string }[];

export interface ShopPaginatedListResponseSchema
  extends PaginationResponse,
    ResponseResults<ShopItemSchema[]> {}

export interface ShopItemByIdParamsSchema {
  shopItemId: number;
}

export interface ShopItemByIdRequestSchema {
  currency: 'tickets' | 'coins';
  count?: number;
}

export interface CreateShopItemRequestSchema {
  data: {
    name: string;
    cost?: number;
    amount?: number;
    image_source?: string;
    type: ShopImageItemType;
  };
}

export interface UserOrderSchema {
  id: number;
  created_at: string;
  item: ShopItemSchema;
}

export interface OrderShopByIdParamsSchema {
  orderId: NumberIsomorphic;
}

export interface OrderPaginatedListQuerySchema extends Partial<PaginationQuerySchema> {}

export interface OrderPaginatedListResponseSchema
  extends PaginationResponse,
    ResponseResults<UserOrderSchema[]> {}

export const shopCatalog = (query: ShopPaginatedListQuerySchema) =>
  `/api/v2/shop/?${queryString.stringify(removeUnusedQueryParams(query))}`;

export interface ShortCardItemSchema extends ShortCardItem {
  character?: CharacterSchemaFragment;
}

export interface DeckLevel {
  readonly id: number;
  name: string;
  description?: string;
}

export enum DeckType {
  PAID = 'paid',
  RANDOM = 'random',
}

export interface DeckSchema {
  readonly id: number;
  deck: Deck;
  name: string;
  cost: number;
  amount: number | null;
  cost_tickets: number;
  cost_rub: number;
  availability_start_date: string | null;
  availability_end_date: string | null;
  description?: string;
  readonly level: DeckLevel;
  readonly type: DeckType;
  cover?: {
    mid: string;
    high: string;
  };
  price: number;
  is_active?: boolean;
  readonly cards: ShortCardItemSchema[];
  current_decks_opens: {
    id: string;
    user_id: number;
    deck_id: number;
    rank_s_opens: number;
    rank_a_opens: number;
  } | null;
  guarantors: {
    id: string;
    name: string;
    guarantors: {
      rank_s: number;
      rank_a: number;
    };
  };
}

export interface DeckRetrieveResponseSchema extends DeckSchema {}

export interface DeckRetrieveParamsSchema {
  deckId: string;
}

export interface ThemeRetrieveResponseSchema extends ShopItemSchemaTheme {}

export interface ThemeRetrieveParamsSchema {
  themeDir?: string;
}

export interface DecksListPaginatedListQuerySchema extends Partial<PaginationQuerySchema> {
  deck_id?: string;
}

export interface DecksListPaginatedListResponseSchema extends ResponseResults<DeckSchema[]> {}
