import { z } from 'zod';

export const AppereanceValidator = z.object({
  theme: z.string(),
  show_comments: z.string(),
});

export type AppereanceSchema = z.infer<typeof AppereanceValidator>;
