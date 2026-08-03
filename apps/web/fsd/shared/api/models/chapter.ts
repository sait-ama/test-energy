import type { RatedStatus } from '~shared/api/models/post';
import type { PaginationQuerySchema, ResponseResults } from '~shared/types/buisines';

import type { PublisherSchema } from './publisher';

export enum ChapterOrdering {
  DESC = '-index',
  ASC = 'index',
}

export const CHAPTER_ORDERING_DEFAULT = ChapterOrdering.DESC;

export interface ChapterPage {
  link: string;
  height: number;
  id: number;
  width: number;
  count_comments: number;
}

export enum PurchaseType {
  ALL = 1,
  SINGLE = 2,
  VOLUME = 3,
}

export interface ChapterSchema {
  id: number;
  tome: number;
  chapter: string;
  name: string;
  score: number;
  upload_date: string;
  is_paid: boolean;
  title_id: number;
  volume_id: number;
  branch_id: number;
  price: string;
  pub_date: string;
  index: number;
  delay_pub_date: string;
  is_published: boolean;
  publishers: PublisherSchema[];
  is_bought: boolean;
  viewed: boolean;
  rated: RatedStatus | null;
  pages: ChapterPage[][];
  previous: ChapterFragmentSchema;
  next: ChapterFragmentSchema;
  purchase_type: PurchaseType;
  volume?: {
    id: number;
    name: string;
    price: number;
    chapters: ChapterFragmentSchema[];
  };
  server: {
    link: string;
    fallback_link?: string;
    id: number;
    name: string;
  };
}

export interface ChapterLikeRequestSchema {
  chapter_ids: number[];
}

export interface ChapterViewRequestSchema {
  chapter: number;
}

export interface ChapterViewMultipleRequestSchema {
  chapter_ids: number[];
}

export interface ChapterUnviewMultipleRequestSchema extends ChapterViewMultipleRequestSchema {}

export type ChapterFragmentSchema = Pick<
  ChapterSchema,
  'id' | 'chapter' | 'tome' | 'is_paid' | 'index' | 'purchase_type'
>;

export interface ChaptersPaginatedListQuerySchema extends Partial<PaginationQuerySchema> {
  detail?: number;
  user_data?: number;
  branch_id: string;
  is_published?: number;
  ordering?: string;
  chapter: string | number;
}

export interface ChaptersPaginatedListResponseSchema extends ResponseResults<ChapterSchema[]> {}

export interface ChapterRetrieveResponseSchema extends ChapterSchema {}

export interface ChapterRetrieveParamsSchema {
  chapter: string;
}

export type BuyChapterRequestSchema =
  | {
      currency: 'money' | 'tickets';
      chapter: number;
    }
  | {
      volume: number;
    };

export interface ChapterRetrieveLastQuerySchema {
  branch_id: string;
}
