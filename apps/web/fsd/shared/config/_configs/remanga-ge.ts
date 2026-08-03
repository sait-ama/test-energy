import { SocialProviders } from '~shared/api/models/user';
import { reApp, reSocial, russianLocalization } from '~shared/config/_configs/common';
import {
  ConnectionCountry,
  ContentTypes,
  SiteArticles,
  SiteConfig,
  SiteNames,
  SiteUrls,
} from '~shared/config/constants';
import { Features } from '~shared/config/feature-flags';

export const remangaGeConfig = {
  contentType: ContentTypes.MANGA,
  routing: {
    hostname: SiteUrls.ReMangaGe,
    url: `https://${SiteUrls.ReMangaGe}`,
  },
  site: {
    contacts: {
      email: 'contact@remanga.ge',
      social: reSocial,
    },
    app: reApp,
    name: SiteNames.ReManga,
    description: '',
    redirects: [],
  },
  auth: {
    methods: {
      [SocialProviders.VK]: true,
      [SocialProviders.DISCORD]: true,
      [SocialProviders.GOOGLE]: true,
      [SocialProviders.YANDEX]: true,
      [SocialProviders.TELEGRAM]: true,
    },
    limitations: {
      [ConnectionCountry.RUSSIA]: {
        [SocialProviders.GOOGLE]: true,
        [SocialProviders.DISCORD]: true,
      },
    },
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
    [Features.BATTLEPASS]: true,
    [Features.FORUM]: true,
    [Features.EMOJIS]: true,
    [Features.STICKERS]: true,
    [Features.OLD_VERSION_SWITCH]: true,
    [Features.EXTERNAL_TITLE_ADAPTATION]: true,
    [Features.CHAT]: true,
    [Features.SHORTS]: true,
    [Features.REGISTER_BY_MAIL]: false,
  },
  articles: {
    [SiteArticles.ADVERTISEMENT_RULES]: 56,
    [SiteArticles.SELLER_PUBLIC_OFFER]: 29,
    [SiteArticles.USER_INFO]: 81,
    [SiteArticles.COOKIE_USAGE]: 49,
    [SiteArticles.CONFIDENTIALITY_AGREEMENT]: 28,
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
        entryId: 41,
      },
      copyright: {
        route: '/copyright',
        entryId: 39,
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
      confidentialityAgreement: {
        route: '/confidentiality-agreement',
        entryId: 28,
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
      personalDataProcessing: {
        route: '/personal-data-processing',
        entryId: 69,
        invisible: true,
      },
      subscriptionAgreement: {
        route: '/subscription-agreement',
        entryId: 70,
        invisible: true,
      },
    },
  },
} satisfies SiteConfig;
