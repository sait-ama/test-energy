'use client';

import React, { useEffect, useState } from 'react';

import { Dialog, DialogContent, DialogTitle } from '@re/ui-kit/ui/dialog';
import { ReText } from '@re/ui-kit/ui/text';

import { LinearGradient } from '~shared/ui/linear-gradient';
import { CookieService } from '~shared/utils/cookie-service';
import { UrlFormatter } from '~shared/utils/url-formatter';

export const AppPromoRespect = () => {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    setHidden(CookieService.get('isPromoRespectHidden') === 'true');
  }, []);

  const onCloseModal = () => {
    setHidden(!hidden);
    CookieService.set('isPromoRespectHidden', !hidden.toString());
  };

  return (
    <Dialog open={!hidden} onOpenChange={onCloseModal}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="sr-only">Спасибо, что пользуетесь нашим приложением</DialogTitle>

        <div className="relative flex w-full flex-col items-center justify-center">
          <div className="mb-[-25%]">
            <LinearGradient
              className="pointer-events-none relative w-full max-w-full -translate-y-1/2"
              width={300}
              height={200}
              src={UrlFormatter.media('public/app-promo-respect/appPromoRespect.webp')}
              alt="PromoRespect"
            />
          </div>
          <div className="mt-5 flex flex-col items-center gap-4">
            <ReText size="xl" align="center" weight="semibold">
              Мы рады тому, что вы скачали приложение
            </ReText>
            <ReText size="sm" align="center" color="primary">
              Не забудьте включить расширенный каталог в настройках
            </ReText>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
