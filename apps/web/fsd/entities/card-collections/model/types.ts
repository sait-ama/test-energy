import type { CardItem } from '~shared/api/generated/models';

export type AverageCard = CardItem;
export type AbstractCard = {
  id: number;
};
export type AbstractCollection<T extends AbstractCard, TEX = {}> = {
  id: number;
  name: string;
  cards: T[];
} & TEX;
