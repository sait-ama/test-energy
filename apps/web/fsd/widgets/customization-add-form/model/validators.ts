import { z } from 'zod';

import { ShopImageItemType } from '~shared/api/models/shop';

export const CustomizationFormValidator = z.object({
  type: z.nativeEnum(ShopImageItemType),
  name: z.string(),
  cost: z.number().or(z.string()),
  amount: z.number().or(z.string()).optional(),
  image: z.string(),
});
