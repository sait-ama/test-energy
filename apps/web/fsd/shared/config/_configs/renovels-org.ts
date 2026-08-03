import { SocialProviders } from '~shared/api/models/user';
import { reSocial, russianLocalization } from '~shared/config/_configs/common';
import {
  ContentTypes,
  SiteArticles,
  SiteConfig,
  SiteNames,
  SiteUrls,
} from '~shared/config/constants';
import { Features } from '~shared/config/feature-flags';

export const renovelsConfig = {
  contentType: ContentTypes.NOVEL,
  routing: {
    hostname: SiteUrls.ReNovelsOrg,
    url: `https://${SiteUrls.ReNovelsOrg}`,
  },
  site: {
    contacts: {
      email: 'contact@remanga.org',
      supportUrl: 'https://vk.com/im?media=&sel=-185404064',
      legalCredentials:
        'ООО РЕКОМИКС, юр. адрес: г. Москва, пер Столовый, д. 6, офис 214А, офис 223',

      social: reSocial,
    },
    name: SiteNames.ReNovels,
    redirects: [],
  },
  auth: {
    methods: {
      [SocialProviders.VK]: true,
      [SocialProviders.DISCORD]: false,
      [SocialProviders.GOOGLE]: true,
      [SocialProviders.YANDEX]: true,
      [SocialProviders.TELEGRAM]: true,
    },
    limitations: {},
  },
  localization: russianLocalization,
  theme: {
    backgroundColor: '#000000',
    themeColor: '#3c83f6',
  },
  seo: {
    index: true,
    follow: true,
    meta: {
      defaultImage: '',
    },
  },
  features: {
    [Features.EMOJIS]: false,
    [Features.STICKERS]: true,
    [Features.BATTLEPASS]: false,
    [Features.FORUM]: true,
    [Features.OLD_VERSION_SWITCH]: false,
    [Features.EXTERNAL_TITLE_ADAPTATION]: false,
    [Features.REGISTER_BY_MAIL]: false,
    [Features.CARD_GEN]: false,
    [Features.CHAT]: true,
    [Features.SHORTS]: true,
  },
  entries: {
    about: {
      aboutUs: {
        route: '/about-us',
        entryId: 79,
      },
      vacancy: {
        route: '/vacancy',
        entryId: 62,
      },
      advertisers: {
        route: '/advertisers',
        entryId: 84,
      },
    },
    common: {
      dmca: {
        route: '/dmca',
        entryId: 41,
      },
      copyright: {
        route: '/copyright',
        entryId: 39,
      },
      faq: {
        route: '/faq',
        entryId: 2,
      },
      siteRules: {
        route: '/rules',
        entryId: 8,
        new: false,
      },
    },
    translators: {
      agencyContract: {
        route: '/agency-contract',
        entryId: 77,
      },
      advertisingRules: {
        route: '/advertising-rules',
        entryId: 56,
        invisible: true,
      },
      confidentialityAgreement: {
        route: '/confidentiality-agreement',
        entryId: 100,
      },
    },
    users: {
      terms: {
        route: '/terms-of-use',
        entryId: 80,
      },
      mobileApp: {
        route: '/mobile-app',
        entryId: 55,
      },
      publicOffer: {
        route: '/seller-public-offer',
        entryId: 29,
        invisible: true,
      },
      safeDeal: {
        route: '/safe-deal',
        entryId: 44,
        invisible: true,
      },
      subscriptionServiceAgreement: {
        route: '/subscription-service-agreement',
        entryId: 67,
        invisible: true,
      },
      subscriptionOffer: {
        route: '/subscription-offer',
        entryId: 68,
        invisible: true,
      },
      subscriptionAgreement: {
        route: '/subscription-agreement',
        entryId: 70,
        invisible: true,
      },
      cookiePolicy: {
        route: '/cookie-policy',
        entryId: 106,
      },
      personalDataProcessing: {
        route: '/personal-data-processing',
        entryId: 103,
      },
    },
  },
  articles: {
    [SiteArticles.USER_INFO]: 81,
    [SiteArticles.PERSONAL_DATA_PROCESSING]: 103,
    [SiteArticles.CONFIDENTIALITY_AGREEMENT]: 100,
    [SiteArticles.COOKIE_USAGE]: 106,
  },
} satisfies SiteConfig;
