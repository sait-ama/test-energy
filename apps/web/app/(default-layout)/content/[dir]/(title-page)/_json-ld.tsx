import { getTranslations } from 'next-intl/server';

import { getCurrentPageTitleDetail } from '~pages/(title)/title-detail/model/server';
import { CreatorType } from '~shared/api/models/creator';
import { Routing } from '~shared/config/routing';
import { getSiteConfig } from '~shared/config/site-config';
import {
  AggregateRatingBuilder,
  BreadcrumbListBuilder,
  ComicSeriesBuilder,
  ListItemBuilder,
  OrganizationBuilder,
  PersonBuilder,
} from '~shared/seo/schema-org';
import { UrlBuilder, UrlFormatter } from '~shared/utils/url-formatter';

type TitlePageJsonLdProps = {
  dirPromise: Promise<string>;
};

export const TitlePageJsonLd = async ({ dirPromise }: TitlePageJsonLdProps) => {
  const dir = await dirPromise;
  const data = await getCurrentPageTitleDetail(dir);

  const siteConfig = getSiteConfig()!;
  const t = await getTranslations('pages');
  const url = UrlFormatter.createUrl(siteConfig.routing.url, siteConfig.contentType, data.dir);
  const coverUrl = UrlFormatter.createUrl(siteConfig.routing.url, data.cover.mid);

  const authors = data.creators?.filter((c) => c.type === CreatorType['AUTHOR']);
  const publishers = data.creators?.filter((c) => c.type === CreatorType['PUBLISHER']);
  const creators = data.creators?.filter(
    (c) => c.type !== CreatorType['ARTIST'] && c.type !== CreatorType['PUBLISHER']
  );

  // TODO: sort alt names correctly

  let ldTitle = new ComicSeriesBuilder().set({
    url,
    name: `${data.type.name} ${data.main_name}`,
    headline: data.main_name,
    alternativeHeadline: [data.secondary_name, ...(data.another_name.split('/') || [])],
    image: coverUrl,
    // keywords,
    identifier: data.type.name,
    isFamilyFriendly: data.age_limit?.id === 0,
    // description,
    inLanguage: t('title.json-ld.language', { lang: siteConfig.localization.locale }),
    typicalAgeRange: data.age_limit?.name,
    copyrightYear: Number(data.issue_year),
    genre: [...(data.genres || []), ...(data.categories || [])].map((t) => t.name),
    author: authors.map((it) =>
      new PersonBuilder()
        .set({
          name: it.name,
        })
        .build()
    ),
    publisher: publishers.map((it) =>
      new OrganizationBuilder()
        .set({
          name: it.name,
        })
        .build()
    ),
    creator: creators.map((it) =>
      it.type === CreatorType['STUDIO']
        ? new OrganizationBuilder()
            .set({
              name: it.name,
            })
            .build()
        : new PersonBuilder()
            .set({
              name: it.name,
            })
            .build()
    ),
  });

  if (data.count_rating && data.avg_rating !== '0.0') {
    ldTitle = ldTitle.set({
      aggregateRating: new AggregateRatingBuilder()
        .set({
          ratingValue: data.avg_rating ?? 7,
          ratingCount: data.count_rating ?? 0,
          worstRating: 1,
          bestRating: 10,
        })
        .build(),
    });
  }

  const ldBreadcrumbs = new BreadcrumbListBuilder().set({
    itemListElement: [
      new ListItemBuilder()
        .set({
          position: 1,
          name: t(`catalog.meta.${siteConfig.contentType}.title`),
          item: new UrlBuilder(
            siteConfig.routing.url,
            Routing.Title.catalog({ params: { content: siteConfig.contentType } })
          ).build(),
        })
        .build(),
      new ListItemBuilder()
        .set({
          position: 2,
          name: data.type.name,
          item: new UrlBuilder(
            siteConfig.routing.url,
            Routing.Title.catalog({
              params: { content: siteConfig.contentType },
              query: { types: data.type.id },
            })
          ).build(),
        })
        .build(),
      new ListItemBuilder()
        .set({
          position: 3,
          name: data.main_name,
          item: new UrlBuilder(siteConfig.routing.url, siteConfig.contentType, data.dir).build(),
        })
        .build(),
    ],
  });

  return (
    <>
      <script
        id="title-breadcrumbs-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: `${JSON.stringify(ldBreadcrumbs.build())}` }}
      />
      <script
        id="title-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: `${JSON.stringify(ldTitle.build())}` }}
      />
    </>
  );
};
