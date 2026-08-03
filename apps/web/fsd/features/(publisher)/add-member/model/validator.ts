import { z } from 'zod';

import type { UpdatePublisherMemberRequestSchema } from '~shared/api/models/publisher';
import { RoleMembers } from '~shared/api/models/publisher';

export const AddMemberValidator = z.object({
  status: z.oboolean().or(z.literal(1)).or(z.literal(0)).default(true),
  role: z.nativeEnum(RoleMembers).default(RoleMembers.MEMBER),
  rights: z.string().array().optional(),
  userId: z.number(),
} satisfies Record<keyof (UpdatePublisherMemberRequestSchema & { userId: number }), any>);
export type AddMemberRequestSchema = z.infer<typeof AddMemberValidator>;
