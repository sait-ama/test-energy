import type { EndpointMeta } from '~shared/api/api-toolkit';
import type {
  YearSummaryAllRetrieveResponseSchema,
  YearSummaryByUserRetrieveParamsSchema,
  YearSummaryByUserRetrieveResponseSchema,
} from '~shared/api/models/year-summary';
import { queryKit } from '~shared/api/react-query';

import { YearSummaryKeys } from './query-keys';
import { YearSummaryRepository } from './repository';

export const { useQuery: useYearSummaryByUser, getKey: getYearSummaryByUserKey } =
  queryKit.createQuery<
    EndpointMeta<YearSummaryByUserRetrieveParamsSchema, void>,
    YearSummaryByUserRetrieveResponseSchema
  >(({ variables, fetchOptions }) => ({
    queryKey: YearSummaryKeys.byUser(variables),
    queryFn: () => YearSummaryRepository.getByUser(variables, fetchOptions),
  }));

export const { useQuery: useYearSummaryAll, getKey: getYearSummaryAllKey } = queryKit.createQuery<
  EndpointMeta<void, void>,
  YearSummaryAllRetrieveResponseSchema
>(({ variables, fetchOptions }) => ({
  queryKey: YearSummaryKeys.all(variables),
  queryFn: () => YearSummaryRepository.getAll(variables, fetchOptions),
}));
