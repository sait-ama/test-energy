import { z } from 'zod';

import { CreatorFormValidator } from '~features/creator-form/model/validators';

export const EditCreatorFormValidator = z.object({
  data: CreatorFormValidator,
  user_message: z.string().optional(),
});

export type EditCreatorFormSchema = z.infer<typeof EditCreatorFormValidator>;
