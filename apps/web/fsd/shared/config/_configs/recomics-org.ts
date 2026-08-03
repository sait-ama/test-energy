import { SocialProviders } from '~shared/api/models/user';
import { reSocial, russianLocalization } from '~shared/config/_configs/common';
import { remangaConfig } from '~shared/config/_configs/remanga-org';
import {
  ContentTypes,
  SiteArticles,
  SiteConfig,
  SiteNames,
  SiteUrls,
} from '~shared/config/constants';
import { Features } from '~shared/config/feature-flags';

export const recomicsConfig: SiteConfig = {
  ...remangaConfig,
  contentType: ContentTypes.MANGA,
  routing: {
    hostname: SiteNames.ReComics,
    url: `https://${SiteUrls.ReComicsOrg}`,
  },
  seo: {
    index: true,
    follow: true,
    meta: {
      defaultImage:
        'https://api.recomics.org/media/titles/hero-with-another-opinion/445879d2e1098be84152fd353c9514d5.jpg',
    },
  },
  site: {
    contacts: {
      email: 'copyright@recomics.org',
      supportUrl: 'https://vk.com/im?media=&sel=-185404064',
      social: reSocial,
    },
    name: SiteNames.ReComics,
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
  articles: {
    [SiteArticles.PERSONAL_DATA_PROCESSING]: 104,
    [SiteArticles.CONFIDENTIALITY_AGREEMENT]: 101,
    [SiteArticles.COOKIE_USAGE]: 107,
  },
  features: {
    [Features.EMOJIS]: false,
    [Features.STICKERS]: true,
    [Features.BATTLEPASS]: false,
    [Features.FORUM]: false,
    [Features.CARD_GEN]: false,
  },
  entries: {
    about: {
      aboutUs: {
        route: '/about-us',
        entryId: 51,
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
        entryId: 42,
      },
      copyright: {
        route: '/copyright',
        entryId: 40,
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
        entryId: 30,
      },
      advertisingRules: {
        route: '/advertising-rules',
        entryId: 56,
        invisible: true,
      },
      confidentialityAgreement: {
        route: '/confidentiality-agreement',
        entryId: 101,
      },
    },
    users: {
      terms: {
        route: '/terms-of-use',
        entryId: 38,
      },
      mobileApp: {
        route: '/mobile-app',
        entryId: 55,
      },
      faq: {
        route: '/faq',
        entryId: 2,
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
        entryId: 34,
        invisible: true,
      },
      subscriptionOffer: {
        route: '/subscription-offer',
        entryId: 68,
        invisible: true,
      },
      cookiePolicy: {
        route: '/cookie-policy',
        entryId: 107,
      },
      personalDataProcessing: {
        route: '/personal-data-processing',
        entryId: 104,
      },
      subscriptionAgreement: {
        route: '/subscription-agreement',
        entryId: 70,
        invisible: true,
      },
    },
  },
};
