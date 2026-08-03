import type { ToolkitEndpointBuilder } from '~shared/api/api-toolkit';
import type { YearSummaryByUserRetrieveParamsSchema } from '~shared/api/models/year-summary';
import { UrlBuilder } from '~shared/utils/url-formatter';

export namespace YearSummaryEndpoints {
  export const byUser: ToolkitEndpointBuilder<YearSummaryByUserRetrieveParamsSchema, void> = ({
    params,
    query,
  }) => new UrlBuilder(`/api/v2/users/${params?.userId}/results/`).query(query).build();
  export const all: ToolkitEndpointBuilder<void, void> = () =>
    new UrlBuilder(`/api/v2/users/results/`).build();
}
