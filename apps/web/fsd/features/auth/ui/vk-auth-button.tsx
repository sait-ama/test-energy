import { useEffect, useRef } from 'react';

import { Config, OneTap, OneTapSkin, Scheme, WidgetEvents } from '@vkid/sdk';

import { SocialProviders } from '~shared/api/models/user';
import { logger } from '~shared/lib/logger';
import { publicEnv } from '~shared/utils/env';

export const VkAuthButton = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !publicEnv('VK_APP_ID')) return;
    const redirect = window.location.pathname;

    Config.set({
      app: +publicEnv('VK_APP_ID')!,
      redirectUrl: publicEnv('SOCIAL_REDIRECT'),
      state: btoa(`${SocialProviders.VK},${redirect},auth`),
    });

    const oneTap = new OneTap();

    oneTap
      .render({
        container: ref.current!,
        showAlternativeLogin: false,
        skin: OneTapSkin.Primary,
        scheme: Scheme.DARK,
        lang: 0,
        styles: {
          height: 40,
          borderRadius: 20,
        },
      })
      .on(WidgetEvents.ERROR, (e: unknown) => logger.error(e, { scope: ['local'] }));

    return () => {
      oneTap.close();
    };
  }, []);

  return <div ref={ref} />;
};
