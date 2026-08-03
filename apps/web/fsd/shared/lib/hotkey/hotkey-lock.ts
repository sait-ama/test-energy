import { useEffect } from 'react';

const KEYLOCK_KEY = '__re_keylock';

export const canUseHotkeys = () => !window[KEYLOCK_KEY];

type UseHotkeyLockOptions =
  | {
      shouldLock: boolean;
    }
  | undefined
  | null;

export const disableHotkeys = () => {
  window[KEYLOCK_KEY] = window[KEYLOCK_KEY] ? window[KEYLOCK_KEY] + 1 : 1;
};

export const disableHotkeysCleanup = () => {
  window[KEYLOCK_KEY] -= 1;
};

export const useHotkeyLock = (options: UseHotkeyLockOptions) => {
  const { shouldLock = true } = options ?? {};

  useEffect(() => {
    if (!shouldLock) return;

    disableHotkeys();

    return disableHotkeysCleanup;
  }, [shouldLock]);
};
