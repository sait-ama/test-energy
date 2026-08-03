import { PropsWithChildren } from 'react';
import { notFound } from 'next/navigation';

import { canReadPostsFeed } from '~entities/post/model/ability/forum/actions';
import { getCurrentSiteConfig } from '~shared/config/site-config';

export default ({ children }: PropsWithChildren) => {
  const { features } = getCurrentSiteConfig()!;
  const canRead = canReadPostsFeed({ features });
  if (!canRead) notFound();

  return children;
};
