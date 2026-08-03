import { SocialProviders } from '~shared/api/models/user';
import { russianLocalization } from '~shared/config/_configs/common';
import {
  ContentTypes,
  SiteArticles,
  SiteConfig,
  SiteNames,
  SiteUrls,
} from '~shared/config/constants';
import { Features } from '~shared/config/feature-flags';

export const rehentaiConfig = {
  contentType: ContentTypes.MANGA,
  routing: {
    hostname: SiteUrls.ReHentai,
    url: `https://${SiteUrls.ReHentai}`,
  },
  site: {
    contacts: {},
    app: {},
    name: SiteNames.ReHentai,
    description: '',
    redirects: [],
  },
  articles: {
    [SiteArticles.CONFIDENTIALITY_AGREEMENT]: -1,
    [SiteArticles.PERSONAL_DATA_PROCESSING]: -1,
  },
  auth: {
    methods: {
      [SocialProviders.VK]: false,
      [SocialProviders.DISCORD]: false,
      [SocialProviders.GOOGLE]: false,
      [SocialProviders.YANDEX]: false,
      [SocialProviders.TELEGRAM]: false,
    },
    limitations: {},
  },
  localization: russianLocalization,
  seo: {
    index: true,
    follow: true,
    meta: {
      defaultImage: '',
    },
  },
  theme: {
    backgroundColor: '#000000',
    themeColor: '#3c83f6',
  },
  features: {
    [Features.BATTLEPASS]: false,
    [Features.FORUM]: true,
    [Features.EMOJIS]: true,
    [Features.STICKERS]: true,
    [Features.OLD_VERSION_SWITCH]: false,
    [Features.EXTERNAL_TITLE_ADAPTATION]: false,
    [Features.REGISTER_BY_MAIL]: true,
  },
  entries: {
    about: {},
    common: {
      dmca: {
        route: '/dmca',
        entryId: 41,
      },
      copyright: {
        route: '/copyright',
        entryId: 39,
      },
    },
    translators: {},
    users: {},
  },
} satisfies SiteConfig;
