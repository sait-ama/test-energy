import { redirect } from 'next/navigation';

import { Routing } from '~shared/config/routing';
import type { NextPageParams } from '~shared/types/next';

export default async ({ params }: NextPageParams<{ dir: string }>) => {
  const { dir } = await params;
  redirect(Routing.Club.clubByDirSettings({ params: { dir, tab: 'about' } }));
};

export const dynamic = 'force-dynamic';
