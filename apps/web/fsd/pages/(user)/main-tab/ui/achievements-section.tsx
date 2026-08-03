'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { Button } from '@re/ui-kit/ui/button';
import { cn } from '@re/ui-kit/utils/cn';

import { AchievementSkeleton } from '~entities/achievements/ui/achievement-card';
import { AchievementCardWithModal } from '~entities/achievements/ui/achievement-card-with-modal';
import { useUserAchievements } from '~entities/user/model/queries';
import { Routing } from '~shared/config/routing';
import { useTourItem } from '~shared/lib/tour/items';
import { Carousel, CarouselContent, CarouselItem, CarouselSkeleton } from '~shared/ui/carousel';
import { EmptyView } from '~shared/ui/empty-view';
import { Section, SectionProps, SectionTitle, SectionTitleProps } from '~shared/ui/section';

export const AchievementsSectionRoot = (props: SectionProps) => {
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

interface AchievementsTitleProps extends SectionTitleProps {}

export const AchievementsSectionTitle = (props: AchievementsTitleProps) => {
  const { children, className, ...rest } = props;

  return (
    <SectionTitle className={cn(className)} {...rest}>
      {children}
    </SectionTitle>
  );
};

const AchievementsContent = () => {
  const { id } = useParams<{ id: string }>();
  const t = useTranslations('reusable.empty_states');
  const { data } = useUserAchievements({
    variables: { params: { userId: id } },
  });

  const achievements = data?.pages.flatMap((it) => it.results) || [];

  if (!achievements.length) return <EmptyView text={t('empty')} emoji="📛" />;

  return (
    <Carousel
      opts={{
        align: 'start',
        dragFree: true,
      }}
      className="w-full"
    >
      <CarouselContent className="">
        {achievements?.map((model, idx) => (
          <CarouselItem
            key={idx}
            className="basis-1/4 sm:basis-1/5 md:basis-1/6 lg:basis-1/5 xl:basis-1/6 2xl:basis-1/7"
          >
            <AchievementCardWithModal model={model} />
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
};

export const AchievementsContentSkeleton = () => {
  return (
    <CarouselSkeleton className="h-full w-full">
      <CarouselContent className="">
        {Array.from({ length: 8 }).map((_, index) => (
          <CarouselItem
            key={index}
            className="basis-1/4 sm:basis-1/5 md:basis-1/6 lg:basis-1/5 xl:basis-1/6 2xl:basis-1/7"
          >
            <AchievementSkeleton />
          </CarouselItem>
        ))}
      </CarouselContent>
    </CarouselSkeleton>
  );
};

export const AchievementsSection = () => {
  const { id } = useParams<{ id: string }>();
  const t = useTranslations('character.sections');
  const tActions = useTranslations('reusable.actions');
  const achievementsTourProps = useTourItem('user-detail-about-achievements');

  return (
    <AchievementsSectionRoot {...achievementsTourProps}>
      <AchievementsSectionTitle
        textClassName="flex items-center gap-2"
        aside={
          <Button color="background" asChild size="sm">
            <Link
              shallow={false}
              prefetch={false}
              href={Routing.User.achievements({ params: { id } })}
            >
              {tActions('show_all')}
            </Link>
          </Button>
        }
      >
        {t('achievements')}
      </AchievementsSectionTitle>
      <Suspense fallback={<AchievementsContentSkeleton />}>
        <AchievementsContent />
      </Suspense>
    </AchievementsSectionRoot>
  );
};
