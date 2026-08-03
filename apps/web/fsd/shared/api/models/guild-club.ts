import { type UserSchemaFragment } from '~shared/api/models/user';
import type {
  imgSizes,
  PaginationQuerySchema,
  PaginationResponse,
  ResponseResults,
  ResponseResultsV2,
} from '~shared/types/buisines';

export interface ClubCreateUpdateRequestSchema {
  /**
   * Строка файла в формате JS Base64
   */
  avatar?: string;
  name: string;
  /**
   * Строка файла в формате JS Base64
   */
  wallpaper?: string;
  /**
   * Описание клуба
   */
  description: string;
  is_public?: boolean;
}

export type ClubCreateUpdateResponseSchema = {
  readonly id: number;
  readonly dir: string;
} & ClubCreateUpdateRequestSchema;

export enum RoleEnum {
  CREATOR = 'creator',
  ADMIN = 'admin',
  MEMBER = 'member',
}

export type RoleSchema = RoleEnum;

export interface MemberSchema {
  user: {
    id: number;
    username: string;
    avatar: {
      low: string;
      mid: string;
      high: string;
    };
    tagline: string;
    frame: {
      high: string;
    };
    is_premium: boolean;
  };
  role: RoleSchema;
  coins_spent: number;
}

export interface BonusSchema {
  card_chance_multiplier: number;
  coins_chance_multiplier: number;
  give_deck_once_week: boolean | number;
}

export interface LevelSchema {
  max_exp: number;
  max_members_count: number;
  name: string;
  bonuses: BonusSchema;
}

export interface ClubDetailSchema {
  readonly id: number;
  members: MemberSchema[];
  avatar?: Record<imgSizes, string>;
  /**
   * Ожидает ли заявки, is_waiting и is_member - не возможен
   */
  is_waiting: boolean;
  name: string;
  //todo добавить поле, exp!=balance
  balance?: number;
  /**
   * null - нет заявки на удалении, created - создана, ждите 72 часа, ready - прошло 72 ч
   * */
  delete_status?: null | 'created' | 'ready';
  /**
   * Текущий уровень
   */
  cur_level: number;
  /**
   * Текущее кол-во молний клуба
   */
  exp: number;
  /**
   * Генерируется автоматически
   */
  dir: string;
  /**
   * Текущее кол-во участников
   */
  members_count: number;
  /**
   * Текущая позиция клуба в мировом рейтинге
   */
  rank: number;
  description?: string;
  is_admin?: boolean;
  is_member?: boolean;
  is_creator?: boolean;
  /**
   * JSON описание особенностей уровня:
   * max_exp - Кол-во молний для перехода на след. уровень
   * max_members_count - Макс. кол-во участников на текущем уровне
   * name - Название уровня
   * bonuses - Бонусы(в формате JSON)
   */
  readonly level_info: LevelSchema;
  /**
   * обложка клуба
   */
  is_public: boolean;
  readonly wallpaper: Record<imgSizes, string>;
}

export type ClubSchemaFragment = Pick<ClubDetailSchema, 'dir' | 'name' | 'id'>;

export interface ClubExpDonateAPIViewCreateRequestSchema {
  /**
   * Кол-во молний для пожертвования
   */
  coins: number;
}

export interface ClubsRetrieveParamsSchema {
  dir: string;
}

export type ClubListResponseSchema = PaginationResponse &
  ResponseResultsV2<ClubListSchema[], { create_cost: number }>;

export interface ClubListQuerySchema extends Partial<PaginationQuerySchema> {
  user_id?: number;
  ordering?: 'rank' | '-rank';
}

export interface ClubListSchema {
  readonly id: number;
  avatar?: Record<imgSizes, string>;
  name: string;
  /**
   * Текущий уровень
   */
  cur_level: number;
  /**
   * Текущее кол-во молний клуба
   */
  exp: number;
  /**
   * Генерируется автоматически
   */
  dir: string;
  /**
   * Текущее кол-во участников
   */
  members_count: number;
  /**
   * Текущая позиция клуба в мировом рейтинге
   */
  rank: number;
  /**
   * Кол-во молний для перехода на след. уровень
   */
  max_exp: number;
  /**
   * Макс. участников на этом уровне
   */
  max_members_count: number;
}

export interface ClubRequestSchema {
  readonly id: number;
  readonly created_at: string;
  readonly user: UserSchemaFragment;
}

export type ClubRequestSchemaUpdateParamsSchema = {
  id: NumberIsomorphic;
} & ClubsRetrieveParamsSchema;
export type ClubRequestPaginatedListQuerySchema = {} & PaginationQuerySchema;
export type ClubRequestPaginatedListResponseSchema = ResponseResults<ClubRequestSchema[]> &
  PaginationResponse;

export interface ClubRequestSchemaUpdateRequestSchema {
  /**
   * Подвердить заявку на вступление?
   */
  submit: boolean;
}

export type ClubManageMemberRequestSchema = {
  user_id: number;
  role?: RoleSchema;
  to_delete?: boolean;
};
