import { redirect } from 'next/navigation';

import { Routing } from '~shared/config/routing';
import type { NextPageParams } from '~shared/types/next';

export default async (props: NextPageParams<{ id: string }, Record<string, string>>) => {
  const [{ id }, search, segment] = await Promise.all([
    props.params,
    props.searchParams,
    props.segment,
  ]);

  if (!segment)
    redirect(
      Routing.User.detail({
        params: { id, tab: 'social' as const, subTab: 'exchanges' },
        query: search,
      })
    );
};
