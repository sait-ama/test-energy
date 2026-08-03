import { redirect } from 'next/navigation';

export default async function FeedPage() {
  return redirect('customization/feed/avatar');
}

export const dynamic = 'force-dynamic';
