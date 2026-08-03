import { z } from 'zod';

export const CreatorFormValidator = z.object({
  type: z.number(),
  name: z.string(),
  alt_name: z.string().optional(),
  description: z.string().optional(),
  cover: z.string().or(z.string().base64()),
  country: z.number(),
});
