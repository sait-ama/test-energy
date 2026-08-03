import { remangaConfig } from '~shared/config/_configs/remanga-org';
import { Features } from '~shared/config/feature-flags';

export const demoRemangaConfig = {
  ...remangaConfig,
  features: {
    ...remangaConfig.features,
    [Features.CHAT]: true,
    [Features.SHORTS]: true,
    [Features.CARD_GEN]: true,
  },
};
