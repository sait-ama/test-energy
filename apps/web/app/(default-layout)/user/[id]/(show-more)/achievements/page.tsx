import { getTranslations } from 'next-intl/server';

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { getUserAchievementsQuery } from '~entities/user/model/queries';
import { UserRepository } from '~entities/user/model/repository';
import { Achievements } from '~pages/(user)/achievements/ui/achievements';
import { getQueryClient } from '~shared/api/react-query';
import { Routing } from '~shared/config/routing';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import type { NextPageParams } from '~shared/types/next';

export const generateMetadata = fallbackDefaultMetadata<{ id: string }>(
  withMetadataCache(async (props) => {
    const { id } = await props.params;
    const t = await getTranslations('user.pages.achievements.meta');

    const user = await UserRepository.userById({ params: { userId: id } }, { cache: 'no-cache' });

    const username = user.username;

    const title = t('title', { username });

    return generateNextMetadata({
      title,
      description: t('description', { username }),
      canonical: Routing.User.detail({ params: { id, tab: 'achievements' } }),
    });
  }, 'user-achievements')
);

export default async function AchievementsPage(props: NextPageParams<{ id: string }>) {
  const params = await props.params;
  const { id } = params;

  const queryClient = getQueryClient();
  await queryClient.prefetchInfiniteQuery(
    getUserAchievementsQuery({ variables: { params: { userId: id } } })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Achievements />
    </HydrationBoundary>
  );
}

export const dynamic = 'force-dynamic';
