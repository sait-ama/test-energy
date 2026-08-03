'use client';

import { memo, Suspense } from 'react';

import { HeroCardPreviewModalAsync } from '~entities/inventory/ui/hero-card-preview/index.async';
import { UserSnapshotPreviewModalAsync } from '~entities/user/ui/user-snapshot-preview/user-snapshot-preview-modal-global.async';
import { AppPromoRespectAsyncConditional } from '~features/app-promo-respect/app-promo-respect-async-conditional';
import { BonusPaymentRoot } from '~features/bonus-payment/bonus-payment-root';
import { ChargeModalAsyncConditional } from '~features/charge/charge.async';
import { InfoModalAsyncConditional } from '~features/info-modal';
import { SubscriptionModalAsyncConditional } from '~features/premium-subscription-modal/subscription-modal-async-conditional';
import { HeroCardModalAsyncConditional } from '~shared/lib/card/card-modal';
import { useLogged } from '~shared/lib/session/use-logged';
import { EventModal } from '~widgets/(event-modals)/ui/event-modal';
import { AuthModalAsyncConditional } from '~widgets/auth/auth-modal.async';
import { ConfirmationModalAsyncConditional } from '~widgets/confirmation/ui/confirmation-modal.async';
import { StoreCurrencyExchangeModal } from '~widgets/currency-exchange/ui/currency-exchange-modal/currency-exchange-modal.async';
import { GiftModal } from '~widgets/gift/ui/gift-modal.async';
import { SearchModalAsyncConditional } from '~widgets/searchbar/ui/searchbar.async';

const PublicModals = memo(() => (
  <>
    <ConfirmationModalAsyncConditional />
    <SearchModalAsyncConditional />
    <GiftModal />
    <HeroCardModalAsyncConditional />
    <HeroCardPreviewModalAsync />
    <UserSnapshotPreviewModalAsync />
    <EventModal />
  </>
));

const LoggedModals = memo(() => (
  <>
    <ChargeModalAsyncConditional />
    <BonusPaymentRoot />
    {/*<AppPromoAsyncConditional />*/}
    {/*<HalloweenEventModalAsync />*/}
    <SubscriptionModalAsyncConditional />
    <AppPromoRespectAsyncConditional />
    <StoreCurrencyExchangeModal />
    {/*<NeedEmailLazy />*/}
  </>
));

export const AppLayoutModals = () => {
  const isLogged = useLogged();

  return (
    <Suspense>
      <PublicModals />
      <InfoModalAsyncConditional />
      {isLogged ? <LoggedModals /> : <AuthModalAsyncConditional />}
    </Suspense>
  );
};
