import { DefaultError } from '@tanstack/query-core';

import { SubscriptionKeys } from '~entities/subscription/model/api/query-keys';
import { SubscriptionRepository } from '~entities/subscription/model/api/repository';
import {
  BuySubscriptionRequestSchema,
  BuySubscriptionResponseSchema,
} from '~shared/api/models/subscription';
import { useOptimisticMutation } from '~shared/api/react-query';

export const useBuySubscriptionMutation = () =>
  useOptimisticMutation<BuySubscriptionResponseSchema, DefaultError, BuySubscriptionRequestSchema>({
    invalidate: SubscriptionKeys.getSubscriptionInfo({}),
    mutationFn: (data) => SubscriptionRepository.buySubscription({ data }),
  });

export const useDeactivateSubscriptionMutation = () =>
  useOptimisticMutation({
    invalidate: SubscriptionKeys.getSubscriptionInfo({}),
    mutationFn: () => SubscriptionRepository.deactivateSubscription({}),
  });
