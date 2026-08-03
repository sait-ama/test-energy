import type { PropsWithChildren } from 'react';
import { getTranslations } from 'next-intl/server';

import { getClubsRetrieveQueryOptions } from '~entities/guild/api/queries';
import { GuildBreadcrumbsLd } from '~pages/guild/seo/ld';
import { getQueryClient } from '~shared/api/react-query';
import { Routing } from '~shared/config/routing';
import { getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { htmlRegExp } from '~shared/lib/regexp/is-html';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import type { NextPageParams } from '~shared/types/next';
import { EntityLayoutDescription, EntityLayoutDescriptionTitle } from '~shared/ui/entity-layout';

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
      title: t('profile.about.meta.title', { name: club.name, id: club.id }),
      description: t('profile.about.meta.description', {
        siteName: siteConfig.site.name,
        name: club.name,
        level: club.cur_level,
        id: club.id,
        is_public_info: club.is_public
          ? t('common.meta.is_public_info')
          : t('common.meta.is_private_info'),
        // is_public: String(club.is_public),
        members: club.members.length,
        rank: club.rank,
        description: (club.description ?? '').replace(htmlRegExp, ''),
      }),
      canonical: Routing.Club.clubByDir({ params: { dir, tab: 'about' } }),
    });
  }, 'guild-about')
);

export default async (props: NextPageParams<{ dir: string }> & PropsWithChildren) => {
  const { dir } = await props.params;

  const queryClient = getQueryClient();

  const club = await queryClient.fetchQuery(
    getClubsRetrieveQueryOptions({
      path: { dir },
    })
  );

  return (
    <>
      <GuildBreadcrumbsLd club={club} />
      <EntityLayoutDescription
        className="bg-secondary dark:bg-secondary"
        title={<EntityLayoutDescriptionTitle>О гильдии</EntityLayoutDescriptionTitle>}
      >
        {club.description ?? ''}
      </EntityLayoutDescription>
    </>
  );
};

export const dynamic = 'force-dynamic';
