import { getTranslations } from 'next-intl/server';

import { getTitleSliderKey } from '~entities/title/model/queries';
import { HorizontalTitleCard } from '~entities/title/ui/horizontal-title-card';
import { getQueryClient } from '~shared/api/react-query';
import { Routing } from '~shared/config/routing';
import { getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { QuerySuspenseContainer } from '~shared/lib/react-query/query-suspense-container';
import { htmlRegExp } from '~shared/lib/regexp/is-html';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';

import { TitleListBreadcrumbsLd } from './_ld-json';
import { TitlesSliderPage } from './_page';

export const generateMetadata = fallbackDefaultMetadata<{ dir: string }>(
  withMetadataCache(async (props) => {
    const params = await props.params;
    const siteConfig = getSiteConfig()!;
    const queryClient = getQueryClient();

    const t = await getTranslations(`pages.title-list-page.meta.${siteConfig.contentType}`);
    const slider = await queryClient.fetchQuery(
      getTitleSliderKey({
        variables: {
          params: { dir: params.dir },
          query: {},
        },
        fetchOptions: {
          cache: 'no-cache',
        },
      })
    );

    return generateNextMetadata({
      title: t('title', { name: slider.name ?? '' }),
      description: t('description', {
        siteName: siteConfig.site.name,
        name: slider.name ?? '',
        description: (slider.description || '').replace(htmlRegExp, ''),
        titles: slider.titles.map((it) => it.title.main_name).join(', '),
      }),
      index: false,
      follow: false,
      canonical: Routing.Title.list({
        params: { id: params.dir, content: siteConfig.contentType },
      }),
    });
  }, 'title-list-detailed')
);

export default function SliderTitlesPage() {
  return (
    <>
      <TitleListBreadcrumbsLd />
      <QuerySuspenseContainer
        fallback={
          <div className="mx-2 grid grid-cols-1 gap-3 md:grid-cols-2">
            {Array(8)
              .fill(0)
              .map((_, i) => (
                <HorizontalTitleCard model={null} isLoading key={`l_${i}`} />
              ))}
          </div>
        }
      >
        <TitlesSliderPage />
      </QuerySuspenseContainer>
    </>
  );
}

export const dynamic = 'force-dynamic';
