import { SubscriptionKeys } from '~entities/subscription/model/api/query-keys';
import { SubscriptionRepository } from '~entities/subscription/model/api/repository';
import type { EndpointMeta } from '~shared/api/api-toolkit';
import type { SubscriptionSchemaResponse } from '~shared/api/models/subscription';
import { queryKit } from '~shared/api/react-query';

export const { useQuery: useSubscriptionQuery, getKey: getSubscriptionKey } = queryKit.createQuery<
  EndpointMeta<void, void>,
  SubscriptionSchemaResponse
>(({ variables = {}, fetchOptions }) => ({
  queryKey: SubscriptionKeys.getSubscriptionInfo(variables),
  queryFn: () => SubscriptionRepository.getSubscription(variables, fetchOptions),
}));
