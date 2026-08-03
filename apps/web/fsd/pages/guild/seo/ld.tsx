'use client';

import { useTranslations } from 'next-intl';

import { ClubDetail } from '@re/api/generated/types.gen';

import { useSiteConfig } from '~app/providers/site-config-provider';
import { Routing } from '~shared/config/routing';
import { BreadcrumbListBuilder, ListItemBuilder } from '~shared/seo/schema-org';
import { UrlBuilder } from '~shared/utils/url-formatter';

export type GuildBreadcrumbsLdProps = {
  club: Pick<ClubDetail, 'dir' | 'name' | 'id'>;
};

export const GuildBreadcrumbsLd = ({ club: { dir = '', name } }: GuildBreadcrumbsLdProps) => {
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
          name: t('guild.top.meta.breadcrumbs-name'),
          item: new UrlBuilder(siteConfig.routing.url, Routing.Club.top()).build(),
        })
        .build(),
      new ListItemBuilder()
        .set({
          position: 3,
          name: t('guild.common.meta.breadcrumbs-name', { name }),
          item: new UrlBuilder(
            siteConfig.routing.url,
            Routing.Club.clubByDir({ params: { dir, tab: 'about' } })
          ).build(),
        })
        .build(),
    ],
  });

  return (
    <script
      id="guild-breadcrumbs-ld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: `${JSON.stringify(ldBreadcrumbs.build())}` }}
    />
  );
};
