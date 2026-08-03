import { getTranslations } from 'next-intl/server';

import { UserProfileAppereance } from '~features/change-appereance-settings/ui/user-profile-appereance';
import { getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';

export const generateMetadata = fallbackDefaultMetadata(
  withMetadataCache(async () => {
    const t = await getTranslations('pages.user-appereance-edit.meta');

    const siteConfig = getSiteConfig()!;

    return generateNextMetadata({
      title: t('title'),
      description: t('description', { siteName: siteConfig.site.name }),
      follow: false,
      index: false,
    });
  }, 'user-settings-appereance')
);

export default function Page() {
  return <UserProfileAppereance />;
}

export const dynamic = 'force-dynamic';
