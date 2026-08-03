import { redirect } from 'next/navigation';

import { Routing } from '~shared/config/routing';

export default async function NotificationsPage() {
  redirect(Routing.User.notifications({ params: { tab: '0' } }));
}

export const dynamic = 'force-dynamic';
