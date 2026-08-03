import { getTranslations } from 'next-intl/server';

import { getPublisherQuery } from '~entities/publisher/model/queries';
import { PublisherRepository } from '~entities/publisher/model/repository';
import { PublisherComments } from '~pages/(publisher)/comments/ui/publisher-comments';
import { PublisherDetailBreadcrumbsLd } from '~pages/(publisher)/seo/ld';
import { getQueryClient } from '~shared/api/react-query';
import { getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';

export const generateMetadata = fallbackDefaultMetadata<{ dir: string }>(
  withMetadataCache(async (props) => {
    const { dir } = await props.params;
    const t = await getTranslations('publisher-comments-page.meta');

    const siteConfig = getSiteConfig()!;
    const queryClient = getQueryClient();

    const { content: publisher } = await queryClient.fetchQuery(
      getPublisherQuery({
        variables: { params: { dir } },
        fetchOptions: { cache: 'no-cache', next: { revalidate: 60 * 60 } },
      })
    );

    return generateNextMetadata({
      title: t('title', { name: publisher.name, typeId: publisher.type.id, id: publisher.id }),
      description: t('description', {
        id: publisher.id,
        siteName: siteConfig.site.name,
        name: publisher.name,
        typeId: publisher.type.id,
      }),
      index: false,
      follow: false,
    });
  }, 'publisher-comments')
);

export default async function Comments(props: { params: Promise<{ dir: string }> }) {
  const params = await props.params;
  const data = await PublisherRepository.getPublisherByDir({ params: { dir: params.dir } });
  const publisher = data.content;

  return (
    <>
      <PublisherDetailBreadcrumbsLd tab="comments" />
      <PublisherComments
        canPinComment={false}
        target={{
          publisher_id: publisher.id,
        }}
      />
    </>
  );
}

export const dynamic = 'force-dynamic';
