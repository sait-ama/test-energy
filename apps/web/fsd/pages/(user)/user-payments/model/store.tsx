import { UserPaymentListData } from '@re/api/generated/types.gen';
import { createContext } from '@re/core/utils/create-context';
import { useQuery } from '@tanstack/react-query';
import { parseAsInteger, parseAsNumberLiteral, parseAsStringEnum } from 'nuqs';

import { FormsTypes } from '~shared/api/models/forms';
import {
  createQueryStoreWithOrdering,
  QueryStoreConfigWithOrdering,
} from '~shared/lib/ordering-store';
import { getTypesBaseKey } from '~shared/lib/use-types-base';

type Fields = NonNullable<NonNullable<UserPaymentListData>['query']>;

export type Query = Fields & { status?: 0 | 1 | 2 | null };
export type OrderingValue = NonNullable<Query['ordering']>;
export type OrderField = 'id' | 'date' | 'status';

type DefaultQuery = Required<Pick<Query, 'ordering' | 'count' | 'page'>>;
const orderings: OrderingValue[] = ['id', '-id', '-date', 'date', '-status', 'status'];
const getStore = createQueryStoreWithOrdering<Query, OrderingValue, DefaultQuery>({
  defaultValues: { ordering: '-date', count: 20, page: 1 },
  prefix: 'coins',
  parsers: {
    count: parseAsInteger,
    page: parseAsInteger,
    type: parseAsInteger,
    ordering: parseAsStringEnum(orderings).withDefault('-date'),
  },
});
export const {
  useStore: usePaymentsCoinsListQueryStore,
  Provider: PaymentsCoinsListQueryProvider,
} = createContext<
  ReturnType<ReturnType<typeof createQueryStoreWithOrdering<Query, OrderingValue, DefaultQuery>>>,
  Partial<QueryStoreConfigWithOrdering<Query, OrderingValue, DefaultQuery>>
>((params) => {
  const { data: { statuses = [], types = [] } = {} } = useQuery({
    ...getTypesBaseKey({
      type: FormsTypes.MONEY_PAYMENTS,
      get: ['type', 'status'],
    }),
    select: (v) => {
      return {
        types: v?.content?.type?.map?.((v) => Number(v.id)),
        statuses: v?.content?.status?.map?.((v) => Number(v.id)),
      };
    },
  });
  return getStore({
    parsers: {
      type: !types.length ? parseAsInteger : parseAsNumberLiteral(types),
      // @ts-expect-error //todo сделать возможным прокидывать более общие парсеры через ts, parser<1|2>-> parser<number>
      status: !statuses.length ? parseAsInteger : parseAsNumberLiteral(statuses),
      ...(params?.parsers ?? {}),
    },
  });
});
