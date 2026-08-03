import { unauthorized } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { UserPromoCodePage } from '~pages/(user)/promocode/ui/user-promocode';
import { getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { getSession } from '~shared/lib/session/get-session';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';

export const generateMetadata = fallbackDefaultMetadata(
  withMetadataCache(async () => {
    const t = await getTranslations('user-promo-code-page.meta');

    const siteConfig = getSiteConfig()!;

    return generateNextMetadata({
      title: t('title'),
      description: t('description', { siteName: siteConfig.site.name }),
      follow: false,
      index: false,
    });
  }, 'user-promo-code-seo')
);
export default async function UserPromoCodes() {
  const session = await getSession();

  if (!session) unauthorized();

  return <UserPromoCodePage />;
}
