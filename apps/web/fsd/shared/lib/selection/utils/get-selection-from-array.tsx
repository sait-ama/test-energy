import type { SelectionSchema } from '../_internal/types';

export const getSelectionFromArray = <T extends any[]>(array: T): SelectionSchema => ({
  include: new Set(array),
  exclude: new Set(),
  ids: array,
});
