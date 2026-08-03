import { z } from 'zod';

import { BaseTitleValidator } from '~features/title-form/model/validators';

export const CreateTitleValidator = BaseTitleValidator.and(
  z.object({
    publishers: z.object({
      branch_id: z.literal(-1),
      publishers: z.array(z.number()).min(1),
      user_message: z.string().optional(),
    }),
  })
);

export type CreateTitleSchema = z.infer<typeof CreateTitleValidator>;
