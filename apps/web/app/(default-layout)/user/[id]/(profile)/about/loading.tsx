import React from 'react';

import { SkeletonV2 } from '@re/ui-kit/ui/skeleton';

import {
  AchievementsContentSkeleton,
  AchievementsSectionRoot,
} from '~pages/(user)/main-tab/ui/achievements-section';
import { BadgesContentSkeleton, BadgesSectionRoot } from '~pages/(user)/main-tab/ui/badges-section';
import { GuildsSectionRoot, GuildsSectionSkeleton } from '~pages/(user)/main-tab/ui/guilds-section';
import {
  HeroCardsContentSkeleton,
  HeroCardsSectionRoot,
} from '~pages/(user)/main-tab/ui/hero-cards-section';
import {
  PublishersContentSkeleton,
  PublishersSectionRoot,
} from '~pages/(user)/main-tab/ui/publishers-section';
import { EntityLayoutStatsItemSkeleton, EntityLayoutStatsRoot } from '~shared/ui/entity-layout';

export default function RootLoading() {
  return (
    <div className="flex flex-col gap-2 lg:grid lg:grid-cols-[400px_minmax(0,_888px)]">
      <EntityLayoutStatsRoot>
        {Array(6)
          .fill(null)
          .map((_, idx) => (
            <EntityLayoutStatsItemSkeleton key={idx} />
          ))}
      </EntityLayoutStatsRoot>

      <div className="flex flex-col gap-2">
        <BadgesSectionRoot>
          <SkeletonV2 className="bg-skeleton my-1 h-7 w-1/4" />
          <BadgesContentSkeleton />
        </BadgesSectionRoot>
        <AchievementsSectionRoot>
          <SkeletonV2 className="bg-skeleton my-1 h-7 w-1/4" />
          <AchievementsContentSkeleton />
        </AchievementsSectionRoot>
      </div>
      <HeroCardsSectionRoot className="cols-span-full">
        <SkeletonV2 className="bg-skeleton my-1 h-7 w-1/4" />
        <HeroCardsContentSkeleton />
      </HeroCardsSectionRoot>
      <div className="col-span-full flex w-full flex-col gap-2 md:flex-row">
        <PublishersSectionRoot className="md:flex-[0_1_50%]">
          <SkeletonV2 className="bg-skeleton my-1 h-7 w-1/4" />
          <PublishersContentSkeleton />
        </PublishersSectionRoot>
        <GuildsSectionRoot>
          <SkeletonV2 className="bg-skeleton my-1 h-7 w-1/4" />
          <GuildsSectionSkeleton />
        </GuildsSectionRoot>
      </div>
    </div>
  );
}
