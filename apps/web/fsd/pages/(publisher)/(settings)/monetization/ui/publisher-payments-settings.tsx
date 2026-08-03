// const TeamContract = dynamic(() => import('./TeamContract'), { ssr: false });
'use client';
import { useCallback, useMemo } from 'react';
import Link from 'next/link';

import { Skeleton } from '@re/ui-kit/ui/skeleton';
import { Spinner } from '@re/ui-kit/ui/spinner';
import { ReText } from '@re/ui-kit/ui/text';

import { useSiteConfig } from '~app/providers/site-config-provider';
import { useCurrentPublisher } from '~entities/publisher/model/hooks';
import { useMoneyAbility } from '~features/(publisher)/withdraw/model/ability';
import { useConnectedCards } from '~features/(publisher)/withdraw/model/hooks';
import { PublisherConnectCardButton } from '~features/(publisher)/withdraw/ui/connect-publisher-card';
import { PublisherConnectedCard } from '~features/(publisher)/withdraw/ui/connected-card';
import { CreateWithDrawPublisherFormRoot } from '~features/(publisher)/withdraw/ui/forms/create-withdraw-form';
import { PublisherWithDrawList } from '~features/(publisher)/withdraw/ui/publisher-withdraw-list';
import { PublisherMonetizationButton } from '~pages/(publisher)/(settings)/monetization/ui/publisher-monetization-button';
import type { CardSchema } from '~shared/api/models/publisher';
import { Monetization } from '~shared/api/models/publisher';
import type { FlatListItemRenderer, FlatListLoadingProps } from '~shared/ui/flat-list-v2';
import {
  FlatListContent,
  FlatListEmpty,
  FlatListLoading,
  FlatListRoot,
} from '~shared/ui/flat-list-v2';
import { Section, SectionContent, SectionTitle } from '~shared/ui/section';

const PublisherConnectedCards = () => {
  const { isLoading } = useCurrentPublisher((v) => v.content.id);
  const { cards, isCardLoading, deleteCard, error } = useConnectedCards();
  const onRemove = (id: number) => deleteCard(id);
  const renderCard: FlatListItemRenderer<CardSchema> = useCallback(
    ({ item }) => <PublisherConnectedCard onRemove={onRemove} {...item} key={item.id} />,
    [deleteCard]
  );
  const renderSkeletonCard: FlatListLoadingProps['children'] = useCallback(
    ({ key }) => <Skeleton key={key} className="mt-4 h-[40px] w-full" />,
    []
  );

  return (
    <Section>
      <SectionTitle>
        Привязанные карты
        {(isCardLoading || isLoading) && <Spinner className="ml-2" />}
      </SectionTitle>
      {error && <ReText color="destructive">{error.message}</ReText>}

      <FlatListRoot asChild content={cards} isLoading={isCardLoading}>
        <SectionContent className="flex flex-col gap-4">
          <FlatListContent>{renderCard}</FlatListContent>
          <FlatListLoading count={5}>{renderSkeletonCard}</FlatListLoading>
          <FlatListEmpty height="100px" isEmpty={!cards.length && !isCardLoading} />
        </SectionContent>
      </FlatListRoot>

      <div className="mt-4">
        <PublisherConnectCardButton disabled={!!error} />
      </div>
    </Section>
  );
};

const PublisherBanned = () => (
  <Section>
    <SectionTitle>Монетизация ограничена</SectionTitle>
    <SectionContent className="trouble">Обратитесь в группу вк за подробностями</SectionContent>
  </Section>
);

const PublisherNeedLevelUp = () => {
  const remangaConfig = useSiteConfig();
  return (
    <Section>
      <SectionTitle>Требуется разрешение модерации</SectionTitle>
      <SectionContent className="trouble">
        Для включения монетизации необходимо пройти проверку на качество, напишите нам в паблик
        <Link
          shallow={false}
          prefetch={false}
          target="_blank"
          className="text-primary ml-1"
          href={remangaConfig.site.contacts?.supportUrl || ''}
        >
          Vk
        </Link>
      </SectionContent>
    </Section>
  );
};

const PublisherReferralCode = () => {
  const { data: referral } = useCurrentPublisher((v) => v.props.referral);

  if (!referral) return null;

  return (
    <Section>
      <SectionTitle className="flex items-center">Реферальный код</SectionTitle>
      <div className="actions mt-2 mb-5 font-bold">{referral || 'referralCode'}</div>
      <SectionContent>
        <div className="actions flex flex-col">
          <div>
            <div className="flex">
              Реферальный код можно добавить на любую страницу сайта, путем добавления к ссылке
            </div>
            <div className="pl-1 font-bold">?referral={referral}</div>
            например:
          </div>
          <div className="flex flex-col">
            <p className="textSmall underline">{`https://remanga.org/?referral=${referral ?? 'referralCode'}`}</p>
            <p className="textSmall underline">{`https://remanga.org/manga?referral=${referral ?? 'referralCode'}`}</p>
            <p className="textSmall mt-0.5 underline">{`https://remanga.org/top?referral=${referral ?? 'referralCode'}`}</p>
          </div>
        </div>
        <style jsx>{`
          .textSmall {
            font-size: 16px;
          }
        `}</style>
      </SectionContent>
    </Section>
  );
};
const PublisherEnabledPayments = () => {
  const ability = useMoneyAbility();
  const canViewWithDraw = ability.can('read', 'withdraw');
  if (!canViewWithDraw) return null;

  return (
    <div className="space-y-4">
      <PublisherMonetizationButton />
      <PublisherConnectedCards />
      <CreateWithDrawPublisherFormRoot />
      <PublisherWithDrawList />
      {/*<PublisherWithdraw onSuccess={close} />*/}
    </div>
  );
};
const PublisherSettingsContent = () => {
  const {
    data: {
      props: { can_sign_contract = false, can_withdraw_money = false } = {},
      content: { monetization } = {},
    } = {},
  } = useCurrentPublisher();
  return useMemo(() => {
    if (!can_sign_contract) return null;

    if (monetization === Monetization.DECLINED) return <PublisherBanned />;

    if (monetization === Monetization.NOT_CHECKED) return <PublisherNeedLevelUp />;

    // if (monetization === MONETIZATION.HAS_ABILITY) return <h1>Скоро будет</h1>;
    //
    if (can_withdraw_money && monetization === Monetization.ENABLED)
      return <PublisherEnabledPayments />;

    return null;
  }, [can_sign_contract, can_withdraw_money, monetization]);
};

export const PublisherSettingsPayments = () => (
  <>
    <PublisherSettingsContent />
    {/* <TeamActs /> */}
    <PublisherReferralCode />
  </>
);
