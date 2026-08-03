import { ReportKeys } from '~entities/report/model/query-keys';
import type { EndpointMeta } from '~shared/api/api-toolkit';
import type { Type } from '~shared/api/models/forms';
import type { GetReportReasonsQuerySchema } from '~shared/api/models/panel';
import { queryKit } from '~shared/api/react-query';

import { ReportRepository } from './repository';

interface Reason extends Type {
  description?: string;
}

export const { useQuery: useReportReasons } = queryKit.createSuspenseQuery<
  EndpointMeta<void, GetReportReasonsQuerySchema>,
  Reason[]
>(({ variables }) => ({
  queryKey: ReportKeys.reasons(variables),
  staleTime: Infinity,
  retry: false,
  queryFn: () => ReportRepository.getReasons(variables),
}));
