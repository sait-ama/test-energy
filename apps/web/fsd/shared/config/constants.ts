import { Formats } from 'next-intl';

import type { SocialProviders } from '~shared/api/models/user';
import type { Features } from '~shared/config/feature-flags';
import { Routing } from '~shared/config/routing';
import type { Locale } from '~shared/i18n';

export interface Entry {
  route: string;
  entryId: number;
  invisible?: boolean;
  new?: boolean;
}

export type Redirect = {
  source: string;
  destination: string;
};

export enum SiteArticles {
  ADVERTISEMENT_RULES = 'ADVERTISEMENT_RULES',
  SELLER_PUBLIC_OFFER = 'SELLER_PUBLIC_OFFER',
  USER_INFO = 'USER_INFO',
  GOOGLE_DELETION_GUIDE = 'GOOGLE_DELETION_GUIDE',
  COOKIE_USAGE = 'COOKIE_USAGE',
  CONFIDENTIALITY_AGREEMENT = 'CONFIDENTIALITY_AGREEMENT',
  PERSONAL_DATA_PROCESSING = 'PERSONAL_DATA_PROCESSING',
  CARD_CREATION_RULES = 'CARD_CREATION_RULES',
}
export enum ConnectionCountry {
  RUSSIA = 'RU',
  BELARUS = 'BY',
  KAZAKHSTAN = 'KZ',
  ARMENIA = 'AM',
  AZERBAIJAN = 'AZ',
  KYRGYZSTAN = 'KG',
  MOLDAVA = 'MD',
  TAJIKISTAN = 'TJ',
  UZBEKISTAN = 'UZ',
  TURKMENISTAN = 'TM',
}
export const CISCountries = new Set([
  ConnectionCountry.RUSSIA,
  ConnectionCountry.BELARUS,
  ConnectionCountry.KAZAKHSTAN,
  ConnectionCountry.ARMENIA,
  ConnectionCountry.AZERBAIJAN,
  ConnectionCountry.KYRGYZSTAN,
  ConnectionCountry.MOLDAVA,
  ConnectionCountry.TAJIKISTAN,
  ConnectionCountry.UZBEKISTAN,
  ConnectionCountry.TURKMENISTAN,
]);

export enum ContentTypes {
  MANGA = 'manga',
  NOVEL = 'novel',
  SERIES = 'series',
}

export enum SiteNames {
  ReManga = 'ReManga',
  ReComics = 'ReComics',
  ReNovels = 'ReNovels',
  ReMangaGeorgia = 'ReManga Georgia',
  NeManga = 'NeManga',
  ReHentai = 'ReHentai',
  ReAnime = 'ReAnime',
  ReaperMangaOrg = 'ReaperManga',
  ReMangaKz = 'ReManga Kz',
}

export enum SiteUrls {
  ReMangaOrg = 'remanga.org',
  ReMangaMe = 'remanga.me',
  NeMangaOrg = 'nemanga.org',
  NeMangaIo = 'nemanga.io',
  ReMangaGe = 'remanga.ge',
  ReComicsOrg = 'recomics.org',
  ReMangaKz = 'remanga.kz',
  ReMangaOrgMirror = 'xn--80aaig9ahr.xn--c1avg',
  Localhost = 'localhost',
  ReHentai = 'rehentai.org',
  ReNovelsOrg = 'renovels.org',
  TestReMangaOrg = 'test.remanga.org',
  Test2ReMangaOrg = 'test2.remanga.org',
  TestReNovelsOrg = 'test.renovels.org',
  ReaderReMangaOrg = 'reader.remanga.org',
  ReAnimeOrg = 'reanime.org',
  DemoRemangaOrg = 'demo.remanga.org',
  StageReMangaOrg = 'stage.remanga.org',
  ReaperMangaOrg = 'reapermanga.org',
}

type ExtractParameters<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => any
    ? A extends [infer P]
      ? P
      : never
    : T[K] extends Record<string, any>
      ? ExtractParameters<T[K]>
      : never;
};
type DefaultQuery = Partial<{
  [key in keyof typeof Routing]: Partial<ExtractParameters<(typeof Routing)[key]>>;
}>;

export interface SiteConfig {
  site: {
    name: SiteNames;
    description?: string;
    credentials?: string;
    contacts?: {
      supportUrl?: string;
      email?: string;
      legalCredentials?: string;
      social?: {
        vk?: string;
        telegram?: string;
        discord?: string;
        tiktok?: string;
        youtube?: string;
      };
    };
    app?: {
      android?: string;
      ios?: string;
      rustore?: string;
    };
    redirects: Redirect[];
  };
  contentType: ContentTypes;
  relations?: Partial<Record<ContentTypes, SiteUrls>>;
  routing: {
    hostname: string;
    url: string;
  };
  auth: {
    methods: Record<Exclude<SocialProviders, SocialProviders.VK_CONNECT>, boolean>;
    limitations: Partial<Record<ConnectionCountry, Partial<Record<SocialProviders, boolean>>>>;
  };
  localization: {
    formats: Formats;
    direction: 'ltr' | 'rtl';
    locale: Locale;
    localeCode: string;
    currency: string;
    dateFormat: string;
    serverDateFormat: string;
    longDateFormat: string;
    timeFormat: string;
    datetimeFormat: string;
  };
  theme: {
    backgroundColor: string;
    themeColor: string;
  };
  seo: {
    index: boolean;
    follow: boolean;
    meta: {
      defaultImage: string;
    };
  };
  entries: {
    about: Record<string, Entry>;
    common: Record<string, Entry>;
    translators: Record<string, Entry>;
    users: Record<string, Entry>;
  };
  articles: Record<SiteArticles, number>;
  features: Record<Features, boolean>;
  defaultQuery?: DefaultQuery;
  friendlyDomains?: readonly string[];
}
