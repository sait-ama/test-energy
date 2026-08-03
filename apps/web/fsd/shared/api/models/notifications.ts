import type { PaginationQuerySchema, PaginationResponse } from '~shared/types/buisines';
import type { ResponseResults } from '~shared/types/buisines';

export interface NotificationSchema {
  id: NumberIsomorphic;
  comment: string | null;
  date: string;
  action: number;
  img: string;
  link: string;
  status: boolean;
  text: string;
  title: number;
  total: number;
  type: number;
}

export interface NotificationsGetListQuerySchema extends Partial<PaginationQuerySchema> {
  status?: string | number;
  type?: number;
  title_id?: number;
  exclude?: number;
}

export interface NotificationsGetListResponseSchema
  extends PaginationResponse,
    ResponseResults<NotificationSchema[]> {}

export interface NotificationsSetReadedRequestSchema {
  type: number;
  notification: string;
}

export interface NotificationsDeleteRequestSchema {
  type: number;
  status: number;
  notification: string;
}
