'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import LockIcon from '@re/ui-kit/icons/lock';
import QuestionMark from '@re/ui-kit/icons/question-mark';
import { Button } from '@re/ui-kit/ui/button';
import { SkeletonV2 } from '@re/ui-kit/ui/skeleton';
import { cn } from '@re/ui-kit/utils/cn';

import { useHeroCardsByUserInfinite } from '~entities/inventory/model/queries';
import { HeroCard, HeroCardSkeletonV2 } from '~entities/inventory/ui/hero-card';
import { useUserSuspenseQuery } from '~entities/user/model/queries';
import { InfoModalTrigger } from '~features/info-modal';
import { InfoModalType } from '~shared/api/models/info-modal';
import { Routing } from '~shared/config/routing';
import { useHeroCardModal } from '~shared/lib/card/use-card-modal';
import { useLogged } from '~shared/lib/session/use-logged';
import { useSession } from '~shared/lib/session/use-session';
import { EmptyView } from '~shared/ui/empty-view';
import { Section, SectionProps, SectionTitle, SectionTitleProps } from '~shared/ui/section';

export const HeroCardsSectionRoot = (props: SectionProps) => {
  const { children, className, ...rest } = props;

  return (
    <Section
      {...rest}
      className={cn(
        'space-y-lg bg-card dark:bg-card cs-cards-section col-span-full min-h-[320px] w-full',
        className
      )}
    >
      {children}
    </Section>
  );
};

interface HeroCardsSectionTitleProps extends SectionTitleProps {}

export const HeroCardsSectionTitle = (props: HeroCardsSectionTitleProps) => {
  const { children, className, ...rest } = props;

  return (
    <SectionTitle className={cn(className)} {...rest}>
      {children}
    </SectionTitle>
  );
};

export const HeroCardSuggestExchangeButton = () => {
  const { id } = useParams<{ id: string }>();

  const { data: user } = useUserSuspenseQuery({ variables: { params: { userId: id } } });
  const isLogged = useLogged();
  const session = useSession();

  const isCurrentUser = isLogged && id === String(session?.id ?? '0');

  if (!isLogged || isCurrentUser) return null;

  if (!user!.is_exchanges_enable)
    return (
      <Button disabled color="background" endIcon={<LockIcon />} size="sm">
        Не принимает обмены
      </Button>
    );

  return (
    <Button color="background" size="sm">
      <Link href={Routing.User.createExchange({ params: { id } })}>Предложить обмен</Link>
    </Button>
  );
};

export const HeroCardsContentRoot = (props: React.ComponentProps<'div'>) => {
  const { className, children, ...rest } = props;

  return (
    <div
      className={cn(
        'xs:grid-cols-3 -mx-2 grid grid-cols-3 gap-2 md:grid-cols-4 lg:grid-cols-6',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
};

export const HeroCardsContentSkeleton = () => {
  return (
    <HeroCardsContentRoot>
      {Array(8)
        .fill(null)
        .map((_, idx) => (
          <HeroCardSkeletonV2 key={idx} />
        ))}
    </HeroCardsContentRoot>
  );
};

const HeroCardsContent = () => {
  const { id } = useParams<{ id: string }>();
  const { data } = useHeroCardsByUserInfinite({
    variables: { params: { userId: id }, query: { is_favorite: 1 } },
  });
  const { setCard } = useHeroCardModal();

  const cards = data?.pages?.flatMap((it) => it.results) || [];

  if (!cards.length) return <EmptyView text="Пусто" emoji="🎴" className="my-auto flex-1" />;

  return (
    <HeroCardsContentRoot>
      {cards.map((it) => (
        <HeroCard
          key={it.id}
          card={it.card}
          withHover
          onClick={() => {
            setCard(it.card);
          }}
        />
      ))}
    </HeroCardsContentRoot>
  );
};

export const HeroCardsSection = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <HeroCardsSectionRoot>
      <HeroCardsSectionTitle
        textClassName="flex items-center gap-2"
        className="gap-2"
        aside={
          <div className="flex gap-2">
            <Suspense fallback={<SkeletonV2 className="bg-skeleton h-9 w-18" />}>
              <HeroCardSuggestExchangeButton />
            </Suspense>
            <Button color="background" asChild size="sm" className="hidden md:visible">
              <Link
                href={Routing.User.detail({
                  params: {
                    id,
                    tab: 'inventory',
                  },
                  query: { type: 'cards' },
                })}
              >
                Показать все
              </Link>
            </Button>
          </div>
        }
      >
        Избранные карточки
        <InfoModalTrigger
          asChild
          options={{ type: InfoModalType.ENTRY, entryId: 71 /* todo: siteConfig */ }}
        >
          <Button color="background" circle size="xs" className="text-muted-foreground">
            <QuestionMark size={16} />
          </Button>
        </InfoModalTrigger>
      </HeroCardsSectionTitle>
      <Suspense fallback={<HeroCardsContentSkeleton />}>
        <HeroCardsContent />
      </Suspense>
    </HeroCardsSectionRoot>
  );
};
