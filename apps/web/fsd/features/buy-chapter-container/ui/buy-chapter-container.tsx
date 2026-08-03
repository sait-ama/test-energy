import React, { type ReactNode, Suspense } from 'react';
import Link from 'next/link';

import { querySuspenseInfiniteOptions, useApiGenSuspenseInfiniteQuery } from '@re/api/exports-core';
import Coin from '@re/ui-kit/icons/coin';
import ExternalLink from '@re/ui-kit/icons/external-link';
import Ticket from '@re/ui-kit/icons/ticket';
import type { ButtonProps } from '@re/ui-kit/ui/button';
import { Button } from '@re/ui-kit/ui/button';
import { ReText } from '@re/ui-kit/ui/text';
import dayjs from 'dayjs';

import { useSiteConfig } from '~app/providers/site-config-provider';
import { useBuyChapter } from '~entities/chapter/model/mutations';
import { reV2TitlesMomentsListInfiniteOptions } from '~entities/moment/model/queries';
import { useCurrentChapter } from '~entities/reader/model/hooks';
import { MomentsMasonryList } from '~features/(moments)/moments-masonry-list/ui/moment-masonry-list';
import { BaseImage } from '~features/error-view/ui/base-image';
import { ErrorBase } from '~features/error-view/ui/error-base';
import { useCurrentPageSuspenseTitleDetail } from '~pages/(title)/title-detail/model/queries';
import { BuyChapterRequestSchema, ChapterSchema, PurchaseType } from '~shared/api/models/chapter';
import { InfoModalType } from '~shared/api/models/info-modal';
import { Routing } from '~shared/config/routing';
import { useAuthModal } from '~shared/lib/auth/use-auth-modal';
import { useChargeModal } from '~shared/lib/charge/use-charge-modal';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { useInfoModal } from '~shared/lib/info-modal/use-info-modal';
import { logger } from '~shared/lib/logger';
import { useLogged } from '~shared/lib/session/use-logged';
import { useSession } from '~shared/lib/session/use-session';
import { TestProps } from '~shared/lib/test/utils/test-props';
import { UrlFormatter } from '~shared/utils/url-formatter';

interface BuyChapterActionsProps {
  chapter: ChapterSchema;
  revalidate: () => void;
}

interface PurchaseButtonProps extends ButtonProps {
  footer?: ReactNode;
}

const PurchaseButton = (props: PurchaseButtonProps) => {
  const { footer, children, ...rest } = props;

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <Button {...rest}>{children}</Button>
      {footer}
    </div>
  );
};

