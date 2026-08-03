// import 'server-only'

import { getSiteConfig } from '~shared/config/site-config';

export const appendSitename = (string: string) => {
  const config = getSiteConfig()!;

  const sitename = config.site.name;

  return `${string} — ${sitename}`;
};
