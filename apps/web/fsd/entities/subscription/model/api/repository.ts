import { SubscriptionEndpoints } from '~entities/subscription/model/api/endpoints';
import { api } from '~shared/api/$api';
import { apiToolkit } from '~shared/api/api-toolkit';
import {
  BuySubscriptionRequestSchema,
  BuySubscriptionResponseSchema,
  SubscriptionSchemaResponse,
} from '~shared/api/models/subscription';

const createSubscriptionRouter = apiToolkit(({ api, toolbox }) => ({
  getSubscription: toolbox.createMethod<SubscriptionSchemaResponse, void, void, void>(
    (variables, opts) => api.get(SubscriptionEndpoints.getSubscriptionInfo(variables), opts)
  ),
  buySubscription: toolbox.createMethod<
    BuySubscriptionResponseSchema,
    BuySubscriptionRequestSchema,
    void,
    void
  >((variables, opts) =>
    api.post(SubscriptionEndpoints.buySubscription(variables), variables.data, opts)
  ),
  deactivateSubscription: toolbox.createMethod<void, void, void, void>((variables, opts) =>
    api.put(SubscriptionEndpoints.deactivateSubscription(variables), { is_renew: 0 }, opts)
  ),
  renewSubscription: toolbox.createMethod<void, { is_renew: boolean }, void, void>(
    (variables, opts) =>
      api.put(
        SubscriptionEndpoints.renewSubscription(variables),
        { is_renew: variables?.data?.is_renew },
        opts
      )
  ),
}));

export namespace SubscriptionRepository {
  export const { getSubscription, deactivateSubscription, buySubscription, renewSubscription } =
    createSubscriptionRouter({ api });
}
