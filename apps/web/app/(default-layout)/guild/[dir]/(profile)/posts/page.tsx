import React from 'react';
import { forbidden } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { getClubsRetrieveQueryOptions } from '~entities/guild/api/queries';
import { GuildByDirProfileAbilities } from '~pages/guild/model/by-dir/abilities';
import { GuildBreadcrumbsLd } from '~pages/guild/seo/ld';
import { getQueryClient } from '~shared/api/react-query';
import { Routing } from '~shared/config/routing';
import { getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { htmlRegExp } from '~shared/lib/regexp/is-html';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import type { NextPageParams } from '~shared/types/next';
import { PostFeedSubject } from '~widgets/post/post-feed-subject';

export const generateMetadata = fallbackDefaultMetadata<{ dir: string }>(
  withMetadataCache(async (props) => {
    const { dir } = await props.params;
    const t = await getTranslations('pages.guild');

    const siteConfig = getSiteConfig()!;
    const queryClient = getQueryClient();

    const club = await queryClient.fetchQuery(
      getClubsRetrieveQueryOptions({
        path: { dir },
        cache: 'force-cache',
        next: { revalidate: 60 * 60 },
      })
    );

    return generateNextMetadata({
      title: t('profile.posts.meta.title', { name: club.name, id: club.id }),
      description: t('profile.posts.meta.description', {
        siteName: siteConfig.site.name,
        name: club.name,
        level: club.cur_level,
        id: club.id,
        is_public_info: !club.is_public
          ? t('common.meta.is_public_info')
          : t('common.meta.is_private_info'),
        members: club.members.length,
        rank: club.rank,
        description: (club.description ?? '').replace(htmlRegExp, ''),
      }),
      canonical: Routing.Club.clubByDir({ params: { dir, tab: 'posts' } }),
    });
  }, 'guild-posts')
);

export default async (props: NextPageParams<{ dir: string }>) => {
  const { dir } = await props.params;
  const features = getSiteConfig()?.features;
  const postsInAvailableSegments = GuildByDirProfileAbilities.posts({ features });
  if (!postsInAvailableSegments) forbidden();

  const club = await getQueryClient().ensureQueryData(
    getClubsRetrieveQueryOptions({ path: { dir } })
  );

  return (
    <>
      <GuildBreadcrumbsLd club={{ dir, id: club.id, name: club.name }} />
      <PostFeedSubject query={{ club: club.id.toString() }} />
    </>
  );
};

export const dynamic = 'force-dynamic';
