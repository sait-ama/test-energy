import { GiftType } from '~shared/api/models/gift';
import { useDroppedGifts } from '~shared/lib/gift/use-dropped-gifts';

/**
 * - client only
 * - only ONE occurrence in app implied
 */

export const showRegisterGift = () => {
  const store = useDroppedGifts.getState();
  store.setGift({ type: GiftType.REGISTER });
};
