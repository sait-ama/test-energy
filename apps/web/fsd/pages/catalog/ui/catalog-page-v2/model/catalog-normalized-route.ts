import omit from 'lodash.omit';

import { PATH_NORMALIZATION_SCHEMA } from '~pages/catalog/lib/const';
import { TitleFiltersRetrieveResponseSchema } from '~shared/api/models/title';
import { FiltersState } from '~shared/lib/filters';
import { createNormalizedPath, NormalizedParamSchema } from '~shared/lib/routing/normalization';
import { SingleOrMulti } from '~shared/utils/single-or-multi';
import { valueIs } from '~shared/utils/valueIs';

import { TitleFiltersSchema } from '../features/title-filters/model/schema';

export type BulkFiltersDataById = Record<
  string,
  Record<number | string, TitleFiltersRetrieveResponseSchema[number]>
>;

export type BulkFiltersDataByDir = Record<
  string,
  Record<string, TitleFiltersRetrieveResponseSchema[number]>
>;

export type MatchCatalogNormalizedParamsReturn = (Pick<NormalizedParamSchema, 'key' | 'type'> & {
  value: number | string | (number | string)[];
})[];

const transformFilterValue = (
  dirOrId: NumberIsomorphic,
  key: string,
  data: BulkFiltersDataById
) => {
  const transformedValue = data[key]?.[dirOrId]?.dir || dirOrId;
  return transformedValue ? String(transformedValue) : transformedValue;
};

const processFilterParam = <T extends unknown | unknown[] = unknown | unknown[]>(
  key: string,
  valueOrArr: T,
  data: BulkFiltersDataById
) => {
  const normalizationSchema = PATH_NORMALIZATION_SCHEMA.find((item) => item.key === key);
  if (!normalizationSchema) return null;

  const processedValues = new SingleOrMulti<T>(valueOrArr)
    .transform((dirOrId) => transformFilterValue(dirOrId, key, data))
    .filter((value) => !!value);

  if (processedValues.isEmpty()) return null;
  if (valueIs<null | null[]>(processedValues.value, false)) return null;

  return {
    key,
    value: processedValues.value,
    type: normalizationSchema.type,
  };
};

export const matchCatalogNormalizedParams = (
  filterParams: Partial<FiltersState<TitleFiltersSchema>>,
  bulkData: BulkFiltersDataById = {}
): MatchCatalogNormalizedParamsReturn => {
  const normalizedParams: {
    key: string;
    value: NumberIsomorphic | NumberIsomorphic[];
    type: 'single' | 'multi';
  }[] = [];

  for (const [paramKey, { value: paramValue }] of Object.entries(filterParams)) {
    const processedParam = processFilterParam(paramKey, paramValue, bulkData);

    if (processedParam) {
      normalizedParams.push(processedParam);
    }
  }

  return normalizedParams;
};

export const createPath = (normalizedParams: NormalizedParamSchema[] | null | undefined) => {
  return normalizedParams ? createNormalizedPath(normalizedParams) : '';
};

export const createQueryParams = (filterParams: Partial<FiltersState<TitleFiltersSchema>>) => {
  const excludedKeys = PATH_NORMALIZATION_SCHEMA.map((schema) => schema.key) ?? [];
  return omit(filterParams, excludedKeys);
};

export const createNormalizedRoute = (
  filterParams: Partial<FiltersState<TitleFiltersSchema>>,
  bulkData: BulkFiltersDataById = {}
) => {
  const normalizedParams = matchCatalogNormalizedParams(filterParams, bulkData) || null;
  const normalizedPath = createPath(normalizedParams);
  const queryParams = createQueryParams(filterParams);

  return {
    normalizedPath,
    queryParams,
  };
};
