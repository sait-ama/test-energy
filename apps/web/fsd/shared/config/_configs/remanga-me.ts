import { remangaConfig } from '~shared/config/_configs/remanga-org';
import type { SiteConfig } from '~shared/config/constants';
import { SiteUrls } from '~shared/config/constants';

export const remangaMeConfig = {
  ...remangaConfig,
  routing: {
    hostname: SiteUrls.ReMangaMe,
    url: `https://${SiteUrls.ReMangaMe}`,
  },
} satisfies SiteConfig;
