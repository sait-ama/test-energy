import { z } from 'zod';

export const MomentFormValidator = z.object({
  image: z.string(),
  title: z.number(),
  chapter: z.number(),
  author: z.number(),
  is_spoiler: z.boolean(),
  description: z.string(),
  tags: z.array(z.number()),
});

export type MomentFormSchema = z.infer<typeof MomentFormValidator>;
