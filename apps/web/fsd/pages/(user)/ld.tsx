'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { useSiteConfig } from '~app/providers/site-config-provider';
import { Routing } from '~shared/config/routing';
import { BreadcrumbListBuilder, ListItemBuilder } from '~shared/seo/schema-org';
import { UrlBuilder } from '~shared/utils/url-formatter';

export type UserDetailBreadcrumbsLdProps = {
  tab: 'about' | 'bookmarks' | 'comments' | 'exchanges' | 'inventory' | 'posts';
};

export const UserDetailBreadcrumbsLd = ({ tab }: UserDetailBreadcrumbsLdProps) => {
  const { id } = useParams<{ id: string }>();

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
          name: t('user-tops.meta.breadcrumbs-name'),
          item: new UrlBuilder(siteConfig.routing.url, Routing.User.top()).build(),
        })
        .build(),
      new ListItemBuilder()
        .set({
          position: 3,
          name: t('user.meta.breadcrumbs-name-tabs', { tab }),
          item: new UrlBuilder(
            siteConfig.routing.url,
            Routing.User.detail({ params: { id, tab } })
          ).build(),
        })
        .build(),
    ],
  });

  return (
    <script
      id="user-breadcrumbs-ld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: `${JSON.stringify(ldBreadcrumbs.build())}` }}
    />
  );
};
