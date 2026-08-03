import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { NotificationsPage } from '~pages/(user)/notifications/notifications-page';
import { NotificationTabsRoot } from '~pages/(user)/notifications/ui/notifications-tabs';
import { Routing } from '~shared/config/routing';
import { getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { getSession } from '~shared/lib/session/get-session';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';

export const generateMetadata = fallbackDefaultMetadata(
  withMetadataCache(async () => {
    const t = await getTranslations('pages.user-notifications.meta');

    const siteConfig = getSiteConfig()!;

    return generateNextMetadata({
      title: t('title'),
      description: t('description', { siteName: siteConfig.site.name }),
      follow: false,
      index: false,
    });
  }, 'user-notifications-detailed')
);

export default async function UserNotifications() {
  const session = (await getSession())!;

  if (!session) redirect(Routing.Home.main({ query: {} }));

  return (
    <NotificationTabsRoot>
      <NotificationsPage />
    </NotificationTabsRoot>
  );
}

export const dynamic = 'force-dynamic';
