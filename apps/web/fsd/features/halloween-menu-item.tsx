'use client';
import { MouseEventHandler } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { HalloweenItem } from '@re/ui-kit/icons/hellowen-item';
import { ReText } from '@re/ui-kit/ui/text';

import { UserTopOrdering } from '~shared/api/models/user';
import { Routing } from '~shared/config/routing';
import { EventDateType } from '~shared/lib/event-management/get-event';
import { isHalloweenDate } from '~shared/lib/event-management/is-halloween';
import { LinkBase } from '~shared/ui/link-base';

export const HalloweenMenuItem = () => {
  const show = isHalloweenDate();
  const router = useRouter();
  const t = useTranslations('halloween.menu');
  const onRatingClick: MouseEventHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(
      Routing.User.topDetail({
        params: { tab: UserTopOrdering.EVENT_POINTS },
      })
    );
  };
  if (!show) return null;

  return (
    <Link
      prefetch={false}
      href={Routing.EventsPromo.get({ event: EventDateType.HALLOWEEN })}
      className="from-primary/80 to-primary relative mb-2 flex h-16 w-full cursor-pointer overflow-hidden rounded-sm bg-gradient-to-r"
    >
      <div className="absolute -top-[1px] -left-5 -rotate-40 opacity-30">
        <HalloweenItem size={80} className="drop-shadow-[0_4px_10px_rgba(255,107,53,0.6)]" />
      </div>
      <div className="absolute -bottom-4 left-1/2 opacity-30">
        <HalloweenItem size={30} className="rotate-45" />
      </div>
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-yellow-200/10 to-transparent mix-blend-overlay" />

      <div className="z-2 flex flex-col justify-center px-4">
        <ReText size="md" weight="semibold" color="primary-foreground" className="m-0">
          {t('title')}
        </ReText>
        <LinkBase variant="secondary">
          <ReText
            role="link"
            onClick={onRatingClick}
            color="primary-foreground"
            size="xs"
            className="hover:text-primary-foreground z-3 m-0 flex"
          >
            {t('subheader')}
          </ReText>
        </LinkBase>
      </div>
    </Link>
  );
};
