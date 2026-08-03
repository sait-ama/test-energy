export enum FeedBackType {
  GoodFeedback = 'positive_comment',
  BadFeedback = 'negative_comment',
  Bugs = 'bugs',
  Ideas = 'advice',
  EndSubscription = 'sub_cancell_reason',
}

export interface CreateFeedbackRequestSchema {
  topic: string;
  type: FeedBackType;
  description?: string;
}

export type CreateFeedbackResponseSchema = void;
