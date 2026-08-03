'use client';

import { useEffect } from 'react';

import { SocialService } from '~features/auth/model/service';
import { SocialProviders } from '~shared/api/models/user';
import { logger } from '~shared/lib/logger';

export const LinkVk = () => {
  useEffect(() => {
    (async () => {
      try {
        const hash = window.location.hash.substring(1);
        const hashParams = new URLSearchParams(hash);

        const code = hashParams.get('access_token');
        const state = hashParams.get('state');

        const decodedState = atob(state!);

        const payload = { state: decodedState, code };

        await SocialService.LinkInner[SocialProviders.VK_CONNECT]({ payload });
      } catch (e: unknown) {
        logger.error(e);
      }
    })();
  }, []);

  return <div>loading...</div>;
};
