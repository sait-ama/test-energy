import { notFound, redirect } from 'next/navigation';

import { Routing } from '~shared/config/routing';
import { getSession } from '~shared/lib/session/get-session';

export default async function YearSummary() {
  const session = await getSession();

  if (!session) {
    notFound();
  }

  redirect(Routing.YearSummary.byUser({ params: { id: session.id } }));

  return null;
}

export const dynamic = 'force-dynamic';
