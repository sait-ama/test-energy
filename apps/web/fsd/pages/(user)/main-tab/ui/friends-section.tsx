'use client';

import { ComponentProps, Suspense } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { Button } from '@re/ui-kit/ui/button';
import { cn } from '@re/ui-kit/utils/cn';

import { useSuspenseFriendsPaginatedListQuery } from '~entities/friend/model/queries';
import { VerticalUserCardV2 } from '~entities/user/ui/vertical-user-card';
import { Routing } from '~shared/config/routing';
import { useTourItem } from '~shared/lib/tour/items';
import { Carousel, CarouselContent, CarouselItem, CarouselSkeleton } from '~shared/ui/carousel';
import { EmptyView } from '~shared/ui/empty-view';
import { Section, SectionProps, SectionTitle, SectionTitleProps } from '~shared/ui/section';

export const FriendsSectionRoot = (props: SectionProps) => {
  const { children, className, ...rest } = props;

  return (
    <Section {...rest} className={cn('cs-friends-section bg-card dark:bg-card', className)}>
      {children}
    </Section>
  );
};

interface FriendsSectionTitleProps extends SectionTitleProps {}

export const FriendsSectionTitle = (props: FriendsSectionTitleProps) => {
  const { children, className, ...rest } = props;

  return (
    <SectionTitle className={cn(className)} {...rest}>
      {children}
    </SectionTitle>
  );
};

export const FriendsContentRoot = (props: ComponentProps<'ul'>) => {
  const { className, children, ...rest } = props;

  return (
    <ul
      {...rest}
      className={cn(
        'grid w-full auto-rows-fr grid-cols-3 gap-4 sm:grid-cols-4 md:flex md:flex-wrap',
        className
      )}
    >
      {children}
    </ul>
  );
};

export const FriendsMoreButton = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <Button color="background" asChild size="sm">
      <Link
        shallow={false}
        prefetch={false}
        href={Routing.User.detail({ params: { id, tab: 'friends' } })}
      >
        Показать все
      </Link>
    </Button>
  );
};

export const FriendsContent = () => {
  const { id } = useParams<{ id: string }>();
  const { data } = useSuspenseFriendsPaginatedListQuery({
    variables: { params: { userId: Number(id) }, query: { page: 1, count: 20 } },
  });

  const friends = data?.pages.flatMap((v) => v.results) || [];

  if (!friends?.length) return <EmptyView className="col-span-full" text="Список друзей пуст" />;

  return (
    <Carousel
      opts={{
        align: 'start',
        dragFree: true,
      }}
      className="w-full"
    >
      <CarouselContent>
        {friends?.map((it) => (
          <CarouselItem
            key={it.id}
            className="basis-1/3 sm:basis-1/3 md:basis-1/3 lg:basis-1/4 xl:basis-1/4 2xl:basis-1/5"
          >
            <VerticalUserCardV2 key={it.id} model={it} />
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
};

export const FriendsSectionSkeleton = () => {
  return (
    <CarouselSkeleton className="h-full w-full">
      <CarouselContent>
        {Array.from({ length: 5 }).map((_, index) => (
          <CarouselItem
            key={index}
            className="basis-1/3 sm:basis-1/3 md:basis-1/3 lg:basis-1/4 xl:basis-1/4 2xl:basis-1/5"
          >
            <VerticalUserCardV2 isLoading model={null} key={index} />
          </CarouselItem>
        ))}
      </CarouselContent>
    </CarouselSkeleton>
  );
};

export const FriendsSection = ({ className }: { className?: string }) => {
  const friendsTourProps = useTourItem('user-detail-about-friends');

  return (
    <FriendsSectionRoot className={className} {...friendsTourProps}>
      <FriendsSectionTitle className="h-9" aside={<FriendsMoreButton />}>
        Друзья
      </FriendsSectionTitle>
      <Suspense fallback={<FriendsSectionSkeleton />}>
        <FriendsContent />
      </Suspense>
    </FriendsSectionRoot>
  );
};
