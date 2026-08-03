'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { useSiteConfig } from '~app/providers/site-config-provider';
import { Routing } from '~shared/config/routing';
import { BreadcrumbListBuilder, ListItemBuilder } from '~shared/seo/schema-org';
import { UrlBuilder } from '~shared/utils/url-formatter';

export const TitleListBreadcrumbsLd = () => {
  const { dir } = useParams<{ dir: string }>();
  const siteConfig = useSiteConfig();

  const t = useTranslations('pages');

  const ldBreadcrumbs = new BreadcrumbListBuilder().set({
    itemListElement: [
      new ListItemBuilder()
        .set({
          position: 1,
          name: t('home.meta.breadcrumbs-name'),
          item: new UrlBuilder(siteConfig.routing.url, Routing.Home.main({})).build(),
        })
        .build(),
      new ListItemBuilder()
        .set({
          position: 2,
          name: t('title-list-page.meta.breadcrumbs-name'),
          item: new UrlBuilder(
            siteConfig.routing.url,
            Routing.Title.list({ params: { id: dir, content: siteConfig.contentType } })
          ).build(),
        })
        .build(),
    ],
  });

  return (
    <>
      <script
        id="titles-list-breadcrumbs-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: `${JSON.stringify(ldBreadcrumbs.build())}` }}
      />
    </>
  );
};
