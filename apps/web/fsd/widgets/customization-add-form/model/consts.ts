import { ShopImageItemType } from '~shared/api/models/shop';

export const type2Name: Record<ShopImageItemType, string> = {
  [ShopImageItemType.AVATAR]: 'Аватар',
  [ShopImageItemType.FRAME]: 'Рамка',
  [ShopImageItemType.WALLPAPER]: 'Обои',
};
