import type { ToolkitEndpointBuilder } from '~shared/api/api-toolkit';

export namespace FeedbackEndpoints {
  export const feedback: ToolkitEndpointBuilder<void, void> = () => '/api/v2/panel/feedbacks/send/';
}
