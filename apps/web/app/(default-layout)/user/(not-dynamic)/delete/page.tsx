import { getTranslations } from 'next-intl/server';

import { getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';

import { UserDeleteForm } from './_page';

export const generateMetadata = fallbackDefaultMetadata(
  withMetadataCache(async () => {
    const t = await getTranslations('pages.user-delete-account.meta');

    const siteConfig = getSiteConfig()!;

    return generateNextMetadata({
      title: t('title'),
      description: t('description', { siteName: siteConfig.site.name }),
      follow: false,
      index: false,
    });
  }, 'user-delete')
);

export default function UserDeletePage() {
  return <UserDeleteForm />;
}

export const dynamic = 'force-dynamic';
