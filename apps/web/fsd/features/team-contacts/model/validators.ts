import { z } from 'zod';

import type { PublisherResponseSchema } from '~shared/api/models/publisher';

export const createSocialSchema = (links: PublisherResponseSchema['content']['links']) => {
  const obj = Object.keys(links).reduce((acc: Record<string, z.ZodString>, cur) => {
    acc[cur] = z.string().optional().nullable().or(z.literal(''));
    return acc;
  }, {});

  return z.object({ ...obj });
};
