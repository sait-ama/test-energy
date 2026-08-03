import { z } from 'zod';

import { Preference } from '~shared/api/models/user';

export const PreferenceValidator = z.object({
  preference: z.nativeEnum(Preference),
});

export type PreferenceSchema = z.infer<typeof PreferenceValidator>;
