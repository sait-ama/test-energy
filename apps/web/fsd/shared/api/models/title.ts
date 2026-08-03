import { RatedStatusType } from '~shared/api/models/common';
import type { UserSchemaFragment } from '~shared/api/models/user';
import type { imgSizes, PaginationQuerySchema, ResponseResults } from '~shared/types/buisines';

import type { TitleSchema as _TitleSchema } from './common';
import type { CreatorSchema } from './creator';
import type { Type } from './forms';
import type { PublisherSchema, PublisherSchemaFragment } from './publisher';

export enum TitlesStatuses {
  COMPLETED = 1,
  ONGOING = 2,
  FREEZED = 3,
  ANNOUNCED = 5,
  LICENSED = 6,
}

export interface BranchSchema {
  count_chapters: number;
  id: number;
  img: imgSizes;
  publishers: PublisherSchemaFragment[];
  subscribed: boolean;
  total_votes: number;
  new_chapter_date: string;
}

export type TitleSchema = _TitleSchema;

export type TitleDetailSchema = TitleSchema & {
  creators: CreatorSchema[];
  categories: Type[];
  genres: Type[];
  forbidden_fields: any;
  publishers: PublisherSchema[];
  branches: BranchSchema[];
  rated: RatedStatusType;
  status: any;
  translate_status: any;
  fresh_rating: string;
  count_anime: number;
  count_cards: number;
  count_characters: number;
  count_posts: number;
  has_voiceover: number;
  count_moments: number;
  count_comments: number;
  can_post_comments: boolean;
  note: string | null;
  uploaded: boolean;
  meta: {
    admin_link: string;
    can_pin_comment: boolean;
    can_update: boolean;
    can_upload_chapters: boolean;
    is_subscribed_cards: boolean;
    is_forbidden_by_country: boolean;
  };
  stats?: {
    ratings?: Record<number, number>;
    bookmarks?: { name: string; count: number }[];
  };
  adaptation: {
    name: string;
    description: string;
    url: string;
    year: number;
    cover: {
      high?: string;
      mid?: string;
    };
  };
};

export interface TitlesSliderSchema {
  description: string;
  dir: string;
  id: number;
  name: string;
  titles: TitleSchema[];
  type: number;
}

export type TitleSchemaFragment = Pick<
  TitleSchema,
  | 'id'
  | 'main_name'
  | 'cover'
  | 'secondary_name'
  | 'dir'
  | 'is_yaoi'
  | 'is_erotic'
  | 'avg_rating'
  | 'bookmark_type'
  | 'type'
  | 'count_bookmarks'
  | 'count_chapters'
  | 'total_votes'
  | 'total_views'
  | 'issue_year'
>;

export interface TitleFragmentFragment {
  main_name: string;
  dir: string;
  cover: Record<imgSizes, string>;
}

export enum CatalogTitleOrderingSchema {
  ID_ASC = 'id',
  ID_DESC = '-id',

  VIEWS_ASC = 'views',
  VIES_DESC = '-views',

  COUNT_CHAPTERS_ASC = 'count_chapters',
  COUNT_CHAPTERS_DESC = '-count_chapters',

  CHAPTER_DATE_ASC = 'chapter_date',
  CHAPTER_DATE_DESC = '-chapter_date',

  RANDOM_ASC = 'random',
  RANDOM_DESC = '-random',

  SCORE_ASC = 'score',
  SCORE_DESC = '-score',

  COUNT_RATING_ASC = 'count_rating',
  COUNT_RATING_DESC = '-count_rating',

  RATING_ASC = 'rating',
  RATING_DESC = '-rating',

  VOTES_ASC = 'votes',
  VOTES_DESC = '-votes',
}

export interface CatalogTitleQuerySchema extends Partial<PaginationQuerySchema> {
  publishers?: string[];
  creators?: string[];
  types?: string[];
  age_limit?: string[];
  last_chapter_uploaded_gte?: string;
  last_chapter_uploaded_lte?: string;
  count_chapters_gte?: string;
  count_chapters_lte?: string;
  issue_year_gte?: string;
  issue_year_lte?: string;
  rating_gte?: string;
  rating_lte?: string;
  search?: string;
  status?: string[];
  translate_status?: string[];
  genres?: string[];
  bookmarks?: string[];
  exclude_bookmarks?: string[];
  categories?: string[];
  exclude_types?: string[];
  exclude_categories?: string[];
  exclude_genres?: string[];
  ordering?: CatalogTitleOrderingSchema;
}

export interface TitleRetrieveParamsSchema {
  dir: string;
}

export interface TitleSliderRetrieveParamsSchema {
  dir: NumberIsomorphic;
}

export type TitleSliderTypes = 'hot_new' | 'general' | NumberIsomorphic;

export type TitleListQuerySchema = {
  slider?: TitleSliderTypes;
} & Partial<PaginationQuerySchema>;

export type TitleSlidersListQuerySchema = {
  type?: NumberIsomorphic;
  withTitles?: 1 | 0;
  titles_count?: number;
} & Partial<PaginationQuerySchema>;

export type TitleSliderRetrieveQuerySchema = Partial<PaginationQuerySchema>;

export type TopTitleQuerySchema = {
  period?: string;
  tag?: NumberIsomorphic;
} & Partial<PaginationQuerySchema>;

