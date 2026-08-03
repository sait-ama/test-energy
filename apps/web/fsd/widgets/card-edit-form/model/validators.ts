import { z } from 'zod';

import { HeroCardRank } from '~shared/api/models/inventory';

export const EditInventoryCardSchemaBuilder = (options: { is_staff?: boolean }) =>
  z.object({
    description: z.string().optional(),
    rank: z.nativeEnum(HeroCardRank),
    character: z.any().refine(
      (value) => {
        return options.is_staff ? true : !!value;
      },
      { message: 'Обязательное поле' }
    ),
    cover: z.string(),
    user_message: z.string().optional(),
  });

export type EditInventoryCardFormSchema = z.infer<
  ReturnType<typeof EditInventoryCardSchemaBuilder>
>;
