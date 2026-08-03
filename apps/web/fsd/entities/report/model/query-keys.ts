import type { GetReportReasonsQuerySchema } from '~shared/api/models/panel';
import { queryKit } from '~shared/api/react-query';

export namespace ReportKeys {
  export const reasons = queryKit.createQueryKey<void, GetReportReasonsQuerySchema>((variables) => [
    'report-reasons',
    variables,
  ]);
}
