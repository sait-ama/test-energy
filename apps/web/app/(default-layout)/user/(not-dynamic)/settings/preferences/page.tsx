import { getTranslations } from 'next-intl/server';

import { UserProfilePreference } from '~features/change-preference/ui/change-preference';
import { getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';

export const generateMetadata = fallbackDefaultMetadata(
  withMetadataCache(async () => {
    const t = await getTranslations('pages.user-preference-edit.meta');

    const siteConfig = getSiteConfig()!;

    return generateNextMetadata({
      title: t('title'),
      description: t('description', { siteName: siteConfig.site.name }),
      follow: false,
      index: false,
    });
  }, 'user-settings-preferences')
);

export default function PreferencesPage() {
  return <UserProfilePreference />;
}

export const dynamic = 'force-dynamic';
