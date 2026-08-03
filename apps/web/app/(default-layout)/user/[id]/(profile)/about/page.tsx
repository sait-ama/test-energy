import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';

import { getHeroCardsByUserInfiniteQuery } from '~entities/inventory/model/queries';
import {
  getSuspenseUserQuery,
  getUserAchievementsQuery,
  getUserBadgesKey,
} from '~entities/user/model/queries';
import { UserDetailBreadcrumbsLd } from '~pages/(user)/ld';
import { AchievementsSection } from '~pages/(user)/main-tab/ui/achievements-section';
import { BadgesSection } from '~pages/(user)/main-tab/ui/badges-section';
import { CommentsSection } from '~pages/(user)/main-tab/ui/comments-section';
import { FriendsSection } from '~pages/(user)/main-tab/ui/friends-section';
import { GuildsSection } from '~pages/(user)/main-tab/ui/guilds-section';
import { HeroCardsSection } from '~pages/(user)/main-tab/ui/hero-cards-section';
import { PublishersSection } from '~pages/(user)/main-tab/ui/publishers-section';
import { StatsSection } from '~pages/(user)/main-tab/ui/stats-section';
import { SubscribersSection } from '~pages/(user)/main-tab/ui/subscribers-section';
import { getQueryClient } from '~shared/api/react-query';
import { Routing } from '~shared/config/routing';
import { logger } from '~shared/lib/logger';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';

import { UserJsonLd } from './_json-ld';

export const generateMetadata = fallbackDefaultMetadata<{ id: string }>(
  withMetadataCache(async (props) => {
    const { id } = await props.params;
    const t = await getTranslations('pages.user-about.meta');
    const queryClient = getQueryClient();

    const userPrefetch = queryClient.fetchQuery(
      getSuspenseUserQuery({
        variables: { params: { userId: id } },
        fetchOptions: {
          cache: 'force-cache',
        },
      })
    );

    const achievementsPrefetch = queryClient
      .fetchInfiniteQuery(
        getUserAchievementsQuery({
          variables: {
            params: { userId: id },
            query: {
              page: 1,
              count: 3,
            },
          },
          fetchOptions: {
            cache: 'force-cache',
          },
        })
      )
      .then((v) => v.pages.flatMap((it) => it.results))
      .catch((e) => {
        logger.error(e);
        return [];
      });

    const badgesPrefetch = queryClient
      .fetchInfiniteQuery(
        getUserBadgesKey({
          variables: {
            params: { userId: id },
            query: {
              page: 1,
              count: 3,
            },
          },
          fetchOptions: {
            cache: 'force-cache',
          },
        })
      )
      .then((v) => v.pages.flatMap((it) => it.results))
      .catch((e) => {
        logger.error(e);
        return [];
      });

    const favoriteCardsPrefetch = queryClient
      .fetchInfiniteQuery(
        getHeroCardsByUserInfiniteQuery({
          variables: {
            params: {
              userId: Number(id),
            },
            query: {
              is_favorite: 1,
              page: 1,
              count: 3,
            },
          },
          fetchOptions: {
            cache: 'force-cache',
          },
        })
      )
      .then((v) => v.pages.flatMap((it) => it.results))
      .catch((e) => {
        logger.error(e);
        return [];
      });

    const [user, achievements, badges, favoriteCards] = await Promise.all([
      userPrefetch,
      achievementsPrefetch,
      badgesPrefetch,
      favoriteCardsPrefetch,
    ]);

    // Prepare publishers and clubs data
    const publishersData = user.publishers ?? [];
    const clubsData = user.clubs ?? [];
    const publisherNames = publishersData.map((v) => v.name).slice(0, 3);
    const clubNames = clubsData.map((v) => v.name).slice(0, 3);

    // Determine membership type and create appropriate text
    const getMembershipText = () => {
      const hasPublishers = publishersData.length > 0;
      const hasClubs = clubsData.length > 0;
      const publishersCount = publisherNames.length;
      const clubsCount = clubNames.length;

      if (!hasPublishers && !hasClubs) {
        return t('membership.none');
      }

      if (hasPublishers && !hasClubs) {
        if (publishersCount === 1) {
          return t('membership.singlePublisher', { publisher: publisherNames[0]! });
        } else {
          return t('membership.multiplePublishers', { publishers: publisherNames.join(', ') });
        }
      }

      if (!hasPublishers && hasClubs) {
        if (clubsCount === 1) {
          return t('membership.singleClub', { club: clubNames[0]! });
        } else {
          return t('membership.multipleClubs', { clubs: clubNames.join(', ') });
        }
      }

      // Both publishers and clubs exist
      if (publishersCount === 1 && clubsCount === 1) {
        return t('membership.singlePublisherSingleClub', {
          publisher: publisherNames[0]!,
          club: clubNames[0]!,
        });
      } else if (publishersCount === 1 && clubsCount > 1) {
        return t('membership.singlePublisherMultipleClubs', {
          publisher: publisherNames[0]!,
          clubs: clubNames.join(', '),
        });
      } else if (publishersCount > 1 && clubsCount === 1) {
        return t('membership.multiplePublishersSingleClub', {
          publishers: publisherNames.join(', '),
          club: clubNames[0]!,
        });
      } else {
        return t('membership.multiplePublishersMultipleClubs', {
          publishers: publisherNames.join(', '),
          clubs: clubNames.join(', '),
        });
      }
    };

    return generateNextMetadata({
      title: t('title', { id: user.id, username: user.username }),
      description: t('description', {
        username: user.username,
        membershipText: getMembershipText(),
        favoriteCards: (favoriteCards ?? [])
          .map((it) => it.card.character?.name || 'коллекционная карточка')
          .join(', '),
        achievements: (achievements ?? []).map((it) => it.achievement.name).join(', '),
        badges: (badges ?? []).map((it) => it.name).join(', '),
      }),
      canonical: Routing.User.detail({ params: { id, tab: 'about' } }),
    });
  }, 'user-about')
);

export default async function AboutPage() {
  return (
    <>
      <Suspense fallback={null}>
        <UserJsonLd />
        <UserDetailBreadcrumbsLd tab="about" />
      </Suspense>

      <div className="flex flex-col gap-2 lg:grid lg:grid-cols-[400px_minmax(0,_888px)]">
        {/* <DescriptionSection /> */}
        <StatsSection />

        <div className="flex w-full flex-col gap-2">
          <BadgesSection />
          <AchievementsSection />
        </div>
        <HeroCardsSection />
        <div className="col-span-full grid w-full grid-cols-1 flex-col gap-2 md:grid-cols-2">
          <PublishersSection />
          <GuildsSection />
        </div>
        <div className="col-span-full grid w-full grid-cols-1 flex-col gap-2 md:grid-cols-2">
          <FriendsSection />
          <SubscribersSection />
        </div>
        <CommentsSection className="col-span-full" />
      </div>
    </>
  );
}
