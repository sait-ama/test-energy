import { getTranslations } from 'next-intl/server';

import { getTitlesListInfiniteKey } from '~entities/title/model/queries';
import { HotUpdates } from '~pages/(title)/hot-updates/ui/hot-updates';
import { getQueryClient } from '~shared/api/react-query';
import { Routing } from '~shared/config/routing';
import { getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';

export const generateMetadata = fallbackDefaultMetadata(
  withMetadataCache(async () => {
    const siteConfig = getSiteConfig()!;
    const queryClient = getQueryClient();

    const titles = await queryClient.fetchInfiniteQuery(
      getTitlesListInfiniteKey({
        variables: {
          query: { count: 20, slider: 'hot_new' },
        },
        fetchOptions: {
          cache: 'no-cache',
        },
      })
    );

    const t = await getTranslations(`pages.hot-updates-page.meta.${siteConfig.contentType}`);

    return generateNextMetadata({
      title: t('title'),
      description: t('description', {
        siteName: siteConfig.site.name,
        titles: titles.pages
          .flatMap((it) => it.titles)
          .map((it) => `${it?.type?.name?.toLowerCase()} ${it.main_name}`)
          .slice(0, 10)
          .join(', '),
      }),
      index: false,
      follow: false,
      canonical: Routing.Title.hot({ params: { content: siteConfig.contentType } }),
    });
  }, 'title-hot-updates')
);

export default HotUpdates;
