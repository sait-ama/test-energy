import { remangaConfig } from '~shared/config/_configs/remanga-org';
import { SiteArticles, SiteConfig, SiteUrls } from '~shared/config/constants';

export const mirrorConfig = {
  ...remangaConfig,
  routing: {
    hostname: SiteUrls.ReMangaOrgMirror,
    url: `https://${SiteUrls.ReMangaOrgMirror}`,
  },
  articles: {
    ...remangaConfig.articles,
    [SiteArticles.COOKIE_USAGE]: 105,
    [SiteArticles.CONFIDENTIALITY_AGREEMENT]: 99,
    [SiteArticles.PERSONAL_DATA_PROCESSING]: 102,
  },
  entries: {
    ...remangaConfig.entries,
    translators: {
      ...remangaConfig.entries.translators,
      confidentialityAgreement: {
        route: '/confidentiality-agreement',
        entryId: 99,
      },
    },
    users: {
      ...remangaConfig.entries.users,
      cookiePolicy: {
        route: '/cookie-policy',
        entryId: 105,
      },
      personalDataProcessing: {
        route: '/personal-data-processing',
        entryId: 102,
      },
    },
  },
} satisfies SiteConfig;
