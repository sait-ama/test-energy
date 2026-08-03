'use client';
import { lazy, Suspense } from 'react';

import { useSiteConfig } from '~app/providers/site-config-provider';
import { SiteNames } from '~shared/config/constants';
import { useSession } from '~shared/lib/session/use-session';
import { isEmpty } from '~shared/utils/is-empty';

const AppPromo = lazy(() =>
  import(/* webpackChunkName: "AppPromo" */ '~features/app-promo/ui/app-promo').then((m) => ({
    default: m.AppPromo,
  }))
);

export const AppPromoAsyncConditional = () => {
  const app = useSiteConfig((v) => v.site.app)!;
  const siteName = useSiteConfig((v) => v.site.name);
  const is_using_mobile_app = useSession((v) => v?.is_using_mobile_app)!;

  if (siteName !== SiteNames.ReManga || isEmpty(app) || is_using_mobile_app) return null;

  return (
    <Suspense fallback={null}>
      <AppPromo />
    </Suspense>
  );
};
