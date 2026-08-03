import React, { lazy, useEffect } from 'react';

import { CookieService } from '~shared/utils/cookie-service';

const BonusPaymentModal = lazy(() =>
  import(
    /* webpackChunkName: "BonusPaymentModal" */ '~features/bonus-payment/ui/bonus-payment'
  ).then((m) => ({
    default: m.BonusPaymentModal,
  }))
);

// todo!
export const BonusPaymentRoot = () => {
  const [isBonusPromoHidden, setIsBonusPromoHidden] = React.useState(() => true);

  useEffect(() => {
    setIsBonusPromoHidden(CookieService.get('isBonusPromoHidden') === 'true');
  }, []);

  if (isBonusPromoHidden) return null;

  // TODO: Always triggers useCharge in background
  return null;

  return (
    <BonusPaymentModal
      onClose={() => {
        setIsBonusPromoHidden(true);
      }}
    />
  );
};
