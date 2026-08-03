import { PropsWithChildren } from 'react';
import { forbidden } from 'next/navigation';

import { getHeroCardsByUserInfiniteQuery } from '~entities/inventory/model/queries';
import { getQueryClient } from '~shared/api/react-query';
import { getSession } from '~shared/lib/session/get-session';
import { Container } from '~shared/ui/container';

export default async function UpgradeCardsPage({ children }: PropsWithChildren) {
  const client = getQueryClient();
  const session = await getSession();

  if (!session) forbidden();

  await client.prefetchInfiniteQuery(
    getHeroCardsByUserInfiniteQuery({
      variables: {
        params: {
          userId: session?.id,
        },
        query: {
          // @ts-ignore
          rank: undefined,
        },
      },
    })
  );

  return <Container slim>{children}</Container>;
}
