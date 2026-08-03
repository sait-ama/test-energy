import type { EndpointMeta, ToolkitEndpointBuilder } from '~shared/api/api-toolkit';
import type {
  ActivityItemParamsSchema,
  ActivityPaginatedListQuerySchema,
  ActivityTargetQuerySchema,
  PublisherActivityPaginatedListParamsSchema,
  PublisherActivityPaginatedListQuerySchema,
  UserActivityPaginatedListParamsSchema,
  UserActivityPaginatedListQuerySchema,
} from '~shared/api/models/activity';
import { UrlBuilder } from '~shared/utils/url-formatter';

export namespace CommentsEndpoints {
  export const one: ToolkitEndpointBuilder<ActivityItemParamsSchema, void> = (variables) =>
    new UrlBuilder(`/api/v2/activity/comments/${variables.params!.commentId}/`).build();

  export const list = <T extends ActivityTargetQuerySchema>(
    variables: EndpointMeta<void, ActivityPaginatedListQuerySchema<T>>
  ) => new UrlBuilder(`/api/v2/activity/comments/`).query(variables.query).build();

  export const user: ToolkitEndpointBuilder<
    UserActivityPaginatedListParamsSchema,
    UserActivityPaginatedListQuerySchema
  > = (variables) =>
    new UrlBuilder(`/api/users/${variables.params!.user_id}/comments/`)
      .query(variables.query)
      .build();

  export const publisher: ToolkitEndpointBuilder<
    PublisherActivityPaginatedListParamsSchema,
    PublisherActivityPaginatedListQuerySchema
  > = (variables) =>
    new UrlBuilder(`/api/v2/publishers/${variables.params!.publisher_id}/comments/`)
      .query(variables.query)
      .build();

  export const send = list;
  export const edit = one;
  export const like = () => `/api/activity/votes/`;
  export const del = one;
  export const ban: ToolkitEndpointBuilder<ActivityItemParamsSchema, void> = (variables) =>
    `/api/v2/activity/comments/${variables.params!.commentId}/ban/`;
}
