import { toArray } from '~shared/utils/to-array';
import { UrlBuilder } from '~shared/utils/url-formatter';

export type NormalizedParamSchema<T extends 'single' | 'multi' = 'single' | 'multi'> = {
  key: string;
  value: T extends 'single' ? string | number : (string | number)[];
  type: T;
};

export const createNormalizedParams = (
  slug: string | string[] | null | undefined, // nextjs slug
  schemas: Omit<NormalizedParamSchema, 'value'>[]
) => {
  if (!slug) return {};

  const array = toArray(slug).map((v) => decodeURIComponent(v));

  const paramsObj: Record<string, string | string[]> = {};

  for (let i = 0; i < array.length; i = i + 2) {
    const key = array[i];
    const value = array[i + 1];

    const schema = schemas.find((item) => item.key === key);

    if (!key || !value || !schema) continue;

    if (schema.type === 'single') {
      paramsObj[key] = value;
    } else {
      paramsObj[key] = value.split(',');
    }
  }

  return paramsObj;
};

export type CreateNormalizedSegmentFromObjectOptions = Omit<NormalizedParamSchema, 'type'>[];

export const createNormalizedPath = (valuesArr: CreateNormalizedSegmentFromObjectOptions) => {
  let url = new UrlBuilder('');

  valuesArr
    .filter((item) => (Array.isArray(item.value) ? !!item.value.length : !!item.value))
    .sort((a, b) => a.key.localeCompare(b.key, undefined, { sensitivity: 'base' }))
    .forEach((obj) => {
      const resolvedValue = [...toArray(obj.value)];
      url = url.add(
        `/${obj.key}/${resolvedValue.sort((a, b) => String(a).localeCompare(String(b), undefined, { sensitivity: 'base' })).join(',')}`
      );
    });

  return url.build();
};

// export const parseParamsFromUrl = <T,>(url: string): T => {};
