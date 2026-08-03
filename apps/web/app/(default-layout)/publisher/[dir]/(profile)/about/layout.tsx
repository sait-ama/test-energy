import type { ReactNode } from 'react';

import { EntityLayoutContent } from '~shared/ui/entity-layout';

export default async function PublisherAboutLayout({
  children,
  members,
  followers,
}: {
  members: ReactNode;
  children: ReactNode;
  followers: ReactNode;
}) {
  return (
    <EntityLayoutContent className="flex flex-col gap-3">
      {children}
      {members}
      {followers}
    </EntityLayoutContent>
  );
}
