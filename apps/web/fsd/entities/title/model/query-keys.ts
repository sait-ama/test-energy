import type { ChaptersPaginatedListQuerySchema } from '~shared/api/models/chapter';
import type { SearchQuerySchema } from '~shared/api/models/search';
import type {
  SimilarTitlesPaginatedListParamsSchema,
  SimilarTitlesPaginatedListQuerySchema,
  TitleAnimeParamsSchema,
  TitleBundlesParamsSchema,
  TitleBundlesQuerySchema,
  TitleRelationsListParamsSchema,
  TitleRetrieveParamsSchema,
  TitleVoiceoverParamsSchema,
  TopTitleQuerySchema,
} from '~shared/api/models/title';
import { queryKit } from '~shared/api/react-query';

export namespace TitleKeys {
  export const retrieve = queryKit.createQueryKey<TitleRetrieveParamsSchema, void>((variables) => [
    'title',
    { authDepend: true, ...variables },
  ]);
  export const additional = queryKit.createQueryKey((variables) => [
    'title-additional',
    { authDepend: true, ...variables },
  ]);

  export const titlesByQueryOptions = queryKit.createQueryKey((variables) => [
    'catalog',
    {
      ...variables,
      authDepend: true,
    },
  ]);

  export const mostSearched = queryKit.createQueryKey<void, void>(() => ['most-search-titles']);
  export const search = queryKit.createQueryKey<void, SearchQuerySchema>((variables) => [
    'search',
    { authDepend: true, ...variables },
  ]);

  export const list = queryKit.createQueryKey((variables) => ['titles-list', variables]);
  export const listInfinite = queryKit.createQueryKey((variables) => [
    'titles-infinite-list',
    variables,
  ]);

  export const top = queryKit.createQueryKey<void, TopTitleQuerySchema>((variables) => [
    'top-titles',
    variables,
  ]);

  export const sliders = queryKit.createQueryKey((variables) => ['title-sliders-list', variables]);
  export const slidersInfinite = queryKit.createQueryKey((variables) => [
    'title-sliders-infinite-list',
    variables,
  ]);

  export const slider = queryKit.createQueryKey((variables) => ['title-slider', variables]);
  export const sliderInfinite = queryKit.createQueryKey((variables) => [
    'title-slider-infinite',
    variables,
  ]);
  export const similar = queryKit.createQueryKey<
    SimilarTitlesPaginatedListParamsSchema,
    SimilarTitlesPaginatedListQuerySchema
  >((variables) => ['similar', { authDepend: true, ...variables }]);
  export const relations = queryKit.createQueryKey<TitleRelationsListParamsSchema, void>(
    (variables) => ['relations', variables]
  );

  export const titleChapters = queryKit.createQueryKey<void, ChaptersPaginatedListQuerySchema>(
    (variables) => ['title-chapters', variables]
  );
  export const titleBundles = queryKit.createQueryKey<
    TitleBundlesParamsSchema,
    TitleBundlesQuerySchema
  >((variables) => ['title-bundles', variables]);

  export const voiceover = queryKit.createQueryKey<TitleVoiceoverParamsSchema, void>(
    (variables) => ['title-voiceover', variables]
  );
  export const anime = queryKit.createQueryKey<TitleAnimeParamsSchema, void>((variables) => [
    'title-anime',
    variables,
  ]);

  export const filters = queryKit.createQueryKey<{ fields: string[] }, void>((variables) => [
    'title-filters',
    variables,
  ]);
}
