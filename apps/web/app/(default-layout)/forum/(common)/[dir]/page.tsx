import { ErrorBoundary } from 'react-error-boundary';
import { getTranslations } from 'next-intl/server';

import { mergeAuthorsObject } from '~entities/post/model/utils';
import { PostJsonLdAsync } from '~pages/post-single/ui/_json-ld';
import { PostSinglePageContent } from '~pages/post-single/ui/post';
import { client } from '~shared/api/client';
import { v2ForumRetrieve2Options } from '~shared/api/generated/tanstack';
import { getQueryClient } from '~shared/api/react-query';
import { Routing } from '~shared/config/routing';
import { getSiteConfig } from '~shared/config/site-config';
import { ServerPageError } from '~shared/lib/error/server-page-error';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { htmlRegExp } from '~shared/lib/regexp/is-html';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import type { NextPageParams } from '~shared/types/next';
import { Container } from '~shared/ui/container';
import { UrlFormatter } from '~shared/utils/url-formatter';
import { RightBlock } from '~widgets/post/layout/right-block';

export const generateMetadata = fallbackDefaultMetadata<{ dir: string }>(
  withMetadataCache(async ({ params }) => {
    const { dir } = await params;
    const queryClient = getQueryClient();

    const { author_publisher, author_user, author_club, ...post } = await queryClient.fetchQuery(
      v2ForumRetrieve2Options({ path: { dir }, client, cache: 'no-cache' })
    );

    const t = await getTranslations('pages.forum-post.meta');
    const author = mergeAuthorsObject(author_user, author_publisher, author_club);
    const config = getSiteConfig()!;

    const tags = post.tags.map((v) => v.name.toLowerCase());

    return generateNextMetadata({
      title: t('title', {
        title: post.header,
        id: post.id,
        author: author.name,
        authorType: author.type,
      }),
      description: t('description', {
        tags: tags.join(', '),
        text: (post.text ?? '').replace(htmlRegExp, ''),
        siteName: config.site.name,
        author: author.name,
        date: new Date(post.created_at),
        authorType: author.type,
      }),
      keywords: tags,
      og: {
        type: 'article',
        image: UrlFormatter.media(post.attachment?.high || '') as string,
        alt: post.header,
      },
      canonical: Routing.Forum.ByDir.get({ params: { dir } }),
    });
  }, 'post-edit')
);

export default async function ForumPost(props: NextPageParams<{ dir: string }>) {
  const params = await props.params;
  const { dir } = params;
  try {
    return (
      <Container slim className="flex gap-4 px-1 py-1 md:py-4">
        <PostSinglePageContent dir={dir} />
        <RightBlock />
        <ErrorBoundary fallback={null}>
          <PostJsonLdAsync dir={dir} />
        </ErrorBoundary>
      </Container>
    );
  } catch (error) {
    return <ServerPageError error={error} />;
  }
}

export const dynamic = 'force-dynamic';
