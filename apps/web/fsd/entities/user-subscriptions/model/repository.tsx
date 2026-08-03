import * as UserSubscriptionsEndpoints from '~entities/user-subscriptions/model/endpoints';
import { SubsEndpoints } from '~entities/user-subscriptions/model/endpoints';
import { api } from '~shared/api/$api';
import { apiToolkit } from '~shared/api/api-toolkit';
import type {
  FollowersPaginatedListQuerySchema,
  FollowersPaginatedListResponseSchema,
} from '~shared/api/models/follower';
import type {
  UpdateSubscriptionRequestSchema,
  UpdateSubscriptionResponseSchema,
  UserSubscriptionsPaginatedListQuerySchema,
  UserSubscriptionsPaginatedListResponseSchema,
} from '~shared/api/models/user-subscriptions';

const createSubscriptionsRouter = apiToolkit(({ api, toolbox }) => ({
  getSubscriptionsPaginatedList: toolbox.createMethod<
    UserSubscriptionsPaginatedListResponseSchema,
    void,
    void,
    UserSubscriptionsPaginatedListQuerySchema
  >((variables, opts) => api.get(SubsEndpoints.Subscriptions.list(variables), opts)),
  changeSubscription: toolbox.createMethod<
    UpdateSubscriptionResponseSchema,
    UpdateSubscriptionRequestSchema,
    void,
    void
  >(({ data }) => api.put(SubsEndpoints.Subscriptions.BASE, data)),
  getFollowersPaginatedList: toolbox.createMethod<
    FollowersPaginatedListResponseSchema,
    void,
    void,
    FollowersPaginatedListQuerySchema
  >((variables, opts) => api.get(SubsEndpoints.Followers.list(variables), opts)),
}));

const router = createSubscriptionsRouter({ api });
export namespace UserSubscriptionRepository {
  export namespace Subscriptions {
    export const changeSubs = router.changeSubscription;
    export const list = router.getSubscriptionsPaginatedList;
  }
  export namespace Followers {
    export const list = router.getFollowersPaginatedList;
  }
}
export const getFollowersPaginatedList = async (query: FollowersPaginatedListQuerySchema) =>
  api.get<FollowersPaginatedListResponseSchema>(
    UserSubscriptionsEndpoints.followersPaginatedList(query)
  );
