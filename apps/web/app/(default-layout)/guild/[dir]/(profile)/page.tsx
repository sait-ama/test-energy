import { redirect } from 'next/navigation';

import { Routing } from '~shared/config/routing';
import type { NextPageParams } from '~shared/types/next';

export default async function ClubPage(props: NextPageParams<{ dir: string }>) {
  const params = await props.params;
  redirect(Routing.Club.clubByDir({ params: { dir: params.dir, tab: 'about' } }));
}

export const dynamic = 'force-dynamic';
