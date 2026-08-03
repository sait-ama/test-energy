'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { useInfiniteQuery } from '@tanstack/react-query';

import { getV2NextPageParam } from '@re/api/exports-core';
import { Button } from '@re/ui-kit/ui/button';
import { cn } from '@re/ui-kit/utils/cn';

import { getClubsInfiniteListOptions } from '~entities/guild/api/queries';
import {
  VerticalGuildCard,
  VerticalGuildCardSkeleton,
} from '~entities/guild/ui/vertical-guild-card';
import { useUserSuspenseQuery } from '~entities/user/model/queries';
import { client } from '~shared/api/client';
import { Routing } from '~shared/config/routing';
import { Carousel, CarouselContent, CarouselItem, CarouselSkeleton } from '~shared/ui/carousel';
import { EmptyView } from '~shared/ui/empty-view';
import { Section, SectionProps, SectionTitle, SectionTitleProps } from '~shared/ui/section';

export const GuildsSectionRoot = (props: SectionProps) => {
  const { children, className, ...rest } = props;

  return (
    <Section {...rest} className={cn('cs-members-section bg-card dark:bg-card w-full', className)}>
      {children}
    </Section>
  );
};

interface GuildsSectionTitleProps extends SectionTitleProps {}

export const GuildsSectionTitle = (props: GuildsSectionTitleProps) => {
  const { children, className, ...rest } = props;

  return (
    <SectionTitle className={cn(className)} {...rest}>
      {children}
    </SectionTitle>
  );
};

export const GuildsMoreButton = () => {
  const { id } = useParams<{ id: string }>();
  return (
    <Button color="background" asChild size="sm">
      <Link
        shallow={false}
        prefetch={false}
        href={Routing.User.detail({ params: { id, tab: 'guilds' } })}
      >
        Показать все
      </Link>
    </Button>
  );
};

export const GuildsContent = () => {
  const { id } = useParams<{ id: string }>();
  const { data: userData } = useUserSuspenseQuery({ variables: { params: { userId: id } } });
  const { data } = useInfiniteQuery({
    ...getClubsInfiniteListOptions({ client, query: { user_id: id ? Number(id) : undefined } }),
    getNextPageParam: getV2NextPageParam,
  });

  const clubs = data?.pages.flatMap((v) => v.results) || [];

  if (!clubs?.length) return <EmptyView className="col-span-full" text="Список гильдий пуст" />;

  return (
    <Carousel
      opts={{
        align: 'start',
        dragFree: true,
      }}
      className="w-full"
    >
      <CarouselContent>
        {clubs?.map((it) => (
          <CarouselItem
            key={it.id}
            className="basis-1/4 sm:basis-1/4 md:basis-1/4 lg:basis-1/4 xl:basis-1/5 2xl:basis-1/6"
          >
            <VerticalGuildCard isMain={userData?.main_club?.id == it.id} key={it.id} model={it} />
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
};

export const GuildsSectionSkeleton = () => {
  return (
    <CarouselSkeleton className="h-full w-full">
      <CarouselContent>
        {Array.from({ length: 5 }).map((_, index) => (
          <CarouselItem
            key={index}
            className="basis-1/4 sm:basis-1/4 md:basis-1/4 lg:basis-1/4 xl:basis-1/5 2xl:basis-1/6"
          >
            <VerticalGuildCardSkeleton key={index} />
          </CarouselItem>
        ))}
      </CarouselContent>
    </CarouselSkeleton>
  );
};

export const GuildsSection = ({ className }: { className?: string }) => {
  return (
    <GuildsSectionRoot className={className}>
      <GuildsSectionTitle
        className="h-9"
        // aside={<GuildsMoreButton />}
      >
        Гильдии
      </GuildsSectionTitle>
      <Suspense fallback={<GuildsSectionSkeleton />}>
        <GuildsContent />
      </Suspense>
    </GuildsSectionRoot>
  );
};
