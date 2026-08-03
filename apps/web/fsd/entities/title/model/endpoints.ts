import type { ToolkitEndpointBuilder } from '~shared/api/api-toolkit';
import type { SearchQuerySchema } from '~shared/api/models/search';
import type {
  AddSimilarTitleParamsSchema,
  CatalogTitleQuerySchema,
  MomentPaginatedListQuerySchema,
  MomentParamsSchema,
  SimilarTitlesPaginatedListParamsSchema,
  SimilarTitlesPaginatedListQuerySchema,
  TitleBundlesParamsSchema,
  TitleBundlesQuerySchema,
  TitleListQuerySchema,
  TitleRelationsListParamsSchema,
  TitleRetrieveParamsSchema,
  TitleSliderRetrieveParamsSchema,
  TitleSliderRetrieveQuerySchema,
  TitleSlidersListQuerySchema,
  TitleVoiceoverParamsSchema,
  TopTitleQuerySchema,
} from '~shared/api/models/title';
import { UrlBuilder } from '~shared/utils/url-formatter';

export namespace TitleEndpoints {
  export const list: ToolkitEndpointBuilder<void, TitleListQuerySchema> = ({ query = {} }) =>
    new UrlBuilder(`/api/v2/titles/`).query(query).build();
  export const one: ToolkitEndpointBuilder<TitleRetrieveParamsSchema, void> = ({ params = {} }) =>
    new UrlBuilder(`/api/v2/titles/`).add(String(params.dir)).build();
  export const update: ToolkitEndpointBuilder<TitleRetrieveParamsSchema, void> = ({
    params = {},
  }) => new UrlBuilder(`/api/v2/titles/`).add(String(params.dir)).build();
  export const create: ToolkitEndpointBuilder<void, void> = () =>
    new UrlBuilder(`/api/v2/titles/`).build();
  export const setRating = () => new UrlBuilder('/api/activity/ratings/').build();
  export const getVoiceover: ToolkitEndpointBuilder<TitleVoiceoverParamsSchema, void> = (
    variables
  ) => new UrlBuilder(`/api/v2/titles/${variables.params!.dir}/voiceover/`).build();
  export const getAnime: ToolkitEndpointBuilder<TitleVoiceoverParamsSchema, void> = (variables) =>
    new UrlBuilder(`/api/v2/titles/${variables.params!.dir}/anime/`).build();
  export const similar: ToolkitEndpointBuilder<
    SimilarTitlesPaginatedListParamsSchema,
    SimilarTitlesPaginatedListQuerySchema
  > = (variables) =>
    new UrlBuilder(`/api/v2/titles/${variables.params!.dir}/similar/`)
      .query(variables.query)
      .build();

  export const mostSearched = () => `/api/v2/search/popular/`;
  export const search: ToolkitEndpointBuilder<void, SearchQuerySchema> = (variables) =>
    new UrlBuilder(`/api/v2/search/`).query(variables.query).build();
  export const catalog: ToolkitEndpointBuilder<void, CatalogTitleQuerySchema> = ({ query }) =>
    new UrlBuilder(`/api/v2/search/catalog/`).query(query).build();
  export const relations: ToolkitEndpointBuilder<TitleRelationsListParamsSchema, void> = ({
    params,
  }) => new UrlBuilder(`/api/v2/titles/${params!.dir}/relations/`).build();
  export const createRelations: ToolkitEndpointBuilder<TitleRelationsListParamsSchema, void> = ({
    params,
  }) => new UrlBuilder(`/api/v2/titles/${params!.dir}/relations/`).build();
  export const updateRelations: ToolkitEndpointBuilder<TitleRelationsListParamsSchema, void> = ({
    params,
  }) => new UrlBuilder(`/api/v2/titles/${params!.dir}/relations/`).build();
  export const additional: ToolkitEndpointBuilder<TitleRelationsListParamsSchema, void> = ({
    params,
  }) => new UrlBuilder(`/api/v2/titles/${params!.dir}/additional/`).build();
  export const similarScore: ToolkitEndpointBuilder<void, void> = ({ query }) =>
    new UrlBuilder(`/api/activity/vote-similar/`).query(query).build();
  export const addSimilar: ToolkitEndpointBuilder<AddSimilarTitleParamsSchema, void> = ({
    query,
    params,
  }) => new UrlBuilder(`/api/titles/${params?.dir}/similar/`).query(query).build();
  export const addToBookmarks: ToolkitEndpointBuilder<void, void> = ({ query }) =>
    new UrlBuilder(`/api/users/bookmarks/`).query(query).build();
  export const removeFromBookmarks: ToolkitEndpointBuilder<void, void> = ({ query }) =>
    new UrlBuilder(`/api/users/bookmarks/`).query(query).build();

