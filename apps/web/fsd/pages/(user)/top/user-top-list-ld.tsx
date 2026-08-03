import { getTranslations } from 'next-intl/server';

import { Routing } from '~shared/config/routing';
import { getSiteConfig } from '~shared/config/site-config';
import { BreadcrumbListBuilder, ListItemBuilder } from '~shared/seo/schema-org';
import { UrlBuilder } from '~shared/utils/url-formatter';

export const UserTopBreadcrumbsLd = async () => {
  const siteConfig = getSiteConfig()!;

  const t = await getTranslations('pages');

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
    ],
  });

  return (
    <script
      id="user-top-breadcrumbs-ld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: `${JSON.stringify(ldBreadcrumbs.build())}` }}
    />
  );
};
