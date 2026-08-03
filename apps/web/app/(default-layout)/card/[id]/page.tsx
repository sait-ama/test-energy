import { getTranslations } from 'next-intl/server';

import { getHeroCardQuery } from '~entities/inventory/model/queries';
import { CardOwnersList } from '~features/card-owners-list/ui/card-owners-list';
import { getQueryClient } from '~shared/api/react-query';
import { Routing } from '~shared/config/routing';
import { getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { htmlRegExp } from '~shared/lib/regexp/is-html';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import { Container } from '~shared/ui/container';

export const generateMetadata = fallbackDefaultMetadata<{ id: string }>(
  withMetadataCache(async ({ params }) => {
    const { id } = await params;
    const siteConfig = getSiteConfig()!;

    const t = await getTranslations('pages.hero-card.meta');
    const queryClient = getQueryClient();

    const card = await queryClient.fetchQuery(
      getHeroCardQuery({
        variables: { params: { cardId: id } },
        fetchOptions: {
          cache: 'no-cache',
        },
      })
    );

    return generateNextMetadata({
      title: t('title', {
        id: card?.id,
        character: card?.character?.name ?? '',
        title: card?.title?.main_name ?? '',
        author: card?.author?.username ?? '',
        rank: card.rank.slice(5).toUpperCase(),
        description: (card?.description ?? '').replace(htmlRegExp, ''),
      }),
      description: t('description', {
        id: card?.id,
        character: card?.character?.name ?? '',
        main_name: card?.title?.main_name ?? '',
        secondary_name: card?.title?.secondary_name ?? '',
        another_name: card?.title?.another_name ?? '',
        rank: card.rank.slice(5).toUpperCase(),
        siteName: siteConfig.site.name,
        author: card?.author?.username ?? '',
        description: (card?.description ?? '').replace(htmlRegExp, ''),
      }),
      canonical: Routing.Card.id({ params: { id } }),
    });
  }, 'card-detailed')
);

export default async function CardOwnersPage() {
  return (
    <Container slim className="mt-4">
      <CardOwnersList />
    </Container>
  );
}

export const dynamic = 'force-dynamic';
