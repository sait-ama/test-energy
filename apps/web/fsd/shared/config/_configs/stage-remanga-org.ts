import { remangaConfig } from '~shared/config/_configs/remanga-org';

import { SiteUrls } from '../constants';

export const stageRemangaConfig = {
  ...remangaConfig,
  routing: {
    hostname: SiteUrls.StageReMangaOrg,
    url: `https://${SiteUrls.StageReMangaOrg}`,
  },
};
