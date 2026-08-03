import { api } from '~shared/api/$api';
import { apiToolkit } from '~shared/api/api-toolkit';
import type {
  BuyChapterRequestSchema,
  ChapterLikeRequestSchema,
  ChapterRetrieveLastQuerySchema,
  ChapterRetrieveParamsSchema,
  ChapterRetrieveResponseSchema,
  ChaptersPaginatedListQuerySchema,
  ChaptersPaginatedListResponseSchema,
  ChapterUnviewMultipleRequestSchema,
  ChapterViewMultipleRequestSchema,
  ChapterViewRequestSchema,
} from '~shared/api/models/chapter';

import { ChapterEndpoints } from './endpoints';
import type { XhrOptions } from './utils';
import { xhr } from './utils';

const createChapterRouter = apiToolkit(({ api, toolbox }) => ({
  view: toolbox.createMethod<void, ChapterViewRequestSchema, void, void>((variables, options) =>
    api.post(ChapterEndpoints.view(), variables.data, options)
  ),
  list: toolbox.createMethod<
    ChaptersPaginatedListResponseSchema,
    void,
    void,
    ChaptersPaginatedListQuerySchema
  >((variables, options) => api.get(ChapterEndpoints.list(variables), options)),
  like: toolbox.createMethod<void, ChapterLikeRequestSchema, void, void>((variables, options) =>
    api.post(ChapterEndpoints.like(), variables.data, options)
  ),
  viewMultiple: toolbox.createMethod<void, ChapterViewMultipleRequestSchema, void, void>(
    (variables, options) => api.post(ChapterEndpoints.view(), variables.data, options)
  ),
  unviewMultiple: toolbox.createMethod<void, ChapterUnviewMultipleRequestSchema, void, void>(
    (variables, options) => api.delete(ChapterEndpoints.view(), variables.data, options)
  ),
  get: toolbox.createMethod<ChapterRetrieveResponseSchema, void, ChapterRetrieveParamsSchema, void>(
    (variables, options) => api.get(ChapterEndpoints.get(variables), options)
  ),
  buy: toolbox.createMethod<void, BuyChapterRequestSchema, void, void>((variables, options) =>
    api.post(ChapterEndpoints.buy(), variables.data, options)
  ),
  getLast: toolbox.createMethod<
    ChapterRetrieveResponseSchema,
    ChapterRetrieveParamsSchema,
    void,
    ChapterRetrieveLastQuerySchema
  >(async (variables, options) => {
    const [lastPublished, lastUnpublished] = (
      await Promise.all([
        api.get(
          ChapterEndpoints.main({
            query: {
              branch_id: variables.query?.branch_id,
              ordering: '-index',
              count: 1,
              detail: 1,
              page: 1,
              is_published: 1,
            },
          }),
          options
        ),
        api.get(
          ChapterEndpoints.main({
            query: {
              branch_id: variables.query?.branch_id,
              ordering: '-index',
              count: 1,
              detail: 1,
              page: 1,
              is_published: 0,
            },
          }),
          options
        ),
      ])
    ).map((v) => v.results?.[0]);

    return lastUnpublished ?? lastPublished ?? null;
  }),
  add: toolbox.createMethod((variables, options: XhrOptions['options']) => {
    const { data } = variables;

    const formData = new FormData();

    for (const key of Object.keys(data)) {
      const value = data[key];
      formData.append(key, value);
    }

    return xhr({ method: 'POST', url: ChapterEndpoints.add(), data: formData, options });
  }),
  edit: toolbox.createMethod((variables, options: XhrOptions['options']) => {
    const { data } = variables;

    const formData = new FormData();

    for (const key of Object.keys(data)) {
      const value = data[key];
      formData.append(key, value);
    }

    const requestData = formData;

    return xhr({
      method: 'PUT',
      url: ChapterEndpoints.edit(variables),
      data: requestData,
      ...options,
    });
  }),
}));

export namespace ChapterRepository {
  export const { add, edit, view, buy, get, getLast, list, like, viewMultiple, unviewMultiple } =
    createChapterRouter({ api });
}
