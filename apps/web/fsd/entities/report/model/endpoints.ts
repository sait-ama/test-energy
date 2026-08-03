import type { ToolkitEndpointBuilder } from '~shared/api/api-toolkit';
import type { GetReportReasonsQuerySchema } from '~shared/api/models/panel';
import { UrlBuilder } from '~shared/utils/url-formatter';

export namespace ReportEndpoints {
  export const getReasons: ToolkitEndpointBuilder<void, GetReportReasonsQuerySchema> = ({
    query,
  }) => new UrlBuilder(`/api/v2/panel/reports/send/`).query(query).build();
  export const send: ToolkitEndpointBuilder<void, void> = () =>
    new UrlBuilder(`/api/v2/panel/reports/send/`).build();
}
