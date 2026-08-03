import queryString from 'query-string';

import type { ToolkitEndpointBuilder } from '~shared/api/api-toolkit';
import type { FollowersPaginatedListQuerySchema } from '~shared/api/models/follower';
import type { UserSubscriptionsPaginatedListQuerySchema } from '~shared/api/models/user-subscriptions';
import { UrlBuilder } from '~shared/utils/url-formatter';

export const followersPaginatedList = (query: FollowersPaginatedListQuerySchema) =>
  `/api/v2/users/followers/?${queryString.stringify(query)}`;
export namespace SubsEndpoints {
  export namespace Followers {
    export const list: ToolkitEndpointBuilder<void, FollowersPaginatedListQuerySchema> = ({
      query,
    }) => new UrlBuilder('/api/v2/users/followers/').query(query).build();
  }
  export namespace Subscriptions {
    export const BASE = '/api/v2/users/subscribtion/';
    export const list: ToolkitEndpointBuilder<void, UserSubscriptionsPaginatedListQuerySchema> = ({
      query,
    }) => new UrlBuilder('/api/v2/users/subscribtions/').query(query).build();
  }
}
