import type { TitleSchemaFragment } from '~shared/api/models/title';
import type { PaginationQuerySchema, ResponseResults } from '~shared/types/buisines';

export interface LatestChapterSchema {
  count_uploaded: number;
  id: number;
  index: number;
  is_paid: boolean;
  chapter: string;
  tome: number;
  title: TitleSchemaFragment;
  upload_date: string;
}

export const OnlyMyEnumKeysNamesMapper = {
  0: 'EXCLUDE',
  undefined: 'ALL',
  1: 'ONLY',
};
export const OnlyMyEnum = {
  EXCLUDE: 0,
  ALL: undefined,
  ONLY: 1,
} as const;

export type OnlyMy = (typeof OnlyMyEnum)[keyof typeof OnlyMyEnum];

export interface LatestChaptersListQuerySchema extends Partial<PaginationQuerySchema> {
  publisher?: number;
  bookmarks?: OnlyMy;
  only_reading?: number;
}

export interface LatestChaptersListResponseSchema extends ResponseResults<LatestChapterSchema[]> {}
