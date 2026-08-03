import type { z } from 'zod';

import type { ChargeFormValidator } from '~features/charge/model/validators';

export type ChargeFormSchema = z.infer<ReturnType<typeof ChargeFormValidator>>;
