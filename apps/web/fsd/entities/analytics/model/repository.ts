import { AnalyticsEndpoints } from '~entities/analytics/model/endpoints';
import { api } from '~shared/api/$api';
import { apiToolkit } from '~shared/api/api-toolkit';
import type {
  CreateAdvertisementActionRequestSchema,
  CreateAdvertisementActionResponseSchema,
  SaveUserUrchinTrackingModuleRequestSchema,
  SaveUserUrchinTrackingModuleResponseSchema,
} from '~shared/api/models/analytics';

export const createAnalyticsRouter = apiToolkit(({ api, toolbox }) => ({
  saveUserUrchinTrackingModule: toolbox.createMethod<
    SaveUserUrchinTrackingModuleResponseSchema,
    SaveUserUrchinTrackingModuleRequestSchema,
    void,
    void
  >((variables, opts) =>
    api.post(AnalyticsEndpoints.saveUserUrchinTrackingModule({}), variables.data, opts)
  ),
  savePromoAction: toolbox.createMethod<
    CreateAdvertisementActionResponseSchema,
    CreateAdvertisementActionRequestSchema,
    void,
    void
  >((variables, opts) =>
    api.post(AnalyticsEndpoints.savePromoAction(variables), variables.data, opts)
  ),
}));

export namespace AnalyticsRepository {
  export const { saveUserUrchinTrackingModule, savePromoAction } = createAnalyticsRouter({ api });
}
