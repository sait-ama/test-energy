import type { ReactNode } from 'react';

import { Followers } from '~pages/(user)/followers/ui/followers';

export default async function Layout({ children, params }: { children: ReactNode }) {
  const { id } = (await params) as { id: NumberIsomorphic };
  return (
    <Followers>
      <Followers.HeaderOver userId={id} />
      <div className="flex w-full items-center justify-between gap-4">
        <Followers.Header />
        <Followers.Ordering />
      </div>
      {children}
    </Followers>
  );
}
