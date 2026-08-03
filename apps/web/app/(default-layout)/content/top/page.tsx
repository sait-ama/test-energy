import { getTranslations } from 'next-intl/server';

import { getTopTabsQueryKey } from '~entities/top/model/queries';
import { TopCategoryPage } from '~pages/(top)/top-category-page/top-category-page';
import { getQueryClient } from '~shared/api/react-query';
import { Routing } from '~shared/config/routing';
import { getContentType, getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';

export const generateMetadata = fallbackDefaultMetadata(
  withMetadataCache(async () => {
    const contentType = getContentType();

    const t = await getTranslations(`pages.top.meta.${contentType}`);
    const siteConfig = getSiteConfig()!;
    const queryClient = getQueryClient();

    const tabs = await queryClient.fetchQuery(
      getTopTabsQueryKey({ variables: {}, fetchOptions: { cache: 'no-cache' } })
    );

    return generateNextMetadata({
      title: t('title'),
      description: t('description', {
        siteName: siteConfig.site.name,
        tops: tabs.map((it) => it.label).join(', '),
      }),
      canonical: Routing.Title.top({ params: { content: siteConfig.contentType } }),
    });
  }, 'title-tops')
);

export default async function Page() {
  return <TopCategoryPage />;
}
