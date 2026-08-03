import { isValidPhoneNumber } from 'react-phone-number-input';

import { z } from 'zod';

export const CreateContractorFormValidator = z.object({
  phone: z.string().refine(isValidPhoneNumber, { message: 'Invalid phone number' }),
  email: z.string().email(),
  first_name: z.string(),
  middle_name: z.string(),
  last_name: z.string(),
  inn: z.string(),
  legal_form_id: z.string(),
});

export type CreateContractorFormSchema = z.infer<typeof CreateContractorFormValidator>;