const BuyChapterActions = (props: BuyChapterActionsProps) => {
  const { chapter, revalidate } = props;
  const session = useSession()!;
  const { data } = useCurrentPageSuspenseTitleDetail();
  const { mutateAsync } = useBuyChapter({ chapterId: String(chapter.id) });
  const { open: openChargeModal } = useChargeModal();
  const { open: openAuthModal } = useAuthModal();

  const handleBuy = async (data: BuyChapterRequestSchema) => {
    try {
      await mutateAsync(data);
      revalidate();
    } catch (e: unknown) {
      logger.error(e);
      await resolveErrorAsync(e);
    }
  };

  const handleBuyIfPossible = async (
    fn: (data: BuyChapterRequestSchema) => Promise<void>,
    data: BuyChapterRequestSchema,
    price: number,
    balance: number
  ) => {
    if (!session) {
      openAuthModal();
      return;
    }

    if (price > balance) {
      openChargeModal();
      return;
    }

    await fn(data);
  };

  const canBuyChapterSingle = [PurchaseType.SINGLE, PurchaseType.ALL].includes(
    chapter.purchase_type
  );

  return (
    <div className="flex flex-col justify-center gap-8">
      <div className="flex items-start justify-center gap-4">
        {canBuyChapterSingle ? (
          <>
            <PurchaseButton
              {...TestProps.id(`coins_buy_chapter_btn`)}
              onClick={() =>
                handleBuyIfPossible(
                  handleBuy,
                  {
                    chapter: chapter.id,
                    currency: 'money',
                  },
                  parseFloat(chapter.price),
                  parseFloat(session?.balance ?? '0.00')
                )
              }
              footer={
                session ? (
                  <ReText color="muted-foreground">{parseFloat(session.balance)} монет</ReText>
                ) : null
              }
              endIcon={<Coin />}
            >
              Открыть за {parseFloat(chapter.price)}
            </PurchaseButton>
            {session?.ticket_balance ? (
              <PurchaseButton
                {...TestProps.id(`tiket_buy_chapter_btn`)}
                onClick={() => handleBuy({ chapter: chapter.id, currency: 'tickets' })}
                footer={<ReText color="muted-foreground">{session.ticket_balance} тикетов</ReText>}
                endIcon={<Ticket />}
              >
                Открыть за 1
              </PurchaseButton>
            ) : null}
          </>
        ) : null}
      </div>
      {session && !data!.is_licensed && session.can_buy_premium_type === 1 ? (
        <Link prefetch={false} href={Routing.User.subscription()}>
          <PurchaseButton
            footer={<ReText color="muted-foreground">И читать все тайтлы по ней</ReText>}
          >
            Открыть по подписке
          </PurchaseButton>
        </Link>
      ) : null}
      {chapter.volume ? (
        <PurchaseButton
          {...TestProps.id(`ticket_buy_chapter_btn`)}
          onClick={() =>
            handleBuyIfPossible(
              handleBuy,
              { volume: chapter.volume_id },
              parseFloat(chapter.volume!.price),
              parseFloat(session?.balance ?? '0.00')
            )
          }
          footer={
            <>
              {session ? (
                <ReText color="muted-foreground">{parseFloat(session.balance)} монет</ReText>
              ) : null}

              <ReText color="muted-foreground" align="center">
                В том входят {chapter.volume.chapters.length} глав <br /> (том{' '}
                {chapter.volume.chapters[0].tome} глава {chapter.volume.chapters[0].chapter} - том{' '}
                {chapter.volume.chapters.at(-1)!.tome} глава{' '}
                {chapter.volume.chapters.at(-1)!.chapter})
              </ReText>
            </>
          }
          endIcon={<Coin />}
        >
          Купить том за {chapter.volume.price}
        </PurchaseButton>
      ) : null}
      <Suspense>
        <ChapterMoments chapter={chapter} />
      </Suspense>
    </div>
  );
};

interface ChapterMomentsProps {
  chapter: ChapterSchema;
}

const ChapterMoments = (props: ChapterMomentsProps) => {
  const { chapter } = props;
  const options = reV2TitlesMomentsListInfiniteOptions({
    api: { query: { chapter_id: chapter.id } },
    suspense: true,
  });

  const { data } = useApiGenSuspenseInfiniteQuery(options);
  const { open } = useInfoModal();

  if (!data?.pages?.flatMap((it) => it.results)?.length) return null;

  const handleShowMoments = () => {
    open({
      type: InfoModalType.CUSTOM,
      srOnly: 'Моменты из главы',
      contentProps: {
        className: 'sm:max-w-2xl',
      },
      content: (
        <div className="flex w-full flex-col gap-4">
          <ReText size="lg" weight="semibold" align="center">
            Моменты из том {chapter.tome} главы {chapter.chapter}
          </ReText>
          <MomentsMasonryList options={querySuspenseInfiniteOptions(options)} />
        </div>
      ),
    });
  };

  return (
    <Button
      variant="secondary"
      endIcon={<ExternalLink className="rotate-45" />}
      onClick={handleShowMoments}
    >
      Моменты из этой главы
    </Button>
  );
};

interface BuyChapterContainerProps {
  children: ReactNode;
}

export const BuyChapterContainer = (props: BuyChapterContainerProps) => {
  const { children } = props;
  const isLogged = useLogged();

  const { data, refetch } = useCurrentChapter();
  const datetimeFormat = useSiteConfig((v) => v.localization.datetimeFormat);

  if (data.is_paid && !data.is_bought) {
    // if (!isLogged)
    //   throw new ApiError({
    //     statusCode: 401,
    //     detail: { server: 'Необходимо войти в аккаунт' },
    //   });

    return (
      <div className="flex h-screen w-full items-center justify-center">
        <ErrorBase
          status={423}
          image={
            <BaseImage
              width={288}
              height={358}
              src={UrlFormatter.media('public/subscription/premiumAnimeArt2.webp')}
            />
          }
          label={
            <ReText weight="semibold" size="2xl" align="center" className="relative">
              Том {data.tome} глава {data.chapter}
            </ReText>
          }
          text={data.pub_date ? `Откроется ${dayjs(data.pub_date).format(datetimeFormat)}` : ''}
          actions={<BuyChapterActions chapter={data} revalidate={refetch} />}
        />
      </div>
    );
  }

  return children;
};
