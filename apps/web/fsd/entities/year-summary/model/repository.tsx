import { api } from '~shared/api/$api';
import { apiToolkit } from '~shared/api/api-toolkit';
import type {
  YearSummaryAllRetrieveResponseSchema,
  YearSummaryByUserRetrieveParamsSchema,
  YearSummaryByUserRetrieveResponseSchema,
} from '~shared/api/models/year-summary';

import { YearSummaryEndpoints } from './endpoints';

const createYearSummaryRouter = apiToolkit(({ api, toolbox }) => ({
  getByUser: toolbox.createMethod<
    YearSummaryByUserRetrieveResponseSchema,
    void,
    YearSummaryByUserRetrieveParamsSchema,
    void
  >((variables, options) => api.get(YearSummaryEndpoints.byUser(variables), options)),
  getAll: toolbox.createMethod<YearSummaryAllRetrieveResponseSchema, void, void, void>(
    (variables, options) => api.get(YearSummaryEndpoints.all(variables), options)
  ),
}));

export namespace YearSummaryRepository {
  export const { getByUser, getAll } = createYearSummaryRouter({ api });
}
