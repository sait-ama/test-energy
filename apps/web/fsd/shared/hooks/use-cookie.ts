import { useCallback, useState } from 'react';

import { CookieService } from '~shared/utils/cookie-service';

export const useCookie = (
  cookieName: string
): [string | null, (newValue: string) => void, () => void] => {
  const [value, setValue] = useState<string | null>(() => CookieService.get(cookieName) || null);

  const updateCookie = useCallback(
    (newValue: string) => {
      CookieService.set(cookieName, newValue);
      setValue(newValue);
    },
    [cookieName]
  );

  const deleteCookie = useCallback(() => {
    CookieService.delete(cookieName);
    setValue(null);
  }, [cookieName]);

  return [value, updateCookie, deleteCookie];
};
