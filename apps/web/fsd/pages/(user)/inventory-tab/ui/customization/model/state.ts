import { InventoryTab } from '~pages/(user)/inventory-tab/model/const';
import { useQueryState } from '~shared/hooks/use-query-state-v2';

const queryKey = 'shopType';
export const useCustomizationType = () =>
  useQueryState<InventoryTab>({
    key: queryKey,
    defaultValue: InventoryTab.AVATARS,
  });
