import z from 'zod';

export const ManualWithdrawValidator = z.object({
  sum: z.string(),
});

export type ManualWithdrawSchema = z.infer<typeof ManualWithdrawValidator>;
