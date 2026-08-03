import { HeroCardCatalogOrderings } from '~shared/api/models/inventory';

export const ordering2Label = {
  [HeroCardCatalogOrderings.ID_DESC]: 'По новизне',
  [HeroCardCatalogOrderings.CHARACTER_NAME]: 'По имени персонажа',
  [HeroCardCatalogOrderings.POWER]: 'По силе',
  [HeroCardCatalogOrderings.RANK_DESC]: 'По рангу',
};
