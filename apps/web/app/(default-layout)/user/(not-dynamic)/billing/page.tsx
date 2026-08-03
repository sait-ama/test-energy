import { unauthorized } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { UserBillingPage } from '~pages/(user)/user-billing/ui/user-billing-page';
import { getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { getSession } from '~shared/lib/session/get-session';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';

export const generateMetadata = fallbackDefaultMetadata(
  withMetadataCache(async () => {
    const t = await getTranslations('user-billing-page.meta');

    const siteConfig = getSiteConfig()!;

    return generateNextMetadata({
      title: t('title'),
      description: t('description', { siteName: siteConfig.site.name }),
      follow: false,
      index: false,
    });
  }, 'user-billing-page')
);
export default async function UserBilling() {
  const session = await getSession();

  if (!session) unauthorized();

  return <UserBillingPage />;
}
