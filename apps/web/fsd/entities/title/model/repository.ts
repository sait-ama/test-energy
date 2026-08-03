import { TitleEndpoints } from '~entities/title/model/endpoints';
import { api } from '~shared/api/$api';
import { apiToolkit } from '~shared/api/api-toolkit';
import type {
  PopularTitlesResponseSchema,
  SearchField,
  SearchQuerySchema,
  SearchResponseSchema,
} from '~shared/api/models/search';
import {
  AddSimilarTitleParamsSchema,
  AddSimilarTitleRequestSchema,
  AddTitleToBookmarksRequestSchema,
  CatalogTitleQuerySchema,
  CatalogTitlesResponseSchema,
  PurchaseBundleRequestSchema,
  RemoveTitleFromBookmarksRequestSchema,
  ScoreSimilarTitlesRequestSchema,
  SetRatingRequestSchema,
  SimilarTitlesPaginatedListParamsSchema,
  SimilarTitlesPaginatedListQuerySchema,
  SimilarTitlesPaginatedListResponseSchema,
  TitleAdditionalCreateRequestSchema,
  TitleAdditionalResponseSchema,
  TitleAdditionalUpdateRequestSchema,
  TitleAnimeParamsSchema,
  TitleBundlesParamsSchema,
  TitleBundlesQuerySchema,
  TitleChaptersActionsRequestSchema,
  TitleFiltersRetrieveParamsSchema,
  TitleFiltersRetrieveResponseSchema,
  TitleListQuerySchema,
  TitleRelationsCreateSchema,
  TitleRelationsListParamsSchema,
  TitleRelationsListResponseSchema,
  TitleRelationsUpdateSchema,
  TitleRetrieveParamsSchema,
  TitleRetrieveResponseSchema,
  TitleSliderRetrieveParamsSchema,
  TitleSliderRetrieveQuerySchema,
  TitleSliderRetrieveResponseSchema,
  TitleSlidersListQuerySchema,
  TitleSlidersListResponseSchema,
  TitlesListResponseSchema,
  TitleVoiceoverParamsSchema,
  TopTitleQuerySchema,
  TopTitlesResponseSchema,
} from '~shared/api/models/title';

