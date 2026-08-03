import { SocialProviders } from '~shared/api/models/user';
import {
  friendlyDomains,
  reApp,
  reSocial,
  russianLocalization,
} from '~shared/config/_configs/common';
import {
  ConnectionCountry,
  ContentTypes,
  SiteArticles,
  SiteConfig,
  SiteNames,
  SiteUrls,
} from '~shared/config/constants';
import { Features } from '~shared/config/feature-flags';

export const remangaConfig = {
  contentType: ContentTypes.MANGA,
  routing: {
    hostname: SiteUrls.ReMangaOrg,
    url: `https://${SiteUrls.ReMangaOrg}`,
  },
  site: {
    contacts: {
      email: 'contact@remanga.org',
      supportUrl: 'https://vk.com/im?media=&sel=-185404064',
      social: reSocial,
      legalCredentials:
        'ООО РЕКОМИКС, юр. адрес: г. Москва, пер Столовый, д. 6, офис 214А, офис 223',
    },
    app: reApp,
    name: SiteNames.ReManga,
    description: '',
    redirects: [
      {
        source: `/${ContentTypes.MANGA}/dungeon-history`,
        destination: `https://recomics.org/manga/dungeon-history?redirected=1&redirected_from=${SiteNames.ReManga}`,
      },
      {
        source: `/${ContentTypes.MANGA}/seoul-station-necromance`,
        destination: `https://recomics.org/manga/seoul-station-necromance?redirected=1&redirected_from=${SiteNames.ReManga}`,
      },
    ],
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
    [Features.CARD_GEN]: false,
  },
  articles: {
    [SiteArticles.ADVERTISEMENT_RULES]: 56,
    [SiteArticles.SELLER_PUBLIC_OFFER]: 29,
    [SiteArticles.USER_INFO]: 81,
    [SiteArticles.COOKIE_USAGE]: 49,
    [SiteArticles.CONFIDENTIALITY_AGREEMENT]: 28,
    [SiteArticles.PERSONAL_DATA_PROCESSING]: 98,
    [SiteArticles.GOOGLE_DELETION_GUIDE]: 96,
    [SiteArticles.CARD_CREATION_RULES]: 71,
  },
  friendlyDomains,
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
      faq: {
        route: '/faq',
        entryId: 2,
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
      cookiePolicy: {
        route: '/cookie-policy',
        entryId: 49,
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
        entryId: 98,
      },
      subscriptionAgreement: {
        route: '/subscription-agreement',
        entryId: 70,
        invisible: true,
      },
    },
  },
} satisfies SiteConfig;
