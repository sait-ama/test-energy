import type { EndpointMeta } from '~shared/api/api-toolkit';
import type { LatestChaptersListQuerySchema } from '~shared/api/models/latest-chapter';
import { UrlBuilder } from '~shared/utils/url-formatter';

export namespace LatestChaptersEndpoints {
  export const list = (variables: EndpointMeta<void, LatestChaptersListQuerySchema>) =>
    new UrlBuilder(`/api/v2/titles/last-chapters/`).query(variables.query).build();
}
