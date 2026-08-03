import type { ResponseResults } from '~shared/types/buisines';

export interface TopTabSchemaFragment {
  id: NumberIsomorphic;
  label: string;
  dir: string;
}

export interface TopTabsResponseSchema extends ResponseResults<TopTabSchemaFragment[]> {}
