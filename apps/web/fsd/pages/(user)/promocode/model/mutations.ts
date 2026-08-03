import { useMutation } from '@tanstack/react-query';

import {
  billingPromoCodesCreateMutation,
  v2UsersTicketsRetrieveInfiniteQueryKey,
} from '@re/api/generated/@tanstack/react-query.gen';

import { client } from '~shared/api/client';
import { getQueryClient } from '~shared/api/react-query';

export const useBillingPromoCodesCreateMutation = () => {
  return useMutation({
    ...billingPromoCodesCreateMutation({ client }),
    onSuccess: async () => {
      await getQueryClient().refetchQueries({
        fetchStatus: 'idle',
        type: 'all',
        queryKey: v2UsersTicketsRetrieveInfiniteQueryKey({ client }),
        exact: false,
      });
    },
  });
};
