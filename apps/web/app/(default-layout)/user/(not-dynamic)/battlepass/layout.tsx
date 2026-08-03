import { ReactNode } from 'react';
import { notFound } from 'next/navigation';

import { getSiteConfig } from '~shared/config/site-config';

export default function BattlepassRootLayout({ children }: { children: ReactNode }) {
  const siteConfig = getSiteConfig()!;

  if (!siteConfig.features.BATTLEPASS) notFound();

  return children;
}
