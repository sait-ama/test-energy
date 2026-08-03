import { z } from 'zod';

import { deserializeDateRange } from './utils';

export const AdvertisementTableAddTitleValidator = z.object({
  title_id: z.string(),
  title_dir: z.string(),
  branch_id: z.string(),
  date_range: z.string().refine((it) => {
    const { from, to } = deserializeDateRange(it);

    return !!from && !!to;
  }),
});

export type AdvertisementTableAddTitleSchema = z.infer<typeof AdvertisementTableAddTitleValidator>;
