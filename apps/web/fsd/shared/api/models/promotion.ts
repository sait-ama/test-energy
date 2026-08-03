import type { PaginationQuerySchema } from '~shared/types/buisines';

export interface Promotion {
  id: number;
  header: string;
  description: string;
  url: string;
  cover: string;
}

export type PromotionsListQuerySchema = PaginationQuerySchema;

export type PromotionsListResponseSchema = Promotion[];
