'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import EditIcon from '@re/ui-kit/icons/edit';
import { Button } from '@re/ui-kit/ui/button';
import { SkeletonV2 } from '@re/ui-kit/ui/skeleton';
import { cn } from '@re/ui-kit/utils/cn';

import { PublisherCard, PublisherCardSkeleton } from '~entities/publisher/ui/publisher-card';
import { useUserSuspenseQuery } from '~entities/user/model/queries';
import { Routing } from '~shared/config/routing';
import { useSession } from '~shared/lib/session/use-session';
import { Carousel, CarouselContent, CarouselItem, CarouselSkeleton } from '~shared/ui/carousel';
import { EmptyView } from '~shared/ui/empty-view';
import { Section, SectionProps, SectionTitle, SectionTitleProps } from '~shared/ui/section';

const ChangePublisherOrderModal = dynamic(() =>
  import('~features/(publisher)/change-order/change-order').then((m) => m.ChangePublisherOrderModal)
);

export const PublisherEditActions = () => {
  const { id } = useParams<{ id: string }>();
  const session = useSession();

  if (String(session?.id) !== id) return null;

  return (
    <Suspense fallback={<SkeletonV2 className="h-9 min-w-9 rounded-md px-4 text-sm" />}>
      <ChangePublisherOrderModal>
        <Button circle color="background" className="p-2.5" size="sm">
          <EditIcon />
        </Button>
      </ChangePublisherOrderModal>
    </Suspense>
  );
};

export const PublishersMoreButton = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <Button color="background" asChild size="sm">
      <Link
        shallow={false}
        prefetch={false}
        href={Routing.User.detail({ params: { id, tab: 'publishers' } })}
      >
        Показать все
      </Link>
    </Button>
  );
};

interface PublishersSectionRootProps extends SectionProps {}

export const PublishersSectionRoot = (props: PublishersSectionRootProps) => {
  const { children, className, ...rest } = props;

  return (
    <Section className={cn('cs-publishers-section bg-card dark:bg-card', className)} {...rest}>
      {children}
    </Section>
  );
};

interface PublishersSectionTitleProps extends SectionTitleProps {}

export const PublishersSectionTitle = (props: PublishersSectionTitleProps) => {
  const { children, className, ...rest } = props;

  return (
    <SectionTitle className={cn(className)} {...rest}>
      {children}
    </SectionTitle>
  );
};

export const PublishersContent = () => {
  const { id } = useParams<{ id: string }>();
  const { data: user } = useUserSuspenseQuery({ variables: { params: { userId: id } } });
  const publishers = user?.publishers || [];
  const t = useTranslations('reusable');
  if (!publishers.length)
    return <EmptyView text={t('empty_states.empty')} emoji="✨" className="my-auto flex-1" />;

  return (
    <Carousel
      opts={{
        align: 'start',
        dragFree: true,
      }}
      className="w-full"
    >
      <CarouselContent className="">
        {publishers?.map((it) => (
          <CarouselItem
            key={it.id}
            className="basis-1/4 sm:basis-1/4 md:basis-1/4 lg:basis-1/4 xl:basis-1/5 2xl:basis-1/6"
          >
            <Link
              prefetch={false}
              key={it.id}
              href={Routing.Publisher.detail({ params: { dir: it.dir, tab: 'about' } })}
            >
              <PublisherCard model={it} />
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
};

export const PublishersContentSkeleton = () => {
  return (
    <CarouselSkeleton className="h-full w-full">
      <CarouselContent className="">
        {Array.from({ length: 5 }).map((_, index) => (
          <CarouselItem
            key={index}
            className="basis-1/4 sm:basis-1/4 md:basis-1/4 lg:basis-1/4 xl:basis-1/5 2xl:basis-1/6"
          >
            <PublisherCardSkeleton key={index} />
          </CarouselItem>
        ))}
      </CarouselContent>
    </CarouselSkeleton>
  );
};

export const PublishersSection = ({ className }: { className?: string }) => {
  return (
    <PublishersSectionRoot className={className}>
      <PublishersSectionTitle
        aside={
          <div className="flex items-center gap-2">
            <PublisherEditActions />
            <PublishersMoreButton />
          </div>
        }
      >
        Паблишеры
      </PublishersSectionTitle>
      <Suspense fallback={<PublishersContentSkeleton />}>
        <PublishersContent />
      </Suspense>
    </PublishersSectionRoot>
  );
};
