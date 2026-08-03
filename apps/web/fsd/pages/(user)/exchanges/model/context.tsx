import { createContext } from '@re/core/utils/create-context';

import { useQueryState } from '~shared/hooks/use-query-state';

export enum ExchangeOrdering {
  ID = 'id',
  ID_DESC = '-id',
}

export enum ExchangeStatus {
  WAIT = 'wait',
  ACCEPTED = 'accepted',
  DENIED = 'denied',
  ALL = 'all',
}

export const { Provider: ExchangeListQueryProvider, useStore: useExchangeListQuery } =
  createContext(() => {
    const [status, setStatus] = useQueryState<ExchangeStatus>({
      key: 'status',
      initialValue: ExchangeStatus.ALL,
    });
    const [ordering, setOrdering] = useQueryState<ExchangeOrdering>({
      key: 'query',
      initialValue: ExchangeOrdering.ID_DESC,
    });

    return {
      status: status as ExchangeStatus,
      ordering: ordering as ExchangeOrdering,
      setStatus,
      setOrdering,
    };
  });
