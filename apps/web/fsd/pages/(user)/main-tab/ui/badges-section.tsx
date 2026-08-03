'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import QuestionMark from '@re/ui-kit/icons/question-mark';
import { Button } from '@re/ui-kit/ui/button';
import { cn } from '@re/ui-kit/utils/cn';

import { useUserBadges } from '~entities/user/model/queries';
import { BadgeSkeleton, BadgeWithModal } from '~entities/user/ui/badge-card';
import { InfoModalTrigger } from '~features/info-modal';
import { InfoModalType } from '~shared/api/models/info-modal';
import { Routing } from '~shared/config/routing';
import { Carousel, CarouselContent, CarouselItem, CarouselSkeleton } from '~shared/ui/carousel';
import { EmptyView } from '~shared/ui/empty-view';
import { Section, SectionProps, SectionTitle, SectionTitleProps } from '~shared/ui/section';

export const BadgesSectionRoot = (props: SectionProps) => {
  const { children, className, ...rest } = props;

  return (
    <Section
      {...rest}
      className={cn(
        'cs-rewards-section bg-card dark:bg-card space-y-lg w-full flex-[0_1_50%] overflow-hidden',
        className
      )}
    >
      {children}
    </Section>
  );
};

interface BadgesTitleProps extends SectionTitleProps {}

export const BadgesSectionTitle = (props: BadgesTitleProps) => {
  const { children, className, ...rest } = props;

  return (
    <SectionTitle className={cn(className)} {...rest}>
      {children}
    </SectionTitle>
  );
};

const BadgesContent = () => {
  const { id } = useParams<{ id: string }>();
  const t = useTranslations('reusable.empty_states');
  const { data } = useUserBadges({
    variables: { params: { userId: id } },
  });

  const badges = data?.pages.flatMap((it) => it.results) || [];

  if (!badges?.length) return <EmptyView text={t('empty')} emoji="📛" />;

  return (
    <Carousel
      opts={{
        align: 'start',
        dragFree: true,
      }}
      className="w-full"
    >
      <CarouselContent className="">
        {badges?.map((model) => (
          <CarouselItem
            key={model.id}
            className="basis-1/4 sm:basis-1/5 md:basis-1/6 lg:basis-1/5 xl:basis-1/6 2xl:basis-1/7"
          >
            <BadgeWithModal model={model} />
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
};

export const BadgesContentSkeleton = () => {
  return (
    <CarouselSkeleton className="h-full w-full">
      <CarouselContent className="">
        {Array.from({ length: 8 }).map((_, index) => (
          <CarouselItem
            key={index}
            className="basis-1/4 sm:basis-1/5 md:basis-1/6 lg:basis-1/5 xl:basis-1/6 2xl:basis-1/7"
          >
            <BadgeSkeleton />
          </CarouselItem>
        ))}
      </CarouselContent>
    </CarouselSkeleton>
  );
};

export const BadgesSection = () => {
  const { id } = useParams<{ id: string }>();
  const t = useTranslations('character.sections');
  const tActions = useTranslations('reusable.actions');

  return (
    <BadgesSectionRoot>
      <BadgesSectionTitle
        textClassName="flex items-center gap-2"
        aside={
          <Button color="background" asChild size="sm">
            <Link shallow={false} prefetch={false} href={Routing.User.badges({ params: { id } })}>
              {tActions('show_all')}
            </Link>
          </Button>
        }
      >
        {t('badges')}
        <InfoModalTrigger
          asChild
          options={{ type: InfoModalType.ENTRY, entryId: 10 /* todo: siteConfig */ }}
        >
          <Button color="background" circle size="xs" className="text-muted-foreground">
            <QuestionMark size={16} />
          </Button>
        </InfoModalTrigger>
      </BadgesSectionTitle>
      <Suspense fallback={<BadgesContentSkeleton />}>
        <BadgesContent />
      </Suspense>
    </BadgesSectionRoot>
  );
};
