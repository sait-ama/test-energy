import omit from 'lodash.omit';

import { PATH_NORMALIZATION_SCHEMA } from '~pages/catalog/lib/const';
import { TitleFiltersRetrieveResponseSchema } from '~shared/api/models/title';
import { createNormalizedPath, NormalizedParamSchema } from '~shared/lib/routing/normalization';
import { SingleOrMulti } from '~shared/utils/single-or-multi';
import { valueIs } from '~shared/utils/valueIs';

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

export const matchCatalogNormalizedParams = (
  params: Record<string, string | string[]>,
  data: BulkFiltersDataById = {}
): MatchCatalogNormalizedParamsReturn => {
  const result = [];

  for (const [key, valueOrArr] of Object.entries(params)) {
    const schema = PATH_NORMALIZATION_SCHEMA.find((item) => item.key === key);
    if (!schema) continue;

    const singleOrMulti = new SingleOrMulti(valueOrArr)
      .transform((dirOrId) => {
        // if has dir, get id or keep id as value
        const v = data[key]?.[dirOrId]?.dir || dirOrId;

        return v ? String(v) : v;
      })
      .filter((v) => !!v);

    if (singleOrMulti.isEmpty()) continue;
    if (valueIs<null | null[]>(singleOrMulti.value, false)) continue;

    result.push({
      key,
      value: singleOrMulti.value,
      type: schema.type,
    });
  }

  return result;
};

export const createPath = (normalizedParams: NormalizedParamSchema[] | null | undefined) => {
  return normalizedParams ? createNormalizedPath(normalizedParams) : '';
};

export const createSearchParams = (params: Record<string, string | string[]>) => {
  return omit(params, PATH_NORMALIZATION_SCHEMA.map((v) => v.key) ?? []);
};

export const createNormalizedRoute = (
  params: Record<string, string | string[]>,
  data: BulkFiltersDataById = {}
) => {
  const normalizedParams = matchCatalogNormalizedParams(params, data) || null;

  const normalizedPath = createPath(normalizedParams);

  const searchParams = Object.fromEntries(
    Object.entries(createSearchParams(params))
      .map(([key, value]) => (value ? [key, value] : undefined))
      .filter((v) => v !== undefined)
  );

  return { normalizedPath, searchParams };
};
