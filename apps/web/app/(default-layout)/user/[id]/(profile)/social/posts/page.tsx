import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { getSuspenseUserQuery } from '~entities/user/model/queries';
import { UserDetailBreadcrumbsLd } from '~pages/(user)/ld';
import { getQueryClient } from '~shared/api/react-query';
import { Routing } from '~shared/config/routing';
import { getCurrentSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import type { NextPageParams } from '~shared/types/next';
import { PostContent } from '~widgets/post/post-feed-subject';

export const generateMetadata = fallbackDefaultMetadata(
  withMetadataCache(async (props: { params: Promise<{ id: string }> }) => {
    const params = await props.params;
    const t = await getTranslations('pages.user-posts.meta');
    const { id } = params;

    const queryClient = getQueryClient();

    const user = await queryClient.fetchQuery(
      getSuspenseUserQuery({
        variables: { params: { userId: id } },
        fetchOptions: { cache: 'no-cache' },
      })
    );
    const username = user.username;

    return generateNextMetadata({
      title: t('title', { username }),
      description: t('description', { username }),
      canonical: Routing.User.detail({ params: { id, tab: 'social' as const, subTab: 'posts' } }),
    });
  }, 'user-posts')
);

const PostsListPage = async (props: NextPageParams<{ id: string }>) => {
  const params = await props.params;

  const { features } = getCurrentSiteConfig()!;
  if (!features.FORUM) notFound();

  return (
    <>
      <UserDetailBreadcrumbsLd tab="posts" />
      <PostContent query={{ user: params.id }} />
    </>
  );
};

export default PostsListPage;

export const dynamic = 'force-dynamic';
