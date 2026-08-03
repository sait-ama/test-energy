import { z } from 'zod';

export const ReportValidator = z.object({
  reason: z.string(),
  message: z.string(),
});

export type ReportSchema = z.infer<typeof ReportValidator>;
