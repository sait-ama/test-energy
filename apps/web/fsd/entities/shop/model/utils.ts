import { InventoryTab } from '~pages/(user)/inventory-tab/model/const';
import { ShopItemSchema, ShopItemTypes } from '~shared/api/models/shop';
import { DetailedCurrentUserSchema } from '~shared/api/models/user';
import { Routing } from '~shared/config/routing';
import { isTotalFalsy } from '~shared/utils/is-total-falsy';

/**
 - available - Товар доступен для покупки
 - unavailable-at-all - Товар доступен для покупки в магазине(возможно стоит поискать на бп)
 - unavailable-by-date- Товар доступен для покупки по дате
 - out-of-stock - Товар закончился
 - free - Товар можно получить бесплатно
 - owned - Уже в инвенторе, ссылка на инвентарь     **/
export type ShopItemStatus =
  | 'available' // Товар доступен для покупки
  | 'unavailable-at-all' // Товар недоступен в магазине в принципе(возможно получить по бп или тп)
  | 'unavailable-by-date' // Товар по дате
  | 'owned' // Товар уже куплен
  | 'out-of-stock' // Товар закончился
  | 'free'; // Товар можно получить бесплатно

/**
 * Определяет тип товара
 */
export const getItemType = (item: ShopItemSchema): ShopItemTypes | null => {
  if (item.image_item?.type) return item.image_item?.type as unknown as ShopItemTypes;
  if (item.emoji_pack) {
    return ShopItemTypes.PACK;
  }
  if (item.theme) return ShopItemTypes.THEME;

  return null;
};

/**
 * Возвращает название товара
 */
export const getItemName = (item: ShopItemSchema, emptyFallback?: string): string => {
  return (
    item.image_item?.name ||
    item.emoji_pack?.name ||
    item.theme?.name ||
    (emptyFallback ?? 'Элемент магазина')
  );
};

/**
 * Возвращает URL обложки товара
 */
export const getItemCover = (item: ShopItemSchema): string => {
  return (
    item.theme?.cover?.mid || item.emoji_pack?.cover?.high || item.image_item?.image?.high || ''
  );
};

/**
 * Проверяет, доступен ли товар по датам
 */
export const isItemAvailableByDate = (
  item: Pick<ShopItemSchema, 'availability_start_date' | 'availability_end_date'>
): boolean => {
  const now = Date.now();
  const start = item.availability_start_date ? new Date(item.availability_start_date).getTime() : 0;
  const end = item.availability_end_date
    ? new Date(item.availability_end_date).getTime()
    : Infinity;

  return start <= now && now <= end;
};

/**
 * Проверяет, можно ли получить товар бесплатно
 * (хотя бы одна цена равна null)
 */
export const isFreeItem = ({
  cost,
  cost_rub,
  cost_tickets,
}: Pick<ShopItemSchema, 'cost_rub' | 'cost_tickets' | 'cost'>): boolean => {
  return isTotalFalsy(cost, cost_rub, cost_tickets);
};

/**
 * Проверяет, недоступен ли товар в магазине
 * (все цены равны 0)
 */
export const isUnavailableItem = ({
  cost,
  cost_rub,
  cost_tickets,
}: Pick<ShopItemSchema, 'cost_rub' | 'cost_tickets' | 'cost'>): boolean => {
  return cost === 0 && Number(cost_rub) === 0 && cost_tickets === 0;
};

/**
 - Определяет статус товара
 - если куплен - всегда owned
 - если по неизвестной причине залочен(цены по нулям) - unavailable-at-all
 - если по дате - всегда unavailable-by-date
 - если никакие варианты выше - т.е доступен и не куплен, но цены - null и колво >0 - free
 - если нет по колву, но доступен - out-of-stock
 - всё остальное - available, т.е доступен к покупке, но может не хватать денег
 * */
const isBought = (item: Partial<Pick<ShopItemSchema, 'is_bought'>>) => {
  return item?.is_bought;
};
const outOfStock = (item: Pick<ShopItemSchema, 'amount'>) => {
  return item?.amount !== null && item?.amount === 0;
};
type ItemStatusParams = Parameters<typeof outOfStock>[0] &
  Parameters<typeof isBought>[0] &
  Parameters<typeof isItemAvailableByDate>[0] &
  Parameters<typeof isUnavailableItem>[0] &
  Parameters<typeof isFreeItem>[0];
export const getItemStatus = (item: ItemStatusParams): ShopItemStatus => {
  if (isBought(item)) return 'owned';
  if (!isItemAvailableByDate(item)) return 'unavailable-by-date';
  if (isUnavailableItem(item)) return 'unavailable-at-all';
  if (isFreeItem(item) && (item.amount === null || item.amount > 0)) return 'free';
  if (outOfStock(item)) return 'out-of-stock';
  return 'available';
};
export const isAvailable2Purchase = (status: ShopItemStatus, deck?: boolean) => {
  return status === 'available' || status === 'free' || (!!deck && status === 'owned');
};
/**
 * Возвращает вкладку инвентаря для данного типа товара
 */
const mapping: Record<ShopItemTypes, InventoryTab> = {
  [ShopItemTypes.DECK]: InventoryTab.DECKS,
  [ShopItemTypes.FRAME]: InventoryTab.FRAMES,
  [ShopItemTypes.WALLPAPER]: InventoryTab.WALLPAPERS,
  [ShopItemTypes.AVATAR]: InventoryTab.AVATARS,
  [ShopItemTypes.THEME]: InventoryTab.THEMES,
  [ShopItemTypes.PACK]: InventoryTab.EMOJI,
  [ShopItemTypes._STICKER_PACK]: InventoryTab.EMOJI,
};

export const getCustomizationInventoryType = (itemType: ShopItemTypes | null): InventoryTab => {
  return (itemType && mapping?.[itemType]) || (InventoryTab.AVATARS as const);
};

/**
 * Возвращает стоимость товара в указанной валюте
 */
export const getItemCost = (item: ShopItemSchema, currency: 'coins' | 'tickets'): number => {
  return currency === 'tickets' ? (item.cost_tickets ?? 0) : (item.cost ?? 0);
};

/**
 * Возвращает основную валюту для товара
 */
export const getItemCurrency = (item: ShopItemSchema): 'coins' | 'tickets' => {
  return item.cost_tickets ? 'tickets' : 'coins';
};

/**
 * Проверяет, достаточно ли средств у пользователя
 */
export const hasEnoughFunds = (
  item: ShopItemSchema,
  currency: 'tickets' | 'coins',
  balance: Pick<DetailedCurrentUserSchema, 'ticket_balance' | 'coins'>
): boolean => {
  if (isFreeItem(item)) return true;
  const cost = getItemCost(item, currency);
  const money = balance?.[currency === 'tickets' ? 'ticket_balance' : 'coins'];
  return Number(money) >= cost;
};

/**
 * Возвращает URL для предпросмотра товара
 */
export const getPreviewUrl = (item: ShopItemSchema, userId: number): string | null => {
  const type = getItemType(item);

  if (type === ShopItemTypes.THEME && item?.dir) {
    return Routing.User.detail({
      params: { id: userId },
      query: { themePreview: item.dir },
    });
  }

  return null;
};

/**
 * Возвращает URL для инвентаря товара
 */
export const getInventoryUrl = (item: ShopItemSchema, userId: number): string => {
  const type = getItemType(item);
  const tab = getCustomizationInventoryType(type);
  return Routing.User.detail({
    params: { id: userId, tab: 'inventory' },
    query: {
      type: type === ShopItemTypes.DECK ? InventoryTab.DECKS : 'customization',
      shopType: tab,
    },
  });
};
