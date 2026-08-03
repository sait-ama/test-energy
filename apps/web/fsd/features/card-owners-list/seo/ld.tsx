'use client';

import { useTranslations } from 'next-intl';

import { useSiteConfig } from '~app/providers/site-config-provider';
import { useHeroCardByIdQuery } from '~entities/inventory/model/queries';
import { transformHeroCardRank } from '~entities/inventory/utils';
import { Routing } from '~shared/config/routing';
import { BreadcrumbListBuilder, ListItemBuilder } from '~shared/seo/schema-org';
import { UrlBuilder } from '~shared/utils/url-formatter';

export type CardOwnersBreadcrumbsLdProps = {
  id: string;
};

export const CardOwnersBreadcrumbsLd = ({ id }: CardOwnersBreadcrumbsLdProps) => {
  const siteConfig = useSiteConfig();

  const t = useTranslations('pages');

  const { data } = useHeroCardByIdQuery({
    variables: {
      params: { cardId: id },
    },
  });

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
          name: t('hero-card-catalog.meta.breadcrumbs-name'),
          item: new UrlBuilder(siteConfig.routing.url, Routing.Card.catalog({})).build(),
        })
        .build(),
      new ListItemBuilder()
        .set({
          position: 3,
          name: t('hero-card-catalog.meta.breadcrumbs-name-rank', {
            rank: transformHeroCardRank(data.rank),
          }),
          item: new UrlBuilder(
            siteConfig.routing.url,
            Routing.Card.catalog({ query: { rank: data.rank } })
          ).build(),
        })
        .build(),
      new ListItemBuilder()
        .set({
          position: 4,
          name: t('hero-card.meta.breadcrumbs-name'),
          item: new UrlBuilder(siteConfig.routing.url, Routing.Card.id({ params: { id } })).build(),
        })
        .build(),
    ],
  });

  return (
    <>
      <script
        id="card-owners-breadcrumbs-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: `${JSON.stringify(ldBreadcrumbs.build())}` }}
      />
    </>
  );
};
