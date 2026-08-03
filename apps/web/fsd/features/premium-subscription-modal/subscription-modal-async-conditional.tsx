'use client';

import { lazy, Suspense, useEffect, useState } from 'react';

import { useLogged } from '~shared/lib/session/use-logged';
import { useSession } from '~shared/lib/session/use-session';
import { CookieService } from '~shared/utils/cookie-service';

const SubscriptionModal = lazy(() =>
  import(
    /* webpackChunkName: "SubscriptionModal" */ '~features/premium-subscription-modal/ui/subscription-modal'
  ).then((m) => ({
    default: m.SubscriptionModal,
  }))
);

export const SubscriptionModalAsyncConditional = () => {
  const isLogged = useLogged();

  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    setHidden(CookieService.get('isSubscriptionPromoHidden') === 'true');
  }, []);

  const { can_buy_premium_type, is_premium } = useSession()!;

  if (hidden || !isLogged) return null;

  if (!can_buy_premium_type || is_premium) return null;

  return (
    <Suspense>
      <SubscriptionModal />
    </Suspense>
  );
};
