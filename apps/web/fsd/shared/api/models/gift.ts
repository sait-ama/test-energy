import { HeroCardSchema } from '~shared/api/models/inventory';

export const enum GiftType {
  REGISTER = 'register',
  CARD = 'card',
}

export interface GiftSchema {
  type: GiftType;
  value?: HeroCardSchema;
}
