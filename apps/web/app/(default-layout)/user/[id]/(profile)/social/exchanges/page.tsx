import { getTranslations } from 'next-intl/server';

import { getSuspenseUserQuery } from '~entities/user/model/queries';
import { ExchangesContent } from '~pages/(user)/exchanges/ui/exchanges-tab';
import { UserDetailBreadcrumbsLd } from '~pages/(user)/ld';
import { getQueryClient } from '~shared/api/react-query';
import { Routing } from '~shared/config/routing';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';

export const generateMetadata = fallbackDefaultMetadata<{ id: string }>(
  withMetadataCache(async (props) => {
    const { id } = await props.params;
    const t = await getTranslations('pages.user-exchanges.meta');
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
      canonical: Routing.User.detail({
        params: { id, tab: 'social' as const, subTab: 'exchanges' },
      }),
    });
  }, 'user-exchanges')
);

export default async function ExchangesPage() {
  return (
    <>
      <UserDetailBreadcrumbsLd tab="exchanges" />
      <ExchangesContent />
    </>
  );
}

export const dynamic = 'force-dynamic';
