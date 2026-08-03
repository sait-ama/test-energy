import { z } from 'zod';

import { CharacterFormValidator } from '~entities/character/model/validators';

export const CreateCharacterFormValidator = z.object({
  data: CharacterFormValidator,
  user_message: z.string().optional(),
});

export type CreateCharacterFormSchema = z.infer<typeof CreateCharacterFormValidator>;
