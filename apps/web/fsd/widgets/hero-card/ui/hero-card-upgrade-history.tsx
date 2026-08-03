import { Suspense } from 'react';
import { useTranslations } from 'next-intl';

import dayjs from 'dayjs';

import ArrowRightIcon from '@re/ui-kit/icons/arrow-right';
import { Button } from '@re/ui-kit/ui/button';
import { DialogLoading } from '@re/ui-kit/ui/dialog-loading';
import { ReText } from '@re/ui-kit/ui/text';

import { useUpgradeHistoryInfinite } from '~entities/inventory/model/queries';
import { HeroCard } from '~entities/inventory/ui/hero-card';
import { HeroCardUpgradeSchema } from '~shared/api/models/inventory';
import { FlatList as _FlatList, FlatListType } from '~shared/ui/flat-list-v2';
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalTitle,
  ResponsiveModalTrigger,
} from '~shared/ui/responsive-modal';

const UpgradeCard = (props: { model: HeroCardUpgradeSchema }) => {
  const { model } = props;

  const t = useTranslations('user.pages.upgrade-cards');

  return (
    <div>
      <div className="flex justify-between">
        <ReText weight="semibold">
          {model.old_cards_objects.length === 2
            ? t('history-default-label')
            : t('history-exclusive-label')}
        </ReText>
        <ReText weight="medium" size="sm" align="end">
          {dayjs(model.created_at).format('DD.MM.YYYY')}
        </ReText>
      </div>
      <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
        <div>
          <ReText weight="medium" size="sm" color="muted-foreground">
            {t('history-old-cards-label')}
          </ReText>
          <div className="mt-2 grid grid-cols-3 gap-3 md:flex">
            {model.old_cards_objects.map((item) => (
              <HeroCard card={item} className="md:w-[140px] lg:w-[186px]" />
            ))}
          </div>
        </div>

        <div className="border-border flex size-10 items-center justify-center rounded-full border">
          <ArrowRightIcon className="rotate-90 md:rotate-0" />
        </div>
        <div>
          <ReText weight="medium" size="sm" color="muted-foreground" align="start">
            {t('history-new-card-label')}
          </ReText>
          <div className="mt-2 grid grid-cols-3 md:grid-cols-1">
            <HeroCard
              className="md:w-[140px] md:justify-self-end lg:w-[186px]"
              card={model.new_card}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const UpgradeContent = () => {
  const t = useTranslations('user.pages.upgrade-cards');
  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useUpgradeHistoryInfinite({ variables: {} });

  const upgrades = data.pages?.flatMap((it) => it.results);

  const FlatList: FlatListType<typeof upgrades> = _FlatList;

  return (
    <>
      <ResponsiveModalTitle className="sr-only">{t('history-modal-sr-only')}</ResponsiveModalTitle>
      <FlatList.Root
        content={upgrades}
        isLoading={isLoading}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
      >
        <FlatList.Container className="grid grid-cols-1 gap-4">
          <FlatList.Content>{({ item }) => <UpgradeCard model={item} />}</FlatList.Content>

          <FlatList.Loading count={20}>
            {({ key }) => <div key={key} className="animate-pulse duration-200" />}
          </FlatList.Loading>
          <FlatList.Empty text="Пусто" emoji="🎴" className="col-span-full" />
          <FlatList.EdgeTrigger
            onTrigger={fetchNextPage}
            canTrigger={!isFetchingNextPage && hasNextPage}
          />
        </FlatList.Container>
      </FlatList.Root>
    </>
  );
};

export const HeroCardUpgradeHistory = ({ className }: { className?: string }) => {
  const t = useTranslations('user.pages.upgrade-cards');

  return (
    <ResponsiveModal>
      <ResponsiveModalTrigger asChild>
        <Button size="sm" className={className} color="secondary">
          {t.rich('history-button-text')}
        </Button>
      </ResponsiveModalTrigger>
      <ResponsiveModalContent className="z-[52] flex w-full !max-w-full flex-col overflow-y-scroll max-sm:pt-16 lg:max-w-[950px]!">
        <Suspense fallback={<DialogLoading />}>
          <UpgradeContent />
        </Suspense>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
};
