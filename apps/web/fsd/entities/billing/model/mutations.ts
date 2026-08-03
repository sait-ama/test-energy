import type { DefaultError } from '@tanstack/query-core';

import { v2UsersCurrentRetrieveQueryKey } from '@re/api/generated/@tanstack/react-query.gen';

import { BillingRepository } from '~entities/billing/model/repository';
import type {
  CreateChargeRequestSchema,
  CreateChargeResponseSchema,
  CurrencyExchangeRequestSchema,
  DonateRequestSchema,
} from '~shared/api/models/billing';
import { queryClient, useOptimisticMutation } from '~shared/api/react-query';

export const useCreateCharge = () =>
  useOptimisticMutation<CreateChargeResponseSchema, DefaultError, CreateChargeRequestSchema>({
    mutationFn: (data) => BillingRepository.createCharge({ data }),
  });

export const useExchangeCoins = () =>
  useOptimisticMutation<void, DefaultError, CurrencyExchangeRequestSchema>({
    mutationFn: (data) => BillingRepository.coinsExchange({ data }),
    onSuccess: async () => {
      await queryClient.refetchQueries({
        predicate: ({ queryKey }) =>
          queryKey?.[0]?._id === v2UsersCurrentRetrieveQueryKey({})[0]?._id,
      });
    },
  });

export const usePublisherDonate = () =>
  useOptimisticMutation<void, DefaultError, DonateRequestSchema>({
    mutationFn: (data) => BillingRepository.donate({ data }),
    onSuccess: async () => {
      await queryClient.refetchQueries({
        predicate: ({ queryKey }) =>
          queryKey?.[0]?._id === v2UsersCurrentRetrieveQueryKey({})[0]?._id,
      });
    },
  });
