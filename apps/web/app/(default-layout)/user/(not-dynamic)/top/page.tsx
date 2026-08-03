import { getTranslations } from 'next-intl/server';

import { TopCategoriesListPage } from '~pages/(user)/top/user-top-list';
import { UserTopBreadcrumbsLd } from '~pages/(user)/top/user-top-list-ld';
import { Routing } from '~shared/config/routing';
import { getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import { Container } from '~shared/ui/container';

export const generateMetadata = fallbackDefaultMetadata(
  withMetadataCache(async () => {
    const t = await getTranslations('pages.user-tops.meta');

    const siteConfig = getSiteConfig()!;

    return generateNextMetadata({
      title: t('title'),
      description: t('description', { siteName: siteConfig.site.name }),
      canonical: Routing.User.top(),
    });
  }, 'user-tops')
);

export default async function Page() {
  return (
    <Container layout="tiny" className="my-8">
      <UserTopBreadcrumbsLd />
      <TopCategoriesListPage />
    </Container>
  );
}

export const dynamic = 'force-dynamic';
