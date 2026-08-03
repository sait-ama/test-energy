'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

import DayJS from 'dayjs';
import { motion } from 'motion/react';

import Activity from '@re/ui-kit/icons/activity';
import Brush from '@re/ui-kit/icons/brush';
import CopyIcon from '@re/ui-kit/icons/copy';
import MovingStar from '@re/ui-kit/icons/moving-star';
import { Button } from '@re/ui-kit/ui/button';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { useSubscriptionQuery } from '~entities/subscription/model/api/queries';
import { RenewSubscriptionSwitch } from '~features/renew-subscribe/ui/renew-subscription-switch';
import { SubscriptionModal } from '~features/сhoose-subscription-method/ui/subscription-modal';
import { useSession } from '~shared/lib/session/use-session';
import { Section, SectionTitle } from '~shared/ui/section';

export const SubscriptionInfo = () => {
  const t = useTranslations('user.pages.subscription');
  const { data, isPending: isSubscriptionLoading } = useSubscriptionQuery();
  const { status, date_start, date_end, special_offer } = data ?? {};
  const is_premium = useSession((v) => v?.is_premium);
  const isLogged = is_premium !== undefined;
  const isPremium = !!status;
  const hasAbility2SpecialOffer = !!special_offer && isPremium;

  return (
    <>
      <motion.div
        layout
        animate={{ opacity: !isLogged ? 1 : Number(!isSubscriptionLoading) }}
        initial={{ opacity: isLogged ? 0 : Number(!isSubscriptionLoading) }}
      >
        <ReText
          className={cn(
            'bg-secondary cs-subscription-status -my-2 mt-2 block w-fit rounded-md px-4 py-2',
            {
              'text-red-500/60': !isPremium,
            }
          )}
          color={isPremium ? 'success' : 'destructive'}
        >
          {isPremium
            ? !date_end
              ? t('active-period-empty')
              : t('active-period', {
                  start: DayJS(date_start).toDate(),
                  end: DayJS(date_end).toDate(),
                })
            : t('inactive')}
        </ReText>
      </motion.div>
      <span className="mt-5 flex w-max items-center justify-center gap-4">
        <span className="relative flex h-10 w-15 items-center">
          <Button
            circle
            className="user-event-none cursor-auto select-none"
            color="gray"
            variant="flat"
          >
            <MovingStar size={20} />
          </Button>
          <Button
            circle
            className="user-event-none hover:none hover:bg-primary absolute left-[35%] cursor-auto"
            variant="default"
            color="primary"
          >
            <Activity fill="none" color="currentColor" size={20} />
          </Button>
        </span>
        <ReText align="center" className="text-center text-xl font-semibold md:text-2xl">
          RePremium
        </ReText>
        <span className="relative flex h-10 w-15 items-center">
          <Button
            circle
            className="user-event-none hover:bg-primary z-1 cursor-auto"
            variant="default"
            color="primary"
          >
            <CopyIcon size={20} />
          </Button>
          <Button
            circle
            className="user-event-none absolute right-0 z-0 cursor-auto select-none"
            color="gray"
            variant="flat"
          >
            <Brush size={20} />
          </Button>
        </span>
      </span>
      <ReText
        align="center"
        className="flex items-center justify-center text-center text-xl font-semibold md:text-2xl"
      >
        {t('opportunities')}
      </ReText>
      <ReText
        style={{ lineHeight: '100%' }}
        weight="regular"
        size="sm"
        align="center"
        className="text-muted-foreground/70 flex h-15 items-center justify-center text-center"
      >
        {t('details')}
      </ReText>
      {!hasAbility2SpecialOffer && isPremium && <RenewSubscriptionSwitch />}
      {hasAbility2SpecialOffer && !isSubscriptionLoading && (
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: Number(!isLogged), y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: !isLogged ? 0 : -100 }}
          transition={{ duration: 0.5 }}
        >
          <Section className="flex w-full flex-col items-center justify-between gap-4 p-5 md:flex-row md:items-stretch">
            <span className="m-auto md:m-0">
              <SectionTitle>У тебя есть специальное предложение!</SectionTitle>
              <ReText color="muted-foreground">
                Покупай подписку сейчас и получай подписку на&nbsp;
                {parseFloat(special_offer.charge_bonus) * 30}&nbsp;дней!
              </ReText>
            </span>
            <SubscriptionModal className="mt-0" /*confirmMessage="Перейти к предложению"*/ />
          </Section>
          {isPremium && <RenewSubscriptionSwitch />}
        </motion.div>
      )}
    </>
  );
};
