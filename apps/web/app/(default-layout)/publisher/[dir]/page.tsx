import { redirect } from 'next/navigation';

import { Routing } from '~shared/config/routing';
import { NextPageParams } from '~shared/types/next';

export default async function PublisherOldVersionPage(props: NextPageParams<{ dir: string }>) {
  const { dir } = await props.params;

  redirect(Routing.Publisher.detail({ params: { dir, tab: 'about' } }));
}

export const dynamic = 'force-dynamic';
