import type { ALL_ALIAS } from './const';

export type SelectionSchema<T = any> = {
  include: typeof ALL_ALIAS | Set<T>;
  exclude: Set<T>;
  ids: T[];
};
