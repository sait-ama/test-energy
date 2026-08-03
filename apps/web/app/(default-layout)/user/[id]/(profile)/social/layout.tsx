import { PropsWithChildren } from 'react';

import { NextPageParams } from '~shared/types/next';

import { SocialLayout } from './_layout';

export default async function Layout({ children }: NextPageParams & PropsWithChildren) {
  return <SocialLayout>{children}</SocialLayout>;
}