export interface CatalogTitlesResponseSchema extends ResponseResults<TitleSchemaFragment[]> {}

export interface TopTitlesResponseSchema extends ResponseResults<TitleSchemaFragment[]> {}

export interface TitlesListResponseSchema extends ResponseResults<TitleSchemaFragment[]> {}

export interface TitleRetrieveResponseSchema extends TitleDetailSchema {}

export type TitleSlidersListResponseSchema = TitlesSliderSchema[];

export type TitleSliderRetrieveResponseSchema = TitlesSliderSchema;

export interface SetRatingRequestSchema {
  title: number;
  rating: number;
}

export interface SimilarTitlesPaginatedListParamsSchema {
  dir: string;
}

export interface SimilarTitlesPaginatedListQuerySchema extends Partial<PaginationQuerySchema> {}

export interface SimilarTitle {
  history: boolean;
  draw: boolean;
  id: number;
  score: number;
  genre: boolean;
  title: TitleSchemaFragment;
  rated: RatedStatusType;
}

export interface SimilarTitlesPaginatedListResponseSchema extends ResponseResults<SimilarTitle[]> {}

export interface ScoreSimilarTitlesRequestSchema {
  vote_type: 0 | 1;
  title1_dir: string;
  title2_dir: string;
}

export interface TitleRelationsListParamsSchema {
  dir: string;
}

export enum SimilarByTypes {
  DRAW = 'draw',
  GENRE = 'genre',
  HISTORY = 'history',
}

export interface AddSimilarTitleParamsSchema {
  dir: string;
}

export interface AddSimilarTitleRequestSchema {
  similar_dir: string;
  [SimilarByTypes.DRAW]: boolean;
  [SimilarByTypes.GENRE]: boolean;
  [SimilarByTypes.HISTORY]: boolean;
}

export interface PurchaseBundleRequestSchema {
  volume: NumberIsomorphic;
}

export interface AddTitleToBookmarksRequestSchema {
  title: number;
  type: number;
}

export interface RemoveTitleFromBookmarksRequestSchema {
  title: string;
}

export enum TitleRelations {
  MAIN = 'main',
  PREQUEL = 'prequel',
  SEQUEL = 'sequel',
  SPINOFF = 'spinoff',
  ORIGINAL = 'original',
  ALTERNATIVE = 'alternative',
  ANIME = 'anime',
  COMIC = 'comic',
  COLOR = 'color',
  BLACKWHITE = 'blackwhite',
  REMAKE = 'remake',
  FIRST = 'first',
  UNIVERSE = 'universe',
}

export interface TitleRelationItem {
  id: number;
  type: {
    id: TitleRelations;
    name: string;
  };
  title: TitleSchemaFragment;
}

export type TitleAdditionalResponseSchema = Record<string, string>;

export interface TitleAdditionalUpdateRequestSchema {
  data: Record<string, string>;
}

export interface TitleAdditionalCreateRequestSchema {
  data: Record<string, string>;
}

export interface TitleRelationsListResponseSchema {
  id: number;
  titles: TitleRelationItem[];
}

export interface TitleRelationsUpdateSchema {
  data: {
    titles: {
      title: number;
      type: string;
      position: number;
    }[];
  };
}

export interface TitleRelationsCreateSchema {
  data: {
    titles: {
      title: number;
      type: string;
      position: number;
    }[];
  };
}

export interface BundlesSchema {
  count_buys: number;
  id: number;
  is_bought: boolean;
  name: string;
  price: string;
  publisher_income: string;
}

export interface TitleBundlesResponseSchema extends V1Response<BundlesSchema> {}

export interface TitleBundlesEditTable extends BundlesSchema {}

export interface TitleChaptersActionsRequestSchema {
  method: 'make_free' | 'delete' | 'pub';
  chapters: string;
}

export interface TitleBundlesQuerySchema {
  detail: 1;
}

export interface TitleBundlesParamsSchema {
  id: NumberIsomorphic;
}

export interface TitleVoiceoverParamsSchema {
  dir: string;
}

export interface TitleAnimeParamsSchema {
  dir: string;
}

export interface Moment {
  id: number;
  dir: string;
  author: UserSchemaFragment;
  title: TitleSchemaFragment;

  rated: RatedStatusType;

  tags: MomentTag[];

  image: string;
  score: number;
  created_at: string;
}

export interface MomentPaginatedListResponseSchema extends ResponseResults<Moment[]> {}

export interface MomentPaginatedListQuerySchema extends Partial<PaginationQuerySchema> {
  title_id?: number;
  chapter_id?: number;
}

export interface MomentTag {
  id: number;
  name: string;
  description: string;
  dir: string;
}

export type MomentsTagListResponse = MomentTag[];

export interface MomentCreateRequestSchema {
  title: number;
  tags: number[];
}
export interface MomentParamsSchema {
  momentDir: string;
}

export interface CreateTitleCollectionRequestSchema {
  name: string;
  description: string;
  cover: string;
  titles: { title: string; pos: number }[];
}

export type TitleFiltersRetrieveResponseSchema = {
  id: number;
  dir: string;
  description: string;
  name: string;
}[];

export type TitleFiltersRetrieveParamsSchema = {
  field: string;
};
export type TitleFiltersAggregatedRetrieveResponseSchema = Record<
  string,
  TitleFiltersRetrieveResponseSchema
>;
