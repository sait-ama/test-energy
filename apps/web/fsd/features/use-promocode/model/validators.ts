import { z } from 'zod';

export const TypePomocodeValidator = z.object({ promo_code: z.string() });
