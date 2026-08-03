import { getTranslations } from 'next-intl/server';

import { getClubsRetrieveQueryOptions } from '~entities/guild/api/queries';
import { ClubDestroyButton } from '~features/guild-pass-request/ui/guild-destroy';
import { getQueryClient } from '~shared/api/react-query';
import { getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';

export const generateMetadata = fallbackDefaultMetadata<{ dir: string }>(
  withMetadataCache(async (props) => {
    const { dir } = await props.params;
    const t = await getTranslations('pages.guild.settings.destroy');

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
      title: t('meta.title', { name: club.name, id: club.id }),
      description: t('meta.description', {
        siteName: siteConfig.site.name,
        name: club.name,
        level: club.cur_level,
        id: club.id,
      }),
      index: false,
      follow: false,
    });
  }, 'guild-settings-destroy')
);

export default async () => (
  <div className="flex flex-col gap-8">
    <ClubDestroyButton />
  </div>
);

export const dynamic = 'force-dynamic';
