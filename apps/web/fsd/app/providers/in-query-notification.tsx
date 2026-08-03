'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

import type { Routing } from '~shared/config/routing';
import { importToastAsync } from '~shared/ui/toast/toast.async';
import { isJson } from '~shared/utils/is-json';

export const InQueryNotification = () => {
  const searchParams = useSearchParams();
  let cancel = false;

  useEffect(() => {
    (async () => {
      if (!searchParams.has('__notification')) return;
      if (cancel) return;

      const raw = searchParams.get('__notification');
      const message = isJson(raw) ? (JSON.parse(raw!) as Routing.Home.Notification) : null;

      if (!message) return;

      const toast = await importToastAsync();

      if (message.type === 'toast') {
        toast[message.severity](message.message, {
          duration: 10000,
          dismissible: true,
        });
      }
    })();

    return () => {
      cancel = true;
    };
  }, []);

  return null;
};
