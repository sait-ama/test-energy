'use client';

import { useTranslations } from 'next-intl';

import { useSiteConfig } from '~app/providers/site-config-provider';
import { Routing } from '~shared/config/routing';
import { BreadcrumbListBuilder, ListItemBuilder } from '~shared/seo/schema-org';
import { UrlBuilder } from '~shared/utils/url-formatter';

export interface EntryBreadcrumbsLdProps {
  name: string;
  dir: number | string;
}

export const EntryBreadcrumbsLd = (props: EntryBreadcrumbsLdProps) => {
  const { name, dir } = props;

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
          name: name,
          item: new UrlBuilder(
            siteConfig.routing.url,
            Routing.Entry.main({ params: { id: dir } })
          ).build(),
        })
        .build(),
    ],
  });

  return (
    <script
      id="entry-breadcrumbs-ld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: `${JSON.stringify(ldBreadcrumbs.build())}` }}
    />
  );
};
