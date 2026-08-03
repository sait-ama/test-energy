import { getTranslations } from 'next-intl/server';

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { getPublisherQuery } from '~entities/publisher/model/queries';
import { PublisherProfileForm } from '~features/(publisher)/forms/profile/ui/publisher-profile-form';
import { getQueryClient } from '~shared/api/react-query';
import { getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';

export const generateMetadata = fallbackDefaultMetadata<{ dir: string }>(
  withMetadataCache(async (props) => {
    const { dir } = await props.params;
    const t = await getTranslations('publisher-about-edit-page.meta');

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
      index: false,
      follow: false,
    });
  }, 'publisher-profile')
);

const ProfilePage = async () => {
  const queryClient = getQueryClient();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PublisherProfileForm />
    </HydrationBoundary>
  );
};

export default ProfilePage;

export const dynamic = 'force-dynamic';