  export const purchaseBundle: ToolkitEndpointBuilder<void, void> = ({ query }) =>
    new UrlBuilder(`/api/billing/buy-chapter/`).query(query).build();

  export const titleChaptersAction: ToolkitEndpointBuilder<void, void> = () =>
    new UrlBuilder('/api/titles/chapters/').build();

  export const addBundleAction: ToolkitEndpointBuilder<void, void> = ({ params }) =>
    new UrlBuilder(`/api/v2/titles/volumes/${params!.branchId}`).build();

  export const getTitleBundles: ToolkitEndpointBuilder<
    TitleBundlesParamsSchema,
    TitleBundlesQuerySchema
  > = ({ query, params }) =>
    new UrlBuilder(`/api/titles/volumes/${params!.id}/`).query(query).build();

  export const createNote: ToolkitEndpointBuilder<any, void> = ({ params }) =>
    new UrlBuilder(`/api/activity/title-data/${params.titleId}/`).build();

  export const filters: ToolkitEndpointBuilder<any, void> = ({ params }) =>
    new UrlBuilder(`/api/v2/titles/${params.field}/`).build();

  export namespace Moment {
    export const tags: ToolkitEndpointBuilder<void, void> = () =>
      new UrlBuilder(`/api/v2/titles/moments/tags/`).build();
    export const one: ToolkitEndpointBuilder<MomentParamsSchema, void> = ({
      params: { momentDir = '' } = {},
    }) => new UrlBuilder(`/api/v2/titles/moments/${momentDir}/`).build();
    export const create: ToolkitEndpointBuilder<void, void> = () =>
      new UrlBuilder(`/api/v2/titles/moments/`).build();
    export const list: ToolkitEndpointBuilder<void, MomentPaginatedListQuerySchema> = (variables) =>
      new UrlBuilder(`/api/v2/titles/moments/`).query(variables.query).build();
  }

  export namespace Sliders {
    export const list: ToolkitEndpointBuilder<void, TitleSlidersListQuerySchema> = ({
      query = {},
    }) =>
      new UrlBuilder(`/api/v2/titles/sliders/`)
        .query({
          ...(query.type ? { type: query.type } : {}),
          with_titles: query.withTitles ? 1 : 0,
          titles_count: query.titles_count ?? 15,
        })
        .build();

    export const one: ToolkitEndpointBuilder<
      TitleSliderRetrieveParamsSchema,
      TitleSliderRetrieveQuerySchema
    > = ({ query, params = {} }) =>
      new UrlBuilder(`/api/v2/titles/sliders/`).add(String(params.dir)).query(query).build();
  }

  export namespace Top {
    export const list: ToolkitEndpointBuilder<void, TopTitleQuerySchema> = ({ query = {} }) =>
      new UrlBuilder(`/api/v2/titles/top/`)
        .query({
          ...query,
          section: query.period ?? 'monthly',
          [query.tag && query.tag !== 'all' ? 'tab_id' : '']: query.tag,
        })
        .build();
  }
}
