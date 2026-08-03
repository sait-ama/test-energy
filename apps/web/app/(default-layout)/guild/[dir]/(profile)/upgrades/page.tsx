import { forbidden, unauthorized } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { getClubsRetrieveQueryOptions } from '~entities/guild/api/queries';
import { getGuildRoleBySession } from '~entities/guild/model/utils';
import { GuildUpgradesPage } from '~pages/(guild)/upgrades/ui/guild-upgrades';
import { GuildByDirProfileAbilities } from '~pages/guild/model/by-dir/abilities';
import { getQueryClient } from '~shared/api/react-query';
import { Routing } from '~shared/config/routing';
import { getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { htmlRegExp } from '~shared/lib/regexp/is-html';
import { getSession } from '~shared/lib/session/get-session';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import type { NextPageParams } from '~shared/types/next';

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
      title: t('profile.upgrades.meta.title', { name: club.name, id: club.id }),
      description: t('profile.upgrades.meta.description', {
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
      canonical: Routing.Club.clubByDir({ params: { dir, tab: 'upgrades' } }),
    });
  }, 'guild-upgrades')
);

export default async function GuildUpgrades(props: NextPageParams<{ dir: string }>) {
  const { dir } = await props.params;
  const session = await getSession();

  if (!session) unauthorized();

  const club = await getQueryClient().fetchQuery(getClubsRetrieveQueryOptions({ path: { dir } }));

  const role = getGuildRoleBySession({ sessionId: session.id, club });

  if (!GuildByDirProfileAbilities.upgrades({ role })) forbidden();

  return <GuildUpgradesPage />;
}

export const dynamic = 'force-dynamic';
