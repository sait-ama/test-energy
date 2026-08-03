import { V2UsersTicketsRetrieveData } from '@re/api/generated/types.gen';
import { parseAsInteger, parseAsNumberLiteral, parseAsStringEnum } from 'nuqs';

import { createQueryStoreWithOrdering } from '~shared/lib/ordering-store';

export type OrderField = 'sum' | 'sum_left' | 'date' | 'date_expire';

type Fields = NonNullable<NonNullable<V2UsersTicketsRetrieveData>['query']>;
type Query = Fields;
type OrderingValue = NonNullable<Query['ordering']>;

type DefaultQuery = Required<Pick<Query, 'ordering' | 'count' | 'page'>>;

const orderingValues: OrderingValue[] = [
  'sum',
  'sum_left',
  'date',
  'date_expire',
  '-sum',
  '-sum_left',
  '-date',
  '-date_expire',
];
const statuses = [1, 2, 3] as const;

export const useTicketsListQueryStore = createQueryStoreWithOrdering<
  Query,
  OrderingValue,
  DefaultQuery
>({
  prefix: 'ticket',
  defaultValues: { ordering: '-date', count: 20, page: 1 },
  parsers: {
    ordering: parseAsStringEnum(orderingValues).withDefault('-date'),
    page: parseAsInteger.withDefault(1),
    status: parseAsNumberLiteral(statuses),
    action_type: parseAsInteger,
    count: parseAsInteger.withDefault(20),
  },
  options: {
    removeDefaultsFromQuery: true,
  },
});
