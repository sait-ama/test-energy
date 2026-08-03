import { z } from 'zod';

import { CharacterFormValidator } from '~entities/character/model/validators';

export const EditCharacterFormValidator = z.object({
  data: CharacterFormValidator,
  user_message: z.string().optional(),
});

export type EditCharacterFormSchema = z.infer<typeof EditCharacterFormValidator>;
