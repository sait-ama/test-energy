import { getTranslations } from 'next-intl/server';

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { getUserRequestList } from '~entities/user/model/queries';
import { UserRequestList } from '~pages/(user)/requests-list/ui/requests-list';
import type { ChangeRequestStatus, ChangeRequestType } from '~shared/api/models/panel';
import { getQueryClient } from '~shared/api/react-query';
import { getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import type { NextPageParams } from '~shared/types/next';

export const generateMetadata = fallbackDefaultMetadata(
  withMetadataCache(async () => {
    const t = await getTranslations('pages.user-panel-requests.meta');

    const siteConfig = getSiteConfig()!;

    return generateNextMetadata({
      title: t('title'),
      description: t('description', { siteName: siteConfig.site.name }),
      follow: false,
      index: false,
    });
  }, 'user-requests')
);

export default async function UserRequestListPage(
  props: NextPageParams<
    { id: string },
    {
      status?: ChangeRequestStatus;
      type?: ChangeRequestType;
    }
  >
) {
  const searchParams = await props.searchParams;
  const queryClient = getQueryClient();
  const status = searchParams.status as ChangeRequestStatus | 'all' | undefined;
  const type = searchParams.type as ChangeRequestType | 'all' | undefined;
  await queryClient.prefetchInfiniteQuery(
    getUserRequestList({
      variables: {
        query: {
          status: status !== 'all' ? status : undefined,
          type: type !== 'all' ? type : undefined,
        },
      },
    })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UserRequestList />
    </HydrationBoundary>
  );
}

export const dynamic = 'force-dynamic';
