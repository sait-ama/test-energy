import type { PropsWithChildren, ReactNode } from 'react';

import type { NextPageParams } from '~shared/types/next';

export default async ({
  children,
  members,
  bonuses,
}: PropsWithChildren & {
  bonuses: ReactNode;
  members: ReactNode;
} & NextPageParams<{ dir: string }>) => {
  return (
    <div className="flex flex-col gap-2">
      {children}
      {bonuses}
      {members}
    </div>
  );
};
