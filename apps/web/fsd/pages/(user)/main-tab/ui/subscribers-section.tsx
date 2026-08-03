'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { Button } from '@re/ui-kit/ui/button';
import { cn } from '@re/ui-kit/utils/cn';

import { VerticalUserCardV2 } from '~entities/user/ui/vertical-user-card';
import { useSuspenseFollowersPaginatedListQuery } from '~entities/user-subscriptions/model/queries';
import { Routing } from '~shared/config/routing';
import { useTourItem } from '~shared/lib/tour/items';
import { Carousel, CarouselContent, CarouselItem, CarouselSkeleton } from '~shared/ui/carousel';
import { EmptyView } from '~shared/ui/empty-view';
import { Section, SectionProps, SectionTitle, SectionTitleProps } from '~shared/ui/section';

export const SubscribersSectionRoot = (props: SectionProps) => {
  const { children, className, ...rest } = props;

  return (
    <Section
      {...rest}
      className={cn('cs-subscribers-section bg-card dark:bg-card w-full', className)}
    >
      {children}
    </Section>
  );
};

interface SubscribersSectionTitleProps extends SectionTitleProps {}

export const SubscribersSectionTitle = (props: SubscribersSectionTitleProps) => {
  const { children, className, ...rest } = props;

  return (
    <SectionTitle className={cn(className)} {...rest}>
      {children}
    </SectionTitle>
  );
};

export const SubscribersMoreButton = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <Button color="background" asChild size="sm">
      <Link shallow={false} prefetch={false} href={Routing.User.followers({ params: { id } })}>
        Показать все
      </Link>
    </Button>
  );
};

export const SubscribersContent = () => {
  const { id } = useParams<{ id: string }>();
  const { data } = useSuspenseFollowersPaginatedListQuery({
    variables: { query: { id: Number(id), page: 1, count: 20, sub_type: 'author_users' } },
  });
  const subscribers = data?.pages.flatMap((v) => v.results) || [];

  if (!subscribers?.length)
    return <EmptyView className="col-span-full" text="Список подписчиков пуст" />;

  return (
    <Carousel
      opts={{
        align: 'start',
        dragFree: true,
      }}
      className="w-full"
    >
      <CarouselContent>
        {subscribers?.map((it) => (
          <CarouselItem
            key={it.id}
            className="basis-1/3 sm:basis-1/3 md:basis-1/3 lg:basis-1/4 xl:basis-1/4 2xl:basis-1/5"
          >
            <VerticalUserCardV2 className="border-0" key={it.id} model={it} />
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
};

export const SubscribersSectionSkeleton = () => {
  return (
    <CarouselSkeleton className="h-full w-full">
      <CarouselContent>
        {Array.from({ length: 5 }).map((_, index) => (
          <CarouselItem
            key={index}
            className="basis-1/3 sm:basis-1/3 md:basis-1/3 lg:basis-1/4 xl:basis-1/4 2xl:basis-1/5"
          >
            <VerticalUserCardV2 className="border-0" isLoading model={null} key={index} />
          </CarouselItem>
        ))}
      </CarouselContent>
    </CarouselSkeleton>
  );
};

export const SubscribersSection = ({ className }: { className?: string }) => {
  const subscribersTourProps = useTourItem('user-detail-about-followers');

  return (
    <SubscribersSectionRoot className={className} {...subscribersTourProps}>
      <SubscribersSectionTitle className="h-9" aside={<SubscribersMoreButton />}>
        Подписчики
      </SubscribersSectionTitle>
      <Suspense fallback={<SubscribersSectionSkeleton />}>
        <SubscribersContent />
      </Suspense>
    </SubscribersSectionRoot>
  );
};
