import { getTranslations } from 'next-intl/server';

import { CollectCookiesGame } from '~pages/(battlepass)/collect-cookies/collect-cookies';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import { Container } from '~shared/ui/container';
import { NoSSR } from '~shared/ui/no-ssr';

export const generateMetadata = fallbackDefaultMetadata(
  withMetadataCache(async () => {
    const t = await getTranslations('battlepass.cookies-game.meta');

    return generateNextMetadata({
      title: t('title'),
      description: t('description'),
      index: false,
    });
  }, 'battlepass-cookies')
);

export default function CollectCookies() {
  return (
    <Container slim>
      <NoSSR>
        <CollectCookiesGame />
      </NoSSR>
    </Container>
  );
}

export const dynamic = 'force-dynamic';
