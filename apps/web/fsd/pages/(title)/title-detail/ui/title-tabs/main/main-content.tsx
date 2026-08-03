import { ComponentPropsWithoutRef, Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { Skeleton } from '@re/ui-kit/ui/skeleton';
import { cn } from '@re/ui-kit/utils/cn';

import { TitleExternalAdaptation } from '~features/title-external-adaptation/ui/title-external-adaptation';
import { RatingsCard } from '~features/title-rating/ui/ratins-card';
import { BottomActionsMobile } from '~pages/(title)/title-detail/ui/bottom-actions';
import { Collections } from '~pages/(title)/title-detail/ui/fragments/collections';
import { TagList } from '~pages/(title)/title-detail/ui/title-tabs/main/info-section';
import { NotesSection } from '~pages/(title)/title-detail/ui/title-tabs/main/notes-section';
import { EntityLayoutStatsLineItemContent } from '~shared/ui/entity-layout';

import { Description } from './description';
import { InfoSection } from './info-section';
import { RelatedTitlesSection } from './related-titles-section';

export interface MainContentProps extends ComponentPropsWithoutRef<'div'> {
  className?: string;
}

export const MainContent = (props: MainContentProps) => {
  const { className, ...rest } = props;

  return (
    <div className={cn('flex min-w-0 flex-col gap-y-2', className)} {...rest}>
      <Suspense
        fallback={
          <Skeleton inline className="flex flex-col rounded-md p-4 max-sm:aspect-4/1 md:h-26" />
        }
      >
        <Description />
      </Suspense>
      <Suspense fallback={<Skeleton inline className="flex h-20 flex-col rounded-md p-4" />}>
        <EntityLayoutStatsLineItemContent className="bg-secondary dark:bg-background/50 flex flex-wrap gap-x-2 gap-y-1.5 rounded-md border-none p-2 md:p-4 dark:max-sm:p-0">
          <TagList />
        </EntityLayoutStatsLineItemContent>
      </Suspense>
      <Suspense fallback={<Skeleton inline className="flex aspect-5/2 flex-col rounded-md p-4" />}>
        <InfoSection />
      </Suspense>
      <Suspense fallback={<Skeleton inline className="flex aspect-4/1 flex-col rounded-md p-4" />}>
        <TitleExternalAdaptation />
      </Suspense>
      <Suspense fallback={null}>
        <NotesSection />
      </Suspense>
      <Suspense fallback={null}>
        <ErrorBoundary fallback={null}>
          <RelatedTitlesSection />
        </ErrorBoundary>
      </Suspense>
      <Suspense fallback={null}>
        <Collections />
      </Suspense>
      <Suspense fallback={null}>
        <RatingsCard />
      </Suspense>
      <BottomActionsMobile />
      {/*<RateTitleSection />*/}
    </div>
  );
};
