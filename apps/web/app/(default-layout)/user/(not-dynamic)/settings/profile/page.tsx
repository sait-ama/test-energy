import { getTranslations } from 'next-intl/server';

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { getSuspenseUserQuery, getUserFormsKey } from '~entities/user/model/queries';
import { UserProfileSettings } from '~features/change-common-settings/ui/user-profile-settings';
import { getQueryClient } from '~shared/api/react-query';
import { getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { getSession } from '~shared/lib/session/get-session';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';

export const generateMetadata = fallbackDefaultMetadata(
  withMetadataCache(async () => {
    const t = await getTranslations('pages.user-profile-edit.meta');

    const siteConfig = getSiteConfig()!;

    return generateNextMetadata({
      title: t('title'),
      description: t('description', { siteName: siteConfig.site.name }),
      follow: false,
      index: false,
    });
  }, 'user-settings-profile')
);

export default async function UserProfileSettingsTab() {
  const queryClient = getQueryClient();
  const session = (await getSession())!;

  const prefetches: Promise<void>[] = [
    queryClient.prefetchQuery(
      getUserFormsKey({ get: ['adult', 'sex', 'taglines', 'achievements'] })
    ),
    queryClient.prefetchQuery(
      getSuspenseUserQuery({ variables: { params: { userId: session.id.toString() } } })
    ),
  ];

  await Promise.all(prefetches);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UserProfileSettings />
    </HydrationBoundary>
  );
}

export const dynamic = 'force-dynamic';
