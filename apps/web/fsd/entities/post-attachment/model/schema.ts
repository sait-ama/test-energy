import { z } from 'zod';

import { zAttachmentCreateRequest } from '@re/api/generated/zod.gen';

export const zPostCreateRequest = z.object({
  header: z.string().min(1).max(65),
  text: z.string().min(100).max(20000),
  author_user_id: z.union([z.number().int(), z.null()]).optional(),
  author_publisher_id: z.union([z.number().int(), z.null()]).optional(),
  author_club_id: z.union([z.number().int(), z.null()]).optional(),
  is_pinned: z.union([z.boolean().default(false), z.null()]).optional(),
  attachments: z.array(zAttachmentCreateRequest).optional(),
  tags: z.array(z.number().int().gte(1)),
  attachment: z.union([z.string(), z.string()]).optional(),
});
export const zPostUpdateRequest = z.object({
  header: z.string().max(65).optional(),
  text: z.string().max(20000).optional(),
  is_pinned: z.union([z.boolean(), z.null()]).optional(),
  is_deleted: z.union([z.boolean(), z.null()]).optional(),
  attachments: z.array(zAttachmentCreateRequest).optional(),
  tags: z.array(z.number().int().gte(1)).optional(),
  attachment: z.union([z.string(), z.string()]).optional(),
});
