import { SubscriptionKeys } from '~entities/subscription/model/api/query-keys';
import { SubscriptionRepository } from '~entities/subscription/model/api/repository';
import { useOptimisticMutation } from '~shared/api/react-query';

export const useRenewSubscriptionMutation = () =>
  useOptimisticMutation({
    invalidate: SubscriptionKeys.getSubscriptionInfo({}),
    mutationFn: SubscriptionRepository.renewSubscription,
  });
