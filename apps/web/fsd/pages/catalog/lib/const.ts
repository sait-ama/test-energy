import { NormalizedParamSchema } from '~shared/lib/routing/normalization';

export const PATH_NORMALIZATION_SCHEMA: Omit<NormalizedParamSchema, 'value'>[] = [
  { key: 'genres', type: 'multi' },
  { key: 'categories', type: 'multi' },
];
