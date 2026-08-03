import React from 'react';
import { getTranslations } from 'next-intl/server';

import { BattlePassInfo } from '~features/battlepass-info/ui/battlepass-info';
import { getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';

export const generateMetadata = fallbackDefaultMetadata(
  withMetadataCache(async () => {
    const t = await getTranslations('pages.battlepass.meta');

    const siteConfig = getSiteConfig()!;

    return generateNextMetadata({
      title: t('title'),
      description: t('description', {
        siteName: siteConfig.site.name,
      }),
    });
  }, 'battlepass-info')
);

export default function BattlepassInfo() {
  return <BattlePassInfo />;
}

export const dynamic = 'force-dynamic';
