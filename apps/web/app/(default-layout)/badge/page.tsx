import { getTranslations } from 'next-intl/server';

import { ReText } from '@re/ui-kit/ui/text';

import { BadgeWithModal } from '~entities/user/ui/badge-card';
import { FormsTypes } from '~shared/api/models/forms';
import { getQueryClient } from '~shared/api/react-query';
import { Routing } from '~shared/config/routing';
import { getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { getTypesBaseKey } from '~shared/lib/use-types-base';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import { Container } from '~shared/ui/container';

export const generateMetadata = fallbackDefaultMetadata(
  withMetadataCache(async () => {
    const t = await getTranslations('site-badges.meta');
    const siteConfig = getSiteConfig()!;

    return generateNextMetadata({
      title: t('title'),
      description: t('description', { siteName: siteConfig.site.name }),
      canonical: Routing.Badge.allList(),
    });
  }, 'badges-list')
);

export default async function AllBadgesList() {
  const queryClient = getQueryClient();

  const data = await queryClient.fetchQuery(
    getTypesBaseKey({
      type: FormsTypes.USERS,
      get: ['all_badges'],
    })
  );

  return (
    <Container slim className="mt-4 flex flex-col gap-4 px-2">
      <ReText size="xl" weight="semibold">
        Бейджи сайта
      </ReText>
      <div className="xs:grid-cols-3 grid grid-cols-2 gap-2 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7">
        {data.content.all_badges.map((it) => (
          <BadgeWithModal key={it.id} model={it} />
        ))}
      </div>
    </Container>
  );
}

export const revalidate = 3600;
export const dynamic = 'force-dynamic';
