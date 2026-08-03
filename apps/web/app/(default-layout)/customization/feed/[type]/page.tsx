import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { ShopFeed } from '~features/shop-feed/ui/shop-feed';
import { DecksPage } from '~pages/decks/ui/decks-page';
import type { ShopPaginatedListOrderings } from '~shared/api/models/shop';
import { ShopItemTypes } from '~shared/api/models/shop';
import { Routing } from '~shared/config/routing';
import { getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import type { NextPageParams } from '~shared/types/next';

export const generateMetadata = fallbackDefaultMetadata<{ type: ShopItemTypes }>(
  withMetadataCache(async (props) => {
    const { type } = await props.params;
    const t = await getTranslations('pages.customization-items-page.meta');
    const siteConfig = getSiteConfig()!;

    return generateNextMetadata({
      title: t('title', { type }),
      description: t('description', { siteName: siteConfig.site.name, type }),
      canonical: Routing.Shop.catalog({ params: { tab: 'feed', type } }),
    });
  }, 'customization-feed-detailed')
);

export default async function ContentPage(
  props: NextPageParams<
    { type: ShopItemTypes },
    {
      ordering: ShopPaginatedListOrderings;
    }
  >
) {
  const params = await props.params;

  if (
    ![
      ShopItemTypes.PACK,
      ShopItemTypes.DECK,
      ShopItemTypes.AVATAR,
      ShopItemTypes.WALLPAPER,
      ShopItemTypes.FRAME,
      ShopItemTypes.THEME,
    ].includes(params.type)
  ) {
    notFound();
  }

  if (params.type === ShopItemTypes.DECK) {
    return <DecksPage />;
  }

  return <ShopFeed />;
}

export const dynamic = 'force-dynamic';
