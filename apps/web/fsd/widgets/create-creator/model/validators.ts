import { z } from 'zod';

import { CreatorFormValidator } from '~features/creator-form/model/validators';

export const CreateCreatorValidator = z.object({
  data: CreatorFormValidator,
  user_message: z.string().optional(),
});

export type CreateCreatorSchema = z.infer<typeof CreateCreatorValidator>;
