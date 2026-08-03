'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { useSiteConfig } from '~app/providers/site-config-provider';
import { Routing } from '~shared/config/routing';
import { BreadcrumbListBuilder, ListItemBuilder } from '~shared/seo/schema-org';
import { UrlBuilder } from '~shared/utils/url-formatter';

export const TitleTopBreadcrumbsLd = () => {
  const { tab } = useParams<{ tab: string }>();

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
          name: t('top.meta.breadcrumbs-name'),
          item: new UrlBuilder(
            siteConfig.routing.url,
            Routing.Title.top({ params: { content: siteConfig.contentType } })
          ).build(),
        })
        .build(),
      new ListItemBuilder()
        .set({
          position: 3,
          name: t('top.meta.breadcrumbs-name'),
          item: new UrlBuilder(
            siteConfig.routing.url,
            Routing.Title.top({ params: { content: siteConfig.contentType, tab } })
          ).build(),
        })
        .build(),
    ],
  });

  return (
    <script
      id="title-top-breadcrumbs-ld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: `${JSON.stringify(ldBreadcrumbs.build())}` }}
    />
  );
};
