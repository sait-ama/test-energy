import { forbidden } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { v2ForumRetrieve2 } from '@re/api/generated/sdk.gen';

import { canWritePost } from '~entities/post/model/ability/post/actions';
import { ErrorBase } from '~features/error-view/ui/error-base';
import { client } from '~shared/api/client';
import { v2ForumRetrieve2Options } from '~shared/api/generated/tanstack';
import { getQueryClient } from '~shared/api/react-query';
import { getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { getSession } from '~shared/lib/session/get-session';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import type { NextPageParams } from '~shared/types/next';
import { Container } from '~shared/ui/container';
import { EditPostForm } from '~widgets/post/(forum)/forum-post-changing-form/ui/update/edit-form';

export const generateMetadata = fallbackDefaultMetadata<{ dir: string }>(
  withMetadataCache(async ({ params }) => {
    const { dir } = await params;
    const t = await getTranslations('pages.forum-post-edit.meta');
    const post = await v2ForumRetrieve2({ path: { dir }, client, cache: 'no-cache' }).then(
      (v) => v.data!
    );
    const config = getSiteConfig()!;

    return generateNextMetadata({
      title: t('title', {
        title: post.header,
      }),
      description: t('description', {
        title: post.header,
        siteName: config.site.name,
      }),
      index: false,
      follow: false,
    });
  }, 'post-edit-fallback')
);

export default async function EditPost(props: NextPageParams<{ dir: string }>) {
  const params = await props.params;
  const session = await getSession();
  const { dir } = params;
  const queryClient = getQueryClient();

  const post = await queryClient.fetchQuery(
    v2ForumRetrieve2Options({ path: { dir }, client, cache: 'no-store' })
  );

  if (!session?.id) forbidden();

  const canUpdate = canWritePost({
    postAuthorId: post?.author_user?.id,
    sessionId: session.id,
    isStaff: !!session?.is_staff,
    isSuper: false,
  });

  if (!canUpdate)
    return (
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Container slim className="flex-1 px-2">
          <ErrorBase
            image
            status={403}
            text={`У вас нет прав редактировать пост ${post.author_user?.username || post.author_publisher?.name}`}
            className="flex min-h-screen items-center justify-center"
          />
        </Container>
      </HydrationBoundary>
    );

  return (
    <Container slim className="flex px-1 py-1 md:py-4">
      <EditPostForm />
    </Container>
  );
}

export const dynamic = 'force-dynamic';
