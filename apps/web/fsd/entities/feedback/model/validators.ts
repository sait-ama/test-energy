import { z } from 'zod';

import { FeedBackType } from '~shared/api/models/feedback';

export const FeedbackFormValidator = z.object({
  topic: z.string(),
  type: z.nativeEnum(FeedBackType),
  description: z.string().optional(),
});

export type FeedbackFormSchema = z.infer<typeof FeedbackFormValidator>;
