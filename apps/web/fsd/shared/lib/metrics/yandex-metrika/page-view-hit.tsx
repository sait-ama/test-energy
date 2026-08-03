'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

import { yaMetrika } from '~shared/lib/metrics/yandex-metrika/metrika';

export const PageViewHit = () => {
  const pathname = usePathname();

  useEffect(() => {
    yaMetrika.setView(pathname);
  }, [pathname]);

  return null;
};
