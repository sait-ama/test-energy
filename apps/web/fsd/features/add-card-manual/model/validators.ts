import { z } from 'zod';

import { HeroCardRank } from '~shared/api/models/inventory';

export const CreateInventoryCardSchema = z.object({
  title: z.number().optional(),
  description: z.string().optional(),
  rank: z.nativeEnum(HeroCardRank),
  character: z.number(),
  cover: z.string(),
  user_message: z.string().optional(),
});

export type CreateInventoryCardFormSchema = z.infer<typeof CreateInventoryCardSchema>;
