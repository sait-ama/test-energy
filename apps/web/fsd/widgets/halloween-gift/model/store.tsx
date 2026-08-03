import { createContext, useEffect, useState } from 'react';

import dayjs from 'dayjs';

import { CookieService } from '~shared/utils/cookie-service';
import { useStrictContext } from '~shared/utils/use-strict-context';

import { generateGiftPosition } from './utils';

const HalloweenGiftStore = createContext<{
  giftPosition: string | null;
  triggerGift: () => void;
  removeGift: () => void;
} | null>(null);

export const HalloweenGiftStoreProvider = ({ children }: { children: React.ReactNode }) => {
  const [giftPosition, setGiftPosition] = useState<string | null>(null);

  useEffect(() => {
    const position = CookieService.get('halloween-gift-position');
    if (!position) return;

    setGiftPosition(position);
  }, []);

  const triggerGift = () => {
    const position = generateGiftPosition();
    setGiftPosition(position);

    CookieService.set('halloween-gift-position', position, {
      expires: dayjs().add(1, 'month').toDate(),
    });
  };

  const removeGift = () => {
    setGiftPosition(null);

    CookieService.delete('halloween-gift-position');
  };

  const context = {
    giftPosition,
    triggerGift,
    removeGift,
  };

  return <HalloweenGiftStore.Provider value={context}>{children}</HalloweenGiftStore.Provider>;
};

export const useHalloweenGiftStore = () => useStrictContext(HalloweenGiftStore);
