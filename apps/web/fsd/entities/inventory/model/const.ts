import { HeroCardOrdering } from '~shared/api/models/inventory';

export const HERO_CARD_ORDERING: { id: HeroCardOrdering; name: string }[] = [
  { id: 'rank', name: 'По рангу' },
  { id: 'is_favorite', name: 'По избранным' },
  { id: 'id', name: 'По новизне' },
  { id: 'card__character_id', name: 'По персонажу' },
  { id: 'card__title_id', name: 'По тайтлу' },
  { id: 'stack_count', name: 'По количеству в стаке' },
];
