import { getTranslations } from 'next-intl/server';

import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import { NoSSR } from '~shared/ui/no-ssr';
import { HeroCardUpgrade } from '~widgets/hero-card/ui/hero-card-upgrade';

export const generateMetadata = fallbackDefaultMetadata(
  withMetadataCache(async (_) => {
    const t = await getTranslations('user.pages.upgrade-cards.meta');

    return generateNextMetadata({
      title: t('title'),
      index: false,
      follow: false,
      description: t('description'),
    });
  }, 'user-upgrade-cards')
);

export const dynamic = 'force-dynamic';

export default async function UpgradeCardsPage() {
  return (
    <NoSSR>
      <HeroCardUpgrade />
    </NoSSR>
  );
}
