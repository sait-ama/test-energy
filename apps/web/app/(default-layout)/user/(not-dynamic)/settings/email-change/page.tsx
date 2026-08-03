import { getTranslations } from 'next-intl/server';

import { UserProfileChangeEmail } from '~features/change-email/ui/user-profile-change-email';
import { getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';

export const generateMetadata = fallbackDefaultMetadata(
  withMetadataCache(async () => {
    const t = await getTranslations('pages.user-email-change.meta');

    const siteConfig = getSiteConfig()!;

    return generateNextMetadata({
      title: t('title'),
      description: t('description', { siteName: siteConfig.site.name }),
      follow: false,
      index: false,
    });
  }, 'user-settings-email-change')
);

export default function EmailChangePage() {
  return <UserProfileChangeEmail />;
}

export const dynamic = 'force-dynamic';
