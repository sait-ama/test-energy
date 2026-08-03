'use client';
import { ReactNode } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { useSuspenseQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';

import { battlepassCurrentPreviewRetrieveOptions } from '@re/api/generated/@tanstack/react-query.gen';
import { Button } from '@re/ui-kit/ui/button';
import { ReText } from '@re/ui-kit/ui/text';

import { useJoinBattlepass } from '~entities/battlepass/model/mutations';
import { useBattlepassPreview } from '~entities/battlepass/model/queries';
import { client } from '~shared/api/client';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { useLoggedCheck } from '~shared/lib/session/use-logged';
import { MediaContent, MediaRoot } from '~shared/ui/media';
import { Section, SectionContent, SectionTitle } from '~shared/ui/section';
import { importToastAsync } from '~shared/ui/toast/toast.async';
import { UrlFormatter } from '~shared/utils/url-formatter';

export const BattlepassInfoPreview = () => {
  const { data } = useSuspenseQuery(battlepassCurrentPreviewRetrieveOptions({ client }));

  return (
    <div className="border-border relative flex aspect-square w-full flex-col-reverse items-center justify-between overflow-hidden rounded-md border sm:aspect-[3/1] md:aspect-[3/1] lg:flex-row">
      <MediaRoot
        src={UrlFormatter.media(data.content?.image_mobile.high)}
        className="size-full sm:hidden"
      >
        <MediaContent fill alt="image" />
      </MediaRoot>
      <MediaRoot
        src={UrlFormatter.media(data.content?.image_tablet.high)}
        className="hidden size-full sm:block md:hidden"
      >
        <MediaContent fill alt="image" />
      </MediaRoot>
      <MediaRoot
        src={UrlFormatter.media(data.content?.image_desktop.high)}
        className="hidden size-full md:block"
      >
        <MediaContent fill alt="image" />
      </MediaRoot>
    </div>
  );
};

export const BattlepassJoin = () => {
  const { mutateAsync } = useJoinBattlepass();
  const checkLogged = useLoggedCheck();
  const { refetch, data } = useBattlepassPreview();
  const t = useTranslations('battlepass.info');

  const isAlreadyStarted = dayjs(data.content.date_start).isSameOrBefore(dayjs());

  const handleClick = checkLogged(async () => {
    const toast = await importToastAsync();

    try {
      await mutateAsync();
      await refetch();
      toast.success(t('join.on-success'));
    } catch (e) {
      logger.error(e);
      await resolveErrorAsync(e);
    }
  });

  return (
    <Section className="col-span-full flex-col-reverse items-center justify-center gap-4 p-6 md:gap-8 md:px-12 lg:flex-row">
      <SectionContent className="flex-col gap-4">
        <div className="flex max-w-1/2 flex-col gap-1">
          <SectionTitle size="xl">{t('faq.how-to-join.heading')}</SectionTitle>
          <ReText color="muted-foreground">{t('faq.how-to-join.description')}</ReText>
        </div>
        <div className="fixed bottom-[calc(var(--bottom-bar-height)+8px)] left-0 flex w-full justify-center md:static md:justify-start">
          <Button
            className="mx-2 w-full self-start md:mx-0 md:w-auto"
            onClick={handleClick}
            disabled={!isAlreadyStarted}
          >
            {isAlreadyStarted
              ? t('join.action-available')
              : t('join.action-unavailable', {
                  date_start: dayjs(data.content.date_start).toDate(),
                })}
          </Button>
        </div>
      </SectionContent>

      <Image
        src={UrlFormatter.media('public/battlepass/how-to-join.webp')}
        width={240}
        height={240}
        alt={t('faq.how-to-join.heading')}
      />
    </Section>
  );
};

interface BattlePassInfoProps {
  topSlot?: ReactNode;
  bottomSlot?: ReactNode;
}

export const BattlePassInfo = (props: BattlePassInfoProps) => {
  const { topSlot, bottomSlot } = props;

  const t = useTranslations('battlepass.info');

  return (
    <div className="flex flex-col gap-2">
      {topSlot}
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <Section className="items-center gap-4 p-6 md:gap-8 lg:flex-row">
          <Image
            src={UrlFormatter.media('public/battlepass/why-i-have-to-do-it.webp')}
            width={240}
            height={240}
            alt={t('faq.what-is-it.heading')}
          />
          <SectionContent className="flex-col gap-2">
            <SectionTitle>{t('faq.what-is-it.heading')}</SectionTitle>
            <ReText color="muted-foreground">{t('faq.what-is-it.description')}</ReText>
          </SectionContent>
        </Section>
        <Section className="items-center gap-4 p-6 md:gap-8 lg:flex-row">
          <Image
            src={UrlFormatter.media('public/battlepass/what-is-it.webp')}
            width={240}
            height={240}
            alt={t('faq.why-i-have-to-do-it.heading')}
          />

          <SectionContent className="flex-col gap-2">
            <SectionTitle>{t('faq.why-i-have-to-do-it.heading')}</SectionTitle>
            <ReText color="muted-foreground">{t('faq.why-i-have-to-do-it.description')}</ReText>
          </SectionContent>
        </Section>
        <Section className="items-center gap-4 p-6 md:gap-8 lg:flex-row">
          <Image
            src={UrlFormatter.media('public/battlepass/what-are-the-rewards-types.webp')}
            width={240}
            height={240}
            alt={t('faq.what-are-the-rewards-types.heading')}
          />

          <SectionContent className="flex-col gap-2">
            <SectionTitle>{t('faq.what-are-the-rewards-types.heading')}</SectionTitle>
            <ReText color="muted-foreground">
              {t('faq.what-are-the-rewards-types.description')}
            </ReText>
          </SectionContent>
        </Section>
        <Section className="items-center gap-4 p-6 md:gap-8 lg:flex-row">
          <Image
            src={UrlFormatter.media('public/battlepass/what-are-the-tasks-types.webp')}
            width={240}
            height={240}
            alt={t('faq.what-are-the-tasks-types.heading')}
          />

          <SectionContent className="flex-col gap-2">
            <SectionTitle>{t('faq.what-are-the-tasks-types.heading')}</SectionTitle>
            <ReText color="muted-foreground">
              {t('faq.what-are-the-tasks-types.description')}
            </ReText>
          </SectionContent>
        </Section>
      </div>
      {bottomSlot}
    </div>
  );
};