const createTitleRouter = apiToolkit(({ api, toolbox }) => ({
  one: toolbox.createMethod<TitleRetrieveResponseSchema, void, TitleRetrieveParamsSchema, void>(
    (variables, opts) => api.get(TitleEndpoints.one(variables), opts)
  ),
  create: toolbox.createMethod<TitleRetrieveResponseSchema, void, void, void>((variables, opts) =>
    api.post(TitleEndpoints.create(variables), variables.data, opts)
  ),
  update: toolbox.createMethod<TitleRetrieveResponseSchema, any, TitleRetrieveParamsSchema, void>(
    (variables, opts) => api.put(TitleEndpoints.update(variables), variables.data, opts)
  ),
  titlesByQuery: toolbox.createMethod<
    CatalogTitlesResponseSchema,
    void,
    void,
    CatalogTitleQuerySchema
  >((variables, opts) => api.get(TitleEndpoints.catalog(variables), opts)),
  list: toolbox.createMethod<TitlesListResponseSchema, void, void, TitleListQuerySchema>(
    (variables, opts) => api.get(TitleEndpoints.list(variables), opts)
  ),
  top: toolbox.createMethod<TopTitlesResponseSchema, void, void, TopTitleQuerySchema>(
    (variables, opts) => api.get(TitleEndpoints.Top.list(variables), opts)
  ),
  mostSearched: toolbox.createMethod<PopularTitlesResponseSchema, void, void, void>((_, opts) =>
    api.get(TitleEndpoints.mostSearched(), opts)
  ),
  search: toolbox.createMethod<SearchResponseSchema<SearchField>, void, void, SearchQuerySchema>(
    (variables, opts) => api.get(TitleEndpoints.search(variables), opts)
  ),
  slidersList: toolbox.createMethod<
    TitleSlidersListResponseSchema,
    void,
    void,
    TitleSlidersListQuerySchema
  >((variables, opts) => api.get(TitleEndpoints.Sliders.list(variables), opts)),
  slider: toolbox.createMethod<
    TitleSliderRetrieveResponseSchema,
    void,
    TitleSliderRetrieveParamsSchema,
    TitleSliderRetrieveQuerySchema
  >((variables, opts) => api.get(TitleEndpoints.Sliders.one(variables), opts)),
  setRating: toolbox.createMethod<void, SetRatingRequestSchema, void, void>((variables, opts) =>
    api.post(TitleEndpoints.setRating(), variables.data, opts)
  ),
  additional: toolbox.createMethod<
    TitleAdditionalResponseSchema,
    void,
    TitleRelationsListParamsSchema,
    void
  >((variables, opts) => api.get(TitleEndpoints.additional(variables), opts)),
  createAdditional: toolbox.createMethod<
    void,
    TitleAdditionalCreateRequestSchema,
    TitleRelationsListParamsSchema,
    void
  >((variables, opts) => api.post(TitleEndpoints.additional(variables), variables.data, opts)),
  updateAdditional: toolbox.createMethod<
    void,
    TitleAdditionalUpdateRequestSchema,
    TitleRelationsListParamsSchema,
    void
  >((variables, opts) => api.put(TitleEndpoints.additional(variables), variables.data, opts)),
  relations: toolbox.createMethod<
    TitleRelationsListResponseSchema,
    void,
    TitleRelationsListParamsSchema,
    void
  >((variables, opts) => api.get(TitleEndpoints.relations(variables), opts)),
  createRelations: toolbox.createMethod<
    void,
    TitleRelationsCreateSchema,
    TitleRelationsListParamsSchema,
    void
  >((variables, opts) => api.post(TitleEndpoints.relations(variables), variables.data, opts)),
  updateRelations: toolbox.createMethod<
    void,
    TitleRelationsUpdateSchema,
    TitleRelationsListParamsSchema,
    void
  >((variables, opts) => api.put(TitleEndpoints.relations(variables), variables.data, opts)),
  similarScore: toolbox.createMethod<void, ScoreSimilarTitlesRequestSchema, void, void>(
    (variables, opts) => api.post(TitleEndpoints.similarScore(variables), variables.data, opts)
  ),
  similar: toolbox.createMethod<
    SimilarTitlesPaginatedListResponseSchema,
    void,
    SimilarTitlesPaginatedListParamsSchema,
    SimilarTitlesPaginatedListQuerySchema
  >((variables, opts) => api.get(TitleEndpoints.similar(variables), opts)),
  addSimilar: toolbox.createMethod<
    void,
    AddSimilarTitleRequestSchema,
    AddSimilarTitleParamsSchema,
    void
  >((variables, opts) => api.post(TitleEndpoints.addSimilar(variables), variables.data, opts)),
  addToBookmarks: toolbox.createMethod<void, AddTitleToBookmarksRequestSchema, void, void>(
    (variables, opts) => api.post(TitleEndpoints.addToBookmarks({}), variables.data, opts)
  ),
  removeFromBookmarks: toolbox.createMethod<
    void,
    RemoveTitleFromBookmarksRequestSchema,
    void,
    void
  >((variables, opts) => api.delete(TitleEndpoints.removeFromBookmarks({}), variables.data, opts)),

  titleChapterActions: toolbox.createMethod<void, TitleChaptersActionsRequestSchema, void, void>(
    (variables, opts) =>
      api.put(TitleEndpoints.titleChaptersAction(variables), variables.data, opts)
  ),

  addTitleBundle: toolbox.createMethod<any, any, any, any>((variables, opts) =>
    api.post(TitleEndpoints.addBundleAction(variables), variables.data, opts)
  ),

  getTitleBundles: toolbox.createMethod<
    any,
    void,
    TitleBundlesParamsSchema,
    TitleBundlesQuerySchema
  >((variables, opts) => api.get(TitleEndpoints.getTitleBundles(variables), opts)),
  purchaseBundle: toolbox.createMethod<void, PurchaseBundleRequestSchema, void, void>(
    (variables, opts) => api.post(TitleEndpoints.purchaseBundle(variables), variables.data, opts)
  ),
  getTitleVoiceover: toolbox.createMethod<any, void, TitleVoiceoverParamsSchema, void>(
    (variables, opts) => api.get(TitleEndpoints.getVoiceover(variables), opts)
  ),
  getTitleAnime: toolbox.createMethod<any, void, TitleAnimeParamsSchema, void>((variables, opts) =>
    api.get(TitleEndpoints.getAnime(variables), opts)
  ),

  noteCreate: toolbox.createMethod<void, any, any, void>((variables, opts) =>
    api.put(TitleEndpoints.createNote(variables), variables.data, opts)
  ),
  getFilters: toolbox.createMethod<
    TitleFiltersRetrieveResponseSchema,
    void,
    TitleFiltersRetrieveParamsSchema,
    void
  >((variables, opts) => api.get(TitleEndpoints.filters(variables), opts)),
}));

export namespace TitleRepository {
  export const {
    relations,
    updateRelations,
    createRelations,
    additional,
    createAdditional,
    updateAdditional,
    similarScore,
    setRating,
    similar,
    addSimilar,
    titlesByQuery,
    search,
    slider,
    slidersList,
    one,
    create,
    update,
    list,
    mostSearched,
    top,
    addToBookmarks,
    removeFromBookmarks,
    purchaseBundle,
    titleChapterActions,
    getTitleBundles,
    getTitleVoiceover,
    getTitleAnime,
    getFilters,
    addTitleBundle,

    noteCreate,
  } = createTitleRouter({
    api,
  });
}
