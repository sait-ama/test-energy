import type { UserSchemaFragment } from '~shared/api/models/user';
import type {
  PaginationQuerySchema,
  PaginationResponse,
  ResponseResults,
} from '~shared/types/buisines';

export interface GetReportReasonsQuerySchema {
  type: string;
}

export type GetReportReasonsResponseSchema = { id: number; name: string; description?: string }[]; // todo migrate to results

export interface CreateReportRequestSchema {}

export interface CreateReportResponseSchema {}

export enum ChangeRequestStatus {
  OPEN = '1_open',
  ACCEPTED = '2_accepted',
  REJECTED = '3_rejected',
}

export enum ChangeRequestType {
  MOMENT_UPDATE = 'moment_update',
  MOMENT_ADD = 'moment_add',
  TITLE_UPDATE = 'title_update',
  TITLE_ADD = 'title_add',
  PUBLISHER_ADD = 'publisher_add',
  TITLE_CHANGE_PUBLISHER = 'title_change_publisher',
  TITLE_NEW_SEASON = 'title_new_season',
  TITLE_CHAPTER_UPDATE = 'title_chapter_update',
  TITLE_ADD_CREATORS = 'title_add_creators',
  CREATOR_ADD = 'creator_add',
  CREATOR_UPDATE = 'creator_update',
  CREATOR_ADD_TITLE = 'creator_add_title',
  TITLE_ADDITIONAL_ADD = 'title_additional_add',
  TITLE_ADDITIONAL_UPDATE = 'title_additional_update',
  CHARACTER_ADD = 'character_add',
  CHARACTER_UPDATE = 'character_update',
  TITLE_TO_RELATION_ADD = 'title_relation_add',
  TITLE_TO_RELATION_UPDATE = 'title_relation_update',
  CARD_ITEM_ADD = 'card_item_add',
  CARD_ITEM_UPDATE = 'card_item_update',
  SHOP_IMAGE_ITEM_ADD = 'shop_image_item_add',
}

export const requestNameMap: Record<string, string> = {
  [ChangeRequestType.MOMENT_UPDATE]: 'Изменение момента',
  [ChangeRequestType.MOMENT_ADD]: 'Добавление момента',
  [ChangeRequestType.TITLE_UPDATE]: 'Изменение тайтла',
  [ChangeRequestType.TITLE_ADD]: 'Добавление тайтла',
  [ChangeRequestType.PUBLISHER_ADD]: 'Добавление паблишера',
  [ChangeRequestType.TITLE_CHANGE_PUBLISHER]: 'Изменение переводчиков тайтла',
  [ChangeRequestType.TITLE_NEW_SEASON]: 'Тайтл в новый сезон',
  [ChangeRequestType.TITLE_CHAPTER_UPDATE]: 'Обновление глав тайтла',
  [ChangeRequestType.TITLE_ADD_CREATORS]: 'Добавление создателей тайтла',
  [ChangeRequestType.CREATOR_ADD]: 'Добавление создателя',
  [ChangeRequestType.CREATOR_UPDATE]: 'Изменение создателя',
  [ChangeRequestType.CREATOR_ADD_TITLE]: 'Добавление создателя тайтла',
  [ChangeRequestType.TITLE_ADDITIONAL_ADD]: 'Добавление альтернативной ссылки на тайтл',
  [ChangeRequestType.TITLE_ADDITIONAL_UPDATE]: 'Изменение альтернативной ссылки на тайтл ',
  [ChangeRequestType.CHARACTER_ADD]: 'Добавление персонажа',
  [ChangeRequestType.CHARACTER_UPDATE]: 'Изменение персонажа',
  [ChangeRequestType.TITLE_TO_RELATION_ADD]: 'Добавление связанных произведений тайтла',
  [ChangeRequestType.TITLE_TO_RELATION_UPDATE]: 'Изменение связанных произведений тайтла',
  [ChangeRequestType.CARD_ITEM_ADD]: 'Добавление карточки',
  [ChangeRequestType.CARD_ITEM_UPDATE]: 'Изменение карточки',
  [ChangeRequestType.SHOP_IMAGE_ITEM_ADD]: 'Добавление предмета в магазин',
};

export interface ChangeRequestSchema<T extends ChangeRequestType = ChangeRequestType> {
  id: number;
  type: T;
  moderator_message?: string;
  status: ChangeRequestStatus;
  created_at: string;
  updated_at: string;
  request_name: string;
  user: UserSchemaFragment;
  moderator: UserSchemaFragment;
  fields: any;
}
//todo

export interface UserRequestListResponseSchema
  extends PaginationResponse,
    ResponseResults<ChangeRequestSchema[]> {}

export interface UserRequestListQuerySchema extends Partial<PaginationQuerySchema> {
  type?: ChangeRequestType | null;
  status?: ChangeRequestStatus | null;
}

export interface UserRequestParamsSchema {
  requestId: number;
}

export interface UserRequestResponseSchema<T extends ChangeRequestType>
  extends ChangeRequestSchema<T> {}

/**
 * * `positive_comment` - Позитивный фидбек
 * * `negative_comment` - Негативный фидбек
 * * `advice` - Предложение
 * * `sub_cancell_reason` - Причина отмены подписки
 */
export type UserFeedbackType =
  | 'positive_comment'
  | 'negative_comment'
  | 'advice'
  | 'sub_cancell_reason';

/**
 * * `web` - Сайт
 * * `app` - Приложение
 */
export type PlatformEnum = 'web' | 'app';

export type UserFeedback = {
  readonly id: number;
  type: UserFeedbackType;
  platform?: PlatformEnum;
  readonly created_at: string;
  readonly updated_at: string;
  topic: string;
  score?: number;
  user: UserSchemaFragment;
};
