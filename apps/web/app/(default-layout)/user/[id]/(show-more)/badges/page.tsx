import { getTranslations } from 'next-intl/server';

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { getUserBadgesKey } from '~entities/user/model/queries';
import { UserRepository } from '~entities/user/model/repository';
import { BadgesList } from '~pages/(user)/badges/ui/badges';
import { getQueryClient } from '~shared/api/react-query';
import { Routing } from '~shared/config/routing';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import { NextPageParams } from '~shared/types/next';

export const generateMetadata = fallbackDefaultMetadata<{ id: string }>(
  withMetadataCache(async (props) => {
    const { id } = await props.params;
    const t = await getTranslations('user.show-more.badges');

    const user = await UserRepository.userById({ params: { userId: id } }, { cache: 'no-cache' });

    const username = user.username;

    const title = t('meta.title', { username });

    return generateNextMetadata({
      title,
      description: t('meta.description', { username }),
      canonical: Routing.User.detail({ params: { id, tab: 'badges' } }),
    });
  }, 'user-badges')
);

export default async function BadgesPage(props: NextPageParams<{ id: string }>) {
  const params = await props.params;
  const { id } = params;
  const queryClient = getQueryClient();
  await queryClient.prefetchInfiniteQuery(
    getUserBadgesKey({ variables: { params: { userId: id } } })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BadgesList />
    </HydrationBoundary>
  );
}

export const dynamic = 'force-dynamic';
