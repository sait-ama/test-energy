import { z } from 'zod';

export const EmailChangeValidator = z.object({
  email: z.string().email(),
});

export type EmailChangeSchema = z.infer<typeof EmailChangeValidator>;
