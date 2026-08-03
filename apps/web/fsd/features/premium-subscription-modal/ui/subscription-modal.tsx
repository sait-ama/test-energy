'use client';

import React, { useEffect, useState } from 'react';

import { Dialog, DialogContent, DialogTitle } from '@re/ui-kit/ui/dialog';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { SubscriptionModalContent } from '~features/premium-subscription-modal/ui/subscription-modal-content';
import { CookieService } from '~shared/utils/cookie-service';

export const SubscriptionModal = () => {
  const [isPromoHidden, setIsPromoHidden] = useState(false);

  useEffect(() => {
    // const isSubscriptionPromoHidden = CookieService.get(`isSubscriptionPromoHidden-${dayjs().format('YYYY-MM-DD')}`);
    const isSubscriptionPromoHidden = CookieService.get(`isSubscriptionPromoHidden`);
    setIsPromoHidden(isSubscriptionPromoHidden === 'true');
  }, []);

  const onCloseModal = () => {
    setIsPromoHidden(true);
    // CookieService.set(`isSubscriptionPromoHidden-${dayjs().format('YYYY-MM-DD')}`, 'true');
    CookieService.set(`isSubscriptionPromoHidden`, 'true');
  };

  if (isPromoHidden) return null;

  return (
    <Dialog open={!isPromoHidden} onOpenChange={onCloseModal}>
      <DialogContent className={cn('sm:max-w-md')}>
        <DialogTitle className="sr-only">Premium подписка</DialogTitle>

        <div className="relative flex w-full max-w-full flex-col items-center justify-center overflow-auto rounded-md p-2">
          <div className="mb-4 flex w-full justify-center">
            <ReText align="center" weight="semibold" size="2xl">
              Premium подписка
            </ReText>
          </div>

          <SubscriptionModalContent onClose={onCloseModal} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
