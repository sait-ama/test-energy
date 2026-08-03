import { useCallback, useEffect, useState } from 'react';

import { createContextSelector } from '@re/core/utils/create-context-selector';

import { CookieService } from '~shared/utils/cookie-service';
interface SnowContextType {
  isSnowEnabled: boolean;
  toggleSnow: () => void;
}

export const { Provider: SnowProvider, useStore: useSnow } = createContextSelector<
  SnowContextType,
  never
>(() => {
  const [isSnowEnabled, setIsSnowEnabled] = useState(false);

  useEffect(() => {
    const snowSetting = CookieService.get('snow-enabled');
    setIsSnowEnabled(snowSetting === 'true');
  }, []);

  const toggleSnow = useCallback(() => {
    setIsSnowEnabled((prev) => {
      const newValue = !prev;

      CookieService.set('snow-enabled', newValue.toString());
      return newValue;
    });
  }, []);

  return {
    isSnowEnabled,
    toggleSnow,
  };
}, 'SnowStore');
