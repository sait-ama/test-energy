import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { getTopTitlesInfiniteKey } from '~entities/title/model/queries';
import { getTopTabsQueryKey } from '~entities/top/model/queries';
import { TopCategoryPage } from '~pages/(top)/top-category-page/top-category-page';
import { TitleTopBreadcrumbsLd } from '~pages/(top)/top-list-page/seo/ld';
import { getQueryClient } from '~shared/api/react-query';
import { Routing } from '~shared/config/routing';
import { getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';

export const generateMetadata = fallbackDefaultMetadata<{ tab: string }, { period: string }>(
  withMetadataCache(async (props) => {
    const siteConfig = getSiteConfig()!;
    const queryClient = getQueryClient();
    const t = await getTranslations(`pages.top-detailed-page.meta.${siteConfig.contentType}`);

    const { period } = await props.searchParams;
    const { tab } = await props.params;

    const tabs = await queryClient.fetchQuery(
      getTopTabsQueryKey({ variables: {}, fetchOptions: { cache: 'no-cache' } })
    );
    const foundTab = tabs.find((it) => String(it.id) === tab);

    if (!tab) notFound();

    const data = await queryClient.fetchInfiniteQuery(
      getTopTitlesInfiniteKey({
        variables: {
          query: { count: 20, period, tag: tab },
        },
        fetchOptions: {
          cache: 'no-cache',
        },
      })
    );

    return generateNextMetadata({
      title: t('title', { name: foundTab.label }),
      description: t('description', {
        siteName: siteConfig.site.name,
        name: foundTab.label,
        titles: data?.pages
          .flatMap((it) => it.titles)
          .map((it) => it.main_name)
          .join(', '),
      }),
      canonical: Routing.Title.top({ params: { content: siteConfig.contentType, tab } }),
    });
  }, 'title-top-detailed')
);

export default function TopCategoryRootPage() {
  return (
    <>
      <TitleTopBreadcrumbsLd />
      <TopCategoryPage />
    </>
  );
}
