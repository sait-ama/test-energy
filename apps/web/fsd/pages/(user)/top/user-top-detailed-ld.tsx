import { getTranslations } from 'next-intl/server';

import { UserTopOrdering } from '~shared/api/models/user';
import { Routing } from '~shared/config/routing';
import { getSiteConfig } from '~shared/config/site-config';
import { EventDateType, getEvent } from '~shared/lib/event-management/get-event';
import { BreadcrumbListBuilder, ListItemBuilder } from '~shared/seo/schema-org';
import { UrlBuilder } from '~shared/utils/url-formatter';

export type UserTopDetailBreadcrumbsLdProps = {
  tab: UserTopOrdering;
};

export const UserTopDetailBreadcrumbsLd = async ({ tab }: UserTopDetailBreadcrumbsLdProps) => {
  const siteConfig = getSiteConfig()!;

  const t = await getTranslations('pages');
  const event = getEvent();
  const tabIsEvent = tab === UserTopOrdering.EVENT_POINTS;
  const isEvent = tabIsEvent && event !== EventDateType.DEFAULT;
  const type = isEvent ? event : tab;
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
          name: t('user-tops.meta.breadcrumbs-name', { type: tab }),
          item: new UrlBuilder(siteConfig.routing.url, Routing.User.top()).build(),
        })
        .build(),
      new ListItemBuilder()
        .set({
          position: 3,
          name: t(`user-top.meta${isEvent ? '.event' : ''}.breadcrumbs-name`, { type }),
          item: new UrlBuilder(
            siteConfig.routing.url,
            Routing.User.topDetail({ params: { tab } })
          ).build(),
        })
        .build(),
    ],
  });

  return (
    <script
      id="user-top-detail-breadcrumbs-ld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: `${JSON.stringify(ldBreadcrumbs.build())}` }}
    />
  );
};
