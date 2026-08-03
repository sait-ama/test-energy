import { getTranslations } from 'next-intl/server';

import { getPublisherQuery } from '~entities/publisher/model/queries';
import { PublisherDetailBreadcrumbsLd } from '~pages/(publisher)/seo/ld';
import { getQueryClient } from '~shared/api/react-query';
import { Routing } from '~shared/config/routing';
import { getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';

import { PublisherPosts } from './_posts';

export const generateMetadata = fallbackDefaultMetadata<{ dir: string }>(
  withMetadataCache(async (props) => {
    const { dir } = await props.params;
    const t = await getTranslations('publisher-posts-page.meta');

    const siteConfig = getSiteConfig()!;
    const queryClient = getQueryClient();

    const { content: publisher } = await queryClient.fetchQuery(
      getPublisherQuery({
        variables: { params: { dir } },
        fetchOptions: { cache: 'force-cache', next: { revalidate: 60 * 60 } },
      })
    );

    return generateNextMetadata({
      title: t('title', { name: publisher.name, id: publisher.id, typeId: publisher.type.id }),
      description: t('description', {
        siteName: siteConfig.site.name,
        name: publisher.name,
        id: publisher.id,
        typeId: publisher.type.id,
      }),
      canonical: Routing.Publisher.detail({ params: { dir, tab: 'posts' } }),
    });
  }, 'publisher-posts')
);

export default async function Posts() {
  return (
    <>
      <PublisherDetailBreadcrumbsLd tab="posts" />
      <PublisherPosts />
    </>
  );
}

export const dynamic = 'force-dynamic';
