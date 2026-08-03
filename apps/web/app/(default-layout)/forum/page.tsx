import { redirect } from 'next/navigation';

import { Routing } from '~shared/config/routing';
import type { NextPageParams } from '~shared/types/next';
// @ts-ignore
export default async (props: NextPageParams<never, void>) => {
  const searchParams = await props.searchParams;
  return redirect(Routing.Forum.Feed.get({ query: { ...searchParams } }));
};

export const dynamic = 'force-dynamic';
