import { unauthorized } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { getQueryClient } from '~shared/api/react-query';
import { getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { getSession } from '~shared/lib/session/get-session';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import { Container } from '~shared/ui/container';
// import { CreatePostForm } from '~widgets/post/(forum)/forum-post-changing-form/ui/create/create-post-form';
import { CreatePostForm } from '~widgets/post/(forum)/forum-post-changing-form/ui/create/create-form';

export const generateMetadata = fallbackDefaultMetadata(
  withMetadataCache(async () => {
    const t = await getTranslations('pages.forum-post-create.meta');

    const siteConfig = getSiteConfig()!;

    return generateNextMetadata({
      title: t('title'),
      description: t('description', {
        siteName: siteConfig.site.name,
      }),
      index: false,
      follow: false,
    });
  }, 'post-create')
);

export default async function CreatePost() {
  const queryClient = getQueryClient();

  const session = await getSession();

  if (!session?.id) unauthorized();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Container slim className="flex gap-4 px-1 py-1 md:py-4">
        <CreatePostForm />
      </Container>
    </HydrationBoundary>
  );
}

export const dynamic = 'force-dynamic';
