import { z } from 'zod';

import { zInventoryCard } from '@re/api/generated/zod.gen';

import {
  MAX_CARDS_4_COLLECTION,
  MAX_NAME_COLLECTION,
  MIN_CARDS_4_COLLECTION,
  MIN_NAME_COLLECTION,
} from '~features/(manage-card-collections)/manage-forms/model/consts';
import type { CreateCardCollectionRequestSchema } from '~shared/api/models/card-collections';
import { InventoryItem } from '~shared/api/models/inventory';

export const CreateCollectionCardsServerRequestSchema = z.object({
  position: z.number().positive().optional(),
  cards: z.array(z.number().int()).min(MIN_CARDS_4_COLLECTION).max(MAX_CARDS_4_COLLECTION),
  name: z.string().min(MIN_NAME_COLLECTION).max(MAX_NAME_COLLECTION),
});
export const UpdateCollectionCardsServerRequestSchema = z.object({
  position: z.number().positive().optional(),
  cards: z.array(z.number().int()).min(MIN_CARDS_4_COLLECTION).max(MAX_CARDS_4_COLLECTION),
  name: z.string().min(MIN_NAME_COLLECTION).max(MAX_NAME_COLLECTION),
});
export type CreateCollectionCardsClientFormType = {
  cards: InventoryItem[];
} & Omit<CreateCardCollectionRequestSchema, 'cards'>;

//!this schema transforms data
export const MangeCollectionCardsClientSchema = z.object({
  position: z.number().int().optional(),
  name: z
    .string()
    .min(MIN_NAME_COLLECTION)
    .max(MAX_NAME_COLLECTION)
    .regex(/^[A-Za-zА-Яа-я]/, {
      message: 'Строка должна начинаться с буквы (латиница или кириллица)',
    })
    .transform((str) =>
      !str
        ? ''
        : str.length < 2
          ? str.toUpperCase()
          : `${str.charAt(0).toUpperCase()}${str.slice(1)}`
    ),
  cards: z
    .array(z.any() as unknown as typeof zInventoryCard)
    .min(MIN_CARDS_4_COLLECTION)
    .max(MAX_CARDS_4_COLLECTION)
    .transform((v) => v.map((v) => v.id)),
});
// //todo mb i18n
// export const getCreateCollectionCardsServerRequestSchema = () =>
//   CreateCollectionCardsServerRequestSchema.extend({});
// export const getUpdateCollectionCardsServerRequestSchema = () =>
//   UpdateCollectionCardsServerRequestSchema.extend({});
