import { ReactElement, Suspense } from 'react';

import { UserHeader } from '~pages/(user)/header/user-header';
import { RootTabs } from '~pages/(user)/root-tabs';
import type { NextPageParams } from '~shared/types/next';
import { EntityLayoutContent } from '~shared/ui/entity-layout';

import { PrivateProfileCheck } from './_private-profile-check';
import { UserLayoutRoot } from './layout.client';

export default async function Layout(
  props: { children: ReactElement } & NextPageParams<{ id: string }>
) {
  const { children } = props;

  return (
    <UserLayoutRoot className="gap-2">
      <EntityLayoutContent slim>
        <Suspense>
          <UserHeader />
        </Suspense>
      </EntityLayoutContent>
      <Suspense>
        <PrivateProfileCheck>
          <EntityLayoutContent slim>
            <RootTabs className="col-span-full" />
          </EntityLayoutContent>
          <EntityLayoutContent slim>{children}</EntityLayoutContent>
        </PrivateProfileCheck>
      </Suspense>
    </UserLayoutRoot>
  );
}
