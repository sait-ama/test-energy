import { useEffect } from 'react';

import dayjs from 'dayjs';

import { randInt } from '~shared/utils/rand-int';

import { useHalloweenGiftStore } from '../model/store';

const TIMEOUT_DURATION = 1000 * 60 * 5; // 5 minutes
const HALLOWEEN_LAST_GIFT_TIME_LOCAL_STORAGE_KEY = 'halloween-last-gift-time';

export const HalloweenGiftSubscriber = () => {
  const { giftPosition, triggerGift } = useHalloweenGiftStore();

  useEffect(() => {
    if (giftPosition) return;
    if (typeof window === 'undefined') return;

    const timeoutId = setTimeout(
      () => {
        const lastTime = localStorage.getItem(HALLOWEEN_LAST_GIFT_TIME_LOCAL_STORAGE_KEY);

        if (lastTime && dayjs().isAfter(dayjs(lastTime).add(TIMEOUT_DURATION, 'millisecond'))) {
          triggerGift();
        }

        localStorage.setItem(HALLOWEEN_LAST_GIFT_TIME_LOCAL_STORAGE_KEY, dayjs().toISOString());
      },
      randInt(TIMEOUT_DURATION, TIMEOUT_DURATION * 2) /* 5 - 10 minutes */
    );

    return () => clearTimeout(timeoutId);
  }, [giftPosition]);

  return null;
};
