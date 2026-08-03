import { z } from 'zod';

const url = 'https://grouple.co/';

export const TransferBookmarksValidator = z.object({
  readmanga_link: z
    .string()
    .url()
    .startsWith(url)
    .min(url.length + 1),
});

export type TransferBookmarksSchema = z.infer<typeof TransferBookmarksValidator>;
