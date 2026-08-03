import { FeedbackEndpoints } from '~entities/feedback/model/endpoints';
import { api } from '~shared/api/$api';
import { apiToolkit } from '~shared/api/api-toolkit';
import type {
  CreateFeedbackRequestSchema,
  CreateFeedbackResponseSchema,
} from '~shared/api/models/feedback';

const createFeedbackRouter = apiToolkit(({ api, toolbox }) => ({
  createFeedback: toolbox.createMethod<
    CreateFeedbackResponseSchema,
    CreateFeedbackRequestSchema,
    void,
    void
  >((variables, opts) => api.post(FeedbackEndpoints.feedback({}), variables.data, opts)),
}));

export namespace FeedbackRepository {
  export const { createFeedback } = createFeedbackRouter({ api });
}
