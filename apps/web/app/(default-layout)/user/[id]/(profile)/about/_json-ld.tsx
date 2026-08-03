'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { useSiteConfig } from '~app/providers/site-config-provider';
import { useUserForms, useUserSuspenseQuery } from '~entities/user/model/queries';
import { Routing } from '~shared/config/routing';
import { htmlRegExp } from '~shared/lib/regexp/is-html';
import {
  OrganizationBuilder,
  PersonBuilder,
  ProfilePageBuilder,
  ViewActionBuilder,
  WebPageBuilder,
  WebSiteBuilder,
} from '~shared/seo/schema-org';
import { UrlFormatter } from '~shared/utils/url-formatter';

export const UserJsonLd = () => {
  const { id } = useParams<{ id: string }>();
  const tJsonLd = useTranslations('pages.user-about.meta.json-ld');
  const tUserPage = useTranslations('user');
  const tReusable = useTranslations('reusable');
  const { data: user } = useUserSuspenseQuery({ variables: { params: { userId: id } } });
  const { data: forms } = useUserForms({ get: ['sex'] });
  const siteConfig = useSiteConfig();

  if (!user) return;

  // const formattedDateJoined = dayjs(user.date_joined).format(
  //   siteConfig.localization.formats.dateFormat
  // );

  // no deps cause its used once
  const schema = useMemo(
    () =>
      new ProfilePageBuilder()
        .set({
          name: tJsonLd('title', { username: user.username }),
          mainEntity: new PersonBuilder()
            .set({
              name: user.username,
              identifier: id,
              //@ts-ignore
              gender: forms?.content.sex.find((it) => it.id == user.sex).name,
              image: UrlFormatter.media(user.avatar.mid),
              memberOf: new OrganizationBuilder()
                .set({
                  name: siteConfig.site.name,
                  url: siteConfig.routing.url,
                })
                .build(),
              // registerDate: formattedDateJoined,
              description: (user.description || '')
                .replace(htmlRegExp, '')
                .split('.')
                .slice(0, 2)
                .join('.'),
              knowsAbout: [
                tReusable('entities.manga'),
                tReusable('entities.manhwa'),
                tReusable('entities.collectible-cards'),
              ],
              follows: new PersonBuilder()
                .set({
                  name: tJsonLd('subscribers'),
                  // numberOfFollowers: 0,
                })
                .build(),
              colleague: new PersonBuilder()
                .set({
                  name: tJsonLd('friends'),
                  // numberOfColleagues: 15,
                })
                .build(),
            })
            .build(),
          // mainContentOfPage: [
          //   new ItemListBuilder()
          //     .set({
          //       name: tJsonLd('user-stats'),
          //       itemListElement: [
          //         new ListItemBuilder()
          //           .set({
          //             position: 1,
          //             item: new InteractionCounterBuilder()
          //               .set({
          //                 interactionType: 'https://schema.org/WatchAction',
          //                 userInteractionCount: user.count_views,
          //                 name: tJsonLd('total-views'),
          //               })
          //               .build(),
          //           })
          //           .build(),
          //       ],
          //     })
          //     .build(),
          //   new ItemListBuilder()
          //     .set({
          //       name: tJsonLd('badges'),
          //       description: tJsonLd('user-achievements'),
          //       numberOfItems: 7,
          //       itemListElement: [
          //         new ListItemBuilder()
          //           .set({
          //             position: 1,
          //             item: new ThingBuilder()
          //               .set({
          //                 name: 'Сердце читателя',
          //                 image: '[URL изображения бейджа]',
          //                 description: 'A',
          //               })
          //               .build(),
          //           })
          //           .build(),
          //       ],
          //     })
          //     .build(),
          //   new ItemListBuilder()
          //     .set({
          //       name: tJsonLd('guild-member'),
          //       description: 'Список гильдий пуст',
          //     })
          //     .build(),
          //   new ItemListBuilder()
          //     .set({
          //       name: tJsonLd('publisher-member'),
          //       description: 'Пусто',
          //     })
          //     .build(),
          //   new ItemListBuilder()
          //     .set({
          //       name: tJsonLd('hero-cards'),
          //       description: 'Пусто',
          //       potentialAction: new ViewActionBuilder()
          //         .set({
          //           target: UrlFormatter.createUrl(
          //             siteConfig.routing.url,
          //             Routing.User.detail({ params: { tab: 'inventory', id }, query: { type: 'cards' } })
          //           ),
          //           name: 'Показать все',
          //         })
          //         .build(),
          //     })
          //     .build(),
          //   new ItemListBuilder()
          //     .set({
          //       name: tJsonLd('friends'),
          //       numberOfItems: 7,
          //       itemListElement: [
          //         new ListItemBuilder()
          //           .set({
          //             position: 1,
          //             item: new PersonBuilder()
          //               .set({
          //                 name: 'Сайтама',
          //                 image: '[URL аватара друга]',
          //                 description: '3 дня',
          //               })
          //               .build(),
          //           })
          //           .build(),
          //       ],
          //       potentialAction: new ViewActionBuilder()
          //         .set({
          //           target: UrlFormatter.createUrl(
          //             siteConfig.routing.url,
          //             Routing.User.friends({ params: { id } })
          //           ),
          //           name: 'Показать все',
          //         })
          //         .build(),
          //     })
          //     .build(),
          //   new ItemListBuilder()
          //     .set({
          //       name: tJsonLd('subscribers'),
          //       description: 'Пусто',
          //       potentialAction: new ViewActionBuilder()
          //         .set({
          //           target: UrlFormatter.createUrl(
          //             siteConfig.routing.url,
          //             Routing.User.followers({ params: { id } })
          //           ),
          //           name: 'Показать все',
          //         })
          //         .build(),
          //     })
          //     .build(),
          // ],
          potentialAction: [
            new ViewActionBuilder()
              .set({
                target: UrlFormatter.createUrl(
                  siteConfig.routing.url,
                  Routing.User.detail({ params: { id, tab: 'about' } })
                ),
                name: tUserPage('tabs.profile'),
              })
              .build(),
            new ViewActionBuilder()
              .set({
                target: UrlFormatter.createUrl(
                  siteConfig.routing.url,
                  Routing.User.detail({ params: { id, tab: 'inventory' } })
                ),
                name: tUserPage('tabs.inventory'),
              })
              .build(),
            new ViewActionBuilder()
              .set({
                target: UrlFormatter.createUrl(
                  siteConfig.routing.url,
                  Routing.User.detail({ params: { id, subTab: 'posts', tab: 'social' } })
                ),
                name: tUserPage('tabs.posts'),
              })
              .build(),
            new ViewActionBuilder()
              .set({
                target: UrlFormatter.createUrl(
                  siteConfig.routing.url,
                  Routing.User.detail({ params: { id, subTab: 'comments', tab: 'social' } })
                ),
                name: tUserPage('tabs.comments'),
              })
              .build(),
          ],
          mainEntityOfPage: new WebPageBuilder()
            .set({
              name: tJsonLd('title', { username: user.username }),
              isPartOf: new WebSiteBuilder()
                .set({
                  name: siteConfig.site.name,
                  url: siteConfig.routing.url,
                })
                .build(),
            })
            .build(),
        })
        .build(),
    []
  );

  const stringifiedSchema = JSON.stringify(schema, null, 2);

  return (
    <script
      id="user-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: stringifiedSchema,
      }}
    />
  );
};
