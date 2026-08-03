'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { useSiteConfig } from '~app/providers/site-config-provider';
import { Routing } from '~shared/config/routing';
import { BreadcrumbListBuilder, ListItemBuilder } from '~shared/seo/schema-org';
import { UrlBuilder } from '~shared/utils/url-formatter';

export type PublisherDetailBreadcrumbsLdProps = {
  // не хочу пока что выность в enum
  tab: 'about' | 'titles' | 'feed' | 'comments' | 'posts';
};

export const PublisherDetailBreadcrumbsLd = ({ tab }: PublisherDetailBreadcrumbsLdProps) => {
  const siteConfig = useSiteConfig();
  const { dir } = useParams<{ dir: string }>();

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
          name: t('publisher-page.meta.breadcrumbs-name', { tab: 'about', name: dir }),
          item: new UrlBuilder(
            siteConfig.routing.url,
            Routing.Publisher.detail({ params: { dir } })
          ).build(),
        })
        .build(),
      new ListItemBuilder()
        .set({
          position: 3,
          name: t('publisher-page.meta.breadcrumbs-name', { tab, name: dir }),
          item: new UrlBuilder(
            siteConfig.routing.url,
            Routing.Publisher.detail({ params: { tab, dir } })
          ).build(),
        })
        .build(),
    ],
  });

  return (
    <script
      id="publisher-detail-breadcrumbs-ld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: `${JSON.stringify(ldBreadcrumbs.build())}` }}
    />
  );
};
