import { getTranslations } from 'next-intl/server';

import { getPublisherQuery } from '~entities/publisher/model/queries';
import { PublisherContacts } from '~features/team-contacts/ui/publisher-contacts';
import { PublisherDetailBreadcrumbsLd } from '~pages/(publisher)/seo/ld';
import { getQueryClient } from '~shared/api/react-query';
import { Routing } from '~shared/config/routing';
import { getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { htmlRegExp } from '~shared/lib/regexp/is-html';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import type { NextPageParams } from '~shared/types/next';
import { EntityLayoutDescription, EntityLayoutDescriptionTitle } from '~shared/ui/entity-layout';

export const generateMetadata = fallbackDefaultMetadata<{ dir: string }>(
  withMetadataCache(async (props) => {
    const { dir } = await props.params;
    const t = await getTranslations('publisher-about-page.meta');

    const siteConfig = getSiteConfig()!;
    const queryClient = getQueryClient();

    const { content: publisher } = await queryClient.fetchQuery(
      getPublisherQuery({
        variables: { params: { dir } },
        fetchOptions: { cache: 'no-cache' },
      })
    );

    return generateNextMetadata({
      title: t('title', { name: publisher.name, id: publisher.id, type: publisher.type.name }),
      description: t('description', {
        siteName: siteConfig.site.name,
        name: publisher.name,
        type: publisher.type.name,
        likes: publisher.count_votes,
        titles: publisher.count_titles,
        chapters: publisher.count_period_chapters,
        description: (publisher.description ?? '').replace(htmlRegExp, ''),
      }),
      canonical: Routing.Publisher.detail({ params: { dir, tab: 'about' } }),
    });
  }, 'publisher-about')
);

export default async function Home(props: NextPageParams<{ dir: string }>) {
  const params = await props.params;
  const { dir } = params;
  const queryClient = getQueryClient();

  const data = await queryClient.fetchQuery(getPublisherQuery({ variables: { params: { dir } } }));

  const publisher = data.content;

  return (
    <>
      <PublisherDetailBreadcrumbsLd tab="about" />
      <PublisherContacts />
      <EntityLayoutDescription
        className="lg:col-span-2"
        title={<EntityLayoutDescriptionTitle>О команде</EntityLayoutDescriptionTitle>}
      >
        {publisher.description}
      </EntityLayoutDescription>
    </>
  );
}

export const dynamic = 'force-dynamic';
