'use client';

import type { FC } from 'react';
import React from 'react';

import { Button } from '@re/ui-kit/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@re/ui-kit/ui/dialog';
import { ReText } from '@re/ui-kit/ui/text';

import { useSiteConfig } from '~app/providers/site-config-provider';
import { useCookie } from '~shared/hooks/use-cookie';
import { useSession } from '~shared/lib/session/use-session';
import { UrlFormatter } from '~shared/utils/url-formatter';

export const AppPromo: FC = () => {
  const [value, setValue] = useCookie('app-promo');
  const app = useSiteConfig((v) => v.site.app);
  const is_using_mobile_app = useSession((v) => v?.is_using_mobile_app)!;

  const modalOpen = !value || value === 'false';

  const onCloseModal = () => {
    setValue('true');
  };

  const onDownloadButtonClick = () => {
    // ymReachGoal(goals.home.APP_PROMO);
    onCloseModal();
  };

  if (!modalOpen || is_using_mobile_app) return null;

  // if (isAppPromoHidden /* siteName !== 'ReManga' || */) return null;

  return (
    <Dialog open={modalOpen} onOpenChange={onCloseModal}>
      <DialogContent className="from-background to-primary overflow-hidden bg-gradient-to-b sm:max-w-sm sm:overflow-visible">
        <DialogTitle className="sr-only">Мобильное приложение</DialogTitle>

        <div className="container m-auto flex flex-1 flex-col items-center justify-center pb-7">
          <ReText className="flex flex-col items-center" size="xl">
            У нас появилось
            <span className="bg-primary mt-1.5 inline-flex items-center rounded-full p-[1px_15px_5px] text-white">
              приложение!
            </span>
          </ReText>

          <div className="mt-20 pb-24">
            <img
              src={UrlFormatter.media('public/app-promo/mobile-promo.webp')}
              alt="Телефон"
              className="relative top-[20%] -left-2.5 mt-10 h-auto w-full max-w-full scale-150 object-cover sm:top-[20%] sm:mt-0 md:top-1/4"
            />
          </div>

          <div className="mt-2 flex w-full justify-center">
            <Button onClick={onDownloadButtonClick} asChild size="lg" className="max-w-[200px] p-0">
              <a href={app?.android} target="_blank" rel="noreferrer">
                <img src={UrlFormatter.media('public/app/google-play.webp')} alt="Google Play" />
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
