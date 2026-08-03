'use client';

import { useTranslations } from 'next-intl';

import { useSiteConfig } from '~app/providers/site-config-provider';
import { useCreatorQuery } from '~entities/creator/model/queries';
import { Routing } from '~shared/config/routing';
import { BreadcrumbListBuilder, ListItemBuilder } from '~shared/seo/schema-org';
import { UrlBuilder } from '~shared/utils/url-formatter';

export type CreatorDetailBreadcrumbsLdProps = {
  id: string;
};

export const CreatorDetailBreadcrumbsLd = ({ id }: CreatorDetailBreadcrumbsLdProps) => {
  const siteConfig = useSiteConfig();

  const { data } = useCreatorQuery({
    variables: {
      params: {
        id: id,
      },
    },
  });

  const t = useTranslations('pages');

  if (!data) return null;

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
          name: data.name,
          item: new UrlBuilder(
            siteConfig.routing.url,
            Routing.Creator.detail({ params: { id } })
          ).build(),
        })
        .build(),
    ],
  });

  return (
    <script
      id="creator-breadcrumbs-ld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: `${JSON.stringify(ldBreadcrumbs.build())}` }}
    />
  );
};
