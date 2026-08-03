import { forbidden, unauthorized } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { getClubsRetrieveQueryOptions } from '~entities/guild/api/queries';
import { getGuildRoleBySession } from '~entities/guild/model/utils';
import { GuildByDirProfileAbilities } from '~pages/guild/model/by-dir/abilities';
import { GuildRequestsPage } from '~pages/guild/ui/(by-dir)/segments/requests/requests';
import { getQueryClient, queryClient } from '~shared/api/react-query';
import { getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { htmlRegExp } from '~shared/lib/regexp/is-html';
import { getSession } from '~shared/lib/session/get-session';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import { NextPageParams } from '~shared/types/next';

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
      title: t('profile.requests.meta.title', { name: club.name, id: club.id }),
      description: t('profile.requests.meta.description', {
        siteName: siteConfig.site.name,
        name: club.name,
        level: club.cur_level,
        id: club.id,
        is_public_info: club.is_public
          ? t('common.meta.is_public_info')
          : t('common.meta.is_private_info'),
        members: club.members.length,
        rank: club.rank,
        description: (club.description ?? '').replace(htmlRegExp, ''),
      }),
      index: false,
      follow: false,
    });
  }, 'guild-requests')
);

export default async function GuildRequests({ params }: NextPageParams<{ dir: string }>) {
  const { dir } = await params;
  const session = await getSession();

  if (!session) unauthorized();

  const club = await queryClient.fetchQuery(
    getClubsRetrieveQueryOptions({
      path: { dir },
    })
  );

  const role = getGuildRoleBySession({ sessionId: session.id, club });

  if (!GuildByDirProfileAbilities.requests({ role })) forbidden();

  return <GuildRequestsPage />;
}

export const dynamic = 'force-dynamic';
