import type { ToolkitEndpointBuilder } from '~shared/api/api-toolkit';
import type { ChaptersPaginatedListQuerySchema } from '~shared/api/models/chapter';
import { UrlBuilder } from '~shared/utils/url-formatter';

export namespace ChapterEndpoints {
  export const view = () => new UrlBuilder(`/api/activity/views/`).build();
  export const add = () => new UrlBuilder(`/api/v2/titles/chapters/`).build();
  export const buy = () => new UrlBuilder(`/api/billing/buy-chapter/`).build();
  export const edit = (variables) =>
    new UrlBuilder(`/api/v2/titles/chapters/${variables?.params?.chapter}/`).build();
  export const get = (variables) =>
    new UrlBuilder(`/api/v2/titles/chapters/${variables?.params?.chapter}/`).build();
  export const main = (variables) =>
    new UrlBuilder(`/api/v2/titles/chapters/`).query(variables.query).build();
  export const like = () => new UrlBuilder(`/api/activity/votes/`).build();
  export const list: ToolkitEndpointBuilder<void, ChaptersPaginatedListQuerySchema> = ({ query }) =>
    new UrlBuilder(`/api/v2/titles/chapters/`).query(query).build();
}
