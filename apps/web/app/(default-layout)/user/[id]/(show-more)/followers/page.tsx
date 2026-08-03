import { getTranslations } from 'next-intl/server';

import { UserRepository } from '~entities/user/model/repository';
import * as UserSubscriptionsRepository from '~entities/user-subscriptions/model/repository';
import { getFollowersPaginatedListQueryParams } from '~entities/user-subscriptions/model/utils/getParams';
import { Followers } from '~pages/(user)/followers/ui/followers';
import { Routing } from '~shared/config/routing';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import type { NextPageParams } from '~shared/types/next';

export const generateMetadata = fallbackDefaultMetadata<{ id: string }>(
  withMetadataCache(async (props) => {
    const { id } = await props.params;
    const t = await getTranslations('user.pages.followers.meta');

    const user = await UserRepository.userById({ params: { userId: id } }, { cache: 'no-cache' });

    const username = user.username;

    const title = t('title', { username });

    return generateNextMetadata({
      title,
      description: t('description', { username }),
      canonical: Routing.User.detail({ params: { id, tab: 'followers' } }),
    });
  }, 'user-followers')
);

export default async function FollowersPage(props: NextPageParams<{ id: string }>) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const { id, ...other } = getFollowersPaginatedListQueryParams({
    defaultSubType: 'author_users',
    searchParams,
    params,
  });

  const initialData = await UserSubscriptionsRepository.getFollowersPaginatedList({
    id,
    ...other,
    count: 20,
    page: 1,
  });

  return (
    <Followers.List
      subType="author_users"
      itemClassName="border border-border rounded-xs p-3"
      initialData={initialData}
    />
  );
}

export const dynamic = 'force-dynamic';
