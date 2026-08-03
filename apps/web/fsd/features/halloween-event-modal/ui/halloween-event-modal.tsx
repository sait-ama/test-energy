'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { Button } from '@re/ui-kit/ui/button';
import { Dialog, DialogCloseButton, DialogContent, DialogTitle } from '@re/ui-kit/ui/dialog';
import { ReText } from '@re/ui-kit/ui/text';

import { Routing } from '~shared/config/routing';
import { getSiteConfig } from '~shared/config/site-config';
import { useCookie } from '~shared/hooks/use-cookie';
import { EventDateType } from '~shared/lib/event-management/get-event';
import { Media } from '~shared/lib/media';
import { Display } from '~shared/lib/media/const';
import { LinearGradientBase } from '~shared/ui/linear-gradient';
import { LinkBase } from '~shared/ui/link-base';
import { UrlFormatter } from '~shared/utils/url-formatter';

export const HalloweenEventModal = () => {
  const t = useTranslations('halloween.modal');
  const siteName = `${getSiteConfig()?.site.name}.org`;
  const [value, setValue] = useCookie('halloweeen-modal');
  const router = useRouter();
  const modalOpen = !value;
  const onCloseModal = () => {
    setValue('true');
  };
  const closeWithRedirect = () => {
    router.push(Routing.EventsPromo.get({ event: EventDateType.HALLOWEEN }), { scroll: true });
    onCloseModal();
  };

  return (
    <Dialog open={modalOpen} onOpenChange={onCloseModal}>
      <DialogContent
        withClose={false}
        className="mt-[16%] overflow-visible sm:mt-[7%] sm:max-w-md md:mt-28"
        style={{ boxShadow: '0 0 50px 15px #FB620D' }}
      >
        <DialogCloseButton onClick={onCloseModal} className="z-[2000]" />
        <DialogTitle className="sr-only">{t('dialog-title', { siteName })}</DialogTitle>

        <LinearGradientBase
          before
          after={false}
          className="relative m-auto flex flex-1 flex-col items-center justify-center before:z-3"
        >
          <Image
            width={450}
            height={450}
            draggable={false}
            src={UrlFormatter.media('public/halloween/nezuko-with-light.webp')}
            className="pointer-events-none absolute -top-[67%] left-0 aspect-square size-full object-contain select-none"
            alt="Nezuko"
          />

          <div className="bg-background relative flex flex-col gap-4">
            <ReText
              className="z-10 flex flex-col items-center"
              align="center"
              size="xl"
              weight="semibold"
            >
              {t('title', { siteName })}
            </ReText>
            <ReText
              className="bg-card flex flex-col items-center rounded-md p-4"
              size="sm"
              color="muted-foreground"
            >
              {t('description')}
            </ReText>
            <ReText
              className="bg-card z-10 flex flex-wrap items-center gap-1 rounded-md p-4"
              size="sm"
              color="muted-foreground"
            >
              {/*@ts-ignore*/}
              {t.rich('hurry-with-link', {
                link: (chunks) => (
                  <LinkBase className="text-primary cursor-pointer hover:opacity-90">
                    <Link
                      onClick={onCloseModal}
                      prefetch
                      href={Routing.User.topDetail({
                        params: { tab: UserTopOrdering.EVENT_POINTS },
                      })}
                    >
                      {chunks}
                    </Link>
                  </LinkBase>
                ),
              })}
            </ReText>
          </div>
          <Media greaterThanOrEqual={Display.sm}>
            <Image
              draggable={false}
              width={130}
              height={130}
              src={UrlFormatter.media('public/halloween/card1.webp')}
              alt="card1"
              className="user-events-none absolute bottom-0 left-0 translate-x-[-125px] translate-y-[-355px] rotate-[21deg] object-contain"
            />
            <Image
              width={130}
              height={130}
              alt="CARD3"
              draggable={false}
              src={UrlFormatter.media('public/halloween/card2.webp')}
              className="user-events-none absolute right-0 bottom-0 z-10 translate-x-[120px] translate-y-[-240px] rotate-[-28deg] object-contain"
            />
            <Image
              width={130}
              draggable={false}
              height={130}
              src={UrlFormatter.media('public/halloween/card3.webp')}
              alt="card2"
              className="user-events-none absolute bottom-0 left-0 translate-x-[-145px] translate-y-[-105px] -rotate-[16deg] object-contain"
            />
            <Image
              width={130}
              height={130}
              draggable={false}
              src={UrlFormatter.media('public/halloween/card4.webp')}
              alt="card4"
              className="user-events-none absolute right-0 bottom-0 translate-x-[150px] translate-y-[-80px] rotate-12 object-contain"
            />
            <Image
              width={300}
              height={300}
              src={UrlFormatter.media('public/halloween/pumkin1.webp')}
              alt="Pumkins"
              className="user-events-none absolute bottom-0 left-0 translate-x-[-150px] translate-y-[155px] object-contain"
            />
            <Image
              width={300}
              height={300}
              draggable={false}
              src={UrlFormatter.media('public/halloween/pumkin2.webp')}
              alt="Pumkins"
              className="user-events-none absolute right-0 bottom-0 translate-x-[195px] translate-y-[155px] object-contain"
            />
          </Media>

          <Button onClick={closeWithRedirect} size="lg" className="mt-4 bg-orange-600">
            {t('button')}
          </Button>
        </LinearGradientBase>
      </DialogContent>
    </Dialog>
  );
};
