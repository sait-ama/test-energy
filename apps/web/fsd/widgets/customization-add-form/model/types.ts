import type { z } from 'zod';

import type { CustomizationFormValidator } from '~widgets/customization-add-form/model/validators';

export type CustomizationFormSchema = z.infer<typeof CustomizationFormValidator>;
