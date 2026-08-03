import { getTranslations } from 'next-intl/server';

import { Error429 } from '~features/error-view/ui/error-429';
import { getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import { Container } from '~shared/ui/container';

export const generateMetadata = fallbackDefaultMetadata(
  withMetadataCache(async () => {
    const t = await getTranslations('pages.too-many-requests.meta');
    const siteConfig = getSiteConfig()!;

    return generateNextMetadata({
      title: t('title'),
      description: t('description', { siteName: siteConfig.site.name }),
      index: false,
      follow: false,
    });
  }),
  'too-many-requests'
);

export default function ErrorTooManyRequests() {
  return (
    <Container className="flex h-screen items-center justify-center">
      <Error429 />
    </Container>
  );
}

export const dynamic = 'force-dynamic';
