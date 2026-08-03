import { api } from '~shared/api/$api';
import { apiToolkit } from '~shared/api/api-toolkit';
import type {
  CreateReportRequestSchema,
  CreateReportResponseSchema,
  GetReportReasonsQuerySchema,
  GetReportReasonsResponseSchema,
} from '~shared/api/models/panel';

import { ReportEndpoints } from './endpoints';

export const createReportRepository = apiToolkit(({ api, toolbox }) => ({
  getReasons: toolbox.createMethod<
    GetReportReasonsResponseSchema,
    void,
    void,
    GetReportReasonsQuerySchema
  >((variables, opts) => api.get(ReportEndpoints.getReasons(variables), opts)),
  send: toolbox.createMethod<CreateReportResponseSchema, CreateReportRequestSchema, void, void>(
    (variables, opts) => api.post(ReportEndpoints.send({}), variables.data, opts)
  ),
}));

export namespace ReportRepository {
  export const { getReasons, send } = createReportRepository({ api });
}
