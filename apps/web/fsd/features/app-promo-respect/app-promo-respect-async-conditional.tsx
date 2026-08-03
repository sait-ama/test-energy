import { lazy, Suspense } from 'react';

import { useLogged } from '~shared/lib/session/use-logged';
import { useSession } from '~shared/lib/session/use-session';
import { CookieService } from '~shared/utils/cookie-service';

const AppPromoRespect = lazy(() =>
  import(
    /* webpackChunkName: "AppPromoRespect" */ '~features/app-promo-respect/ui/app-promo-respect'
  ).then((m) => ({
    default: m.AppPromoRespect,
  }))
);

export const AppPromoRespectAsyncConditional = () => {
  const isLogged = useLogged();

  const isPromoRespectHidden = CookieService.get('isPromoRespectHidden') === 'true';

  const { is_using_mobile_app, app_extended_catalog } = useSession()! || {};
  if (!isLogged) return null;

  if (isPromoRespectHidden) return null;

  if (!is_using_mobile_app || app_extended_catalog) return null;

  return (
    <Suspense fallback={null}>
      <AppPromoRespect />
    </Suspense>
  );
};
