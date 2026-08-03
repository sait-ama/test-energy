import { forbidden, notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { getCardFormsKey } from '~entities/inventory/model/queries';
import { getSuspenseUserQuery } from '~entities/user/model/queries';
import { UserRepository } from '~entities/user/model/repository';
import { CreateExchange } from '~pages/(user)/create-exchange/ui/create-exchange';
import { getQueryClient } from '~shared/api/react-query';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { getSession } from '~shared/lib/session/get-session';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import { NextPageParams } from '~shared/types/next';

export const generateMetadata = fallbackDefaultMetadata<{ id: string }>(
  withMetadataCache(async (props) => {
    const { id } = await props.params;
    const t = await getTranslations('exchange-create.meta');

    const user = await UserRepository.userById({ params: { userId: id } }, { cache: 'no-cache' });

    const username = user.username;

    const title = t('title', { username });
    const description = t('description', { username });

    return generateNextMetadata({
      title,
      description,
      index: false,
      follow: false,
    });
  }, 'user-exchange-create')
);

export default async function CreateExchangePage(props: NextPageParams<{ id: string }>) {
  const params = await props.params;
  const { id } = params;
  const queryClient = getQueryClient();

  const session = await getSession();

  if (!session || session.id === Number(id)) forbidden();

  const prefetches = Promise.all([
    queryClient.fetchQuery(getSuspenseUserQuery({ variables: { params: { userId: id } } })),
    queryClient.prefetchQuery(getCardFormsKey()),
  ]);

  const [target] = await prefetches;

  if (!target) notFound();
  if (!target.is_exchanges_enable) forbidden();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CreateExchange />
    </HydrationBoundary>
  );
}

export const dynamic = 'force-dynamic';
