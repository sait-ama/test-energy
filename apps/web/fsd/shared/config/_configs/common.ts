import { Formats } from 'next-intl';

import { Locale } from '~shared/i18n';

import { SiteUrls } from '../constants';

export const reSocial = {
  vk: 'https://vk.com/remanga',
  telegram: 'https://t.me/Remanga',
  discord: 'https://discord.gg/remanga-org',
  tiktok: 'https://www.tiktok.com/@remanga',
  youtube: 'https://www.youtube.com/@remangaorg',
};

export const reApp = {
  android: 'https://play.google.com/store/apps/details?id=com.remanga.remangaapp&hl=en&gl=ru',
  ios: 'https://testflight.apple.com/join/vIv3Bc8h',
  rustore: 'https://www.rustore.ru/catalog/app/com.remanga.remangaapp',
};

export const russianFormats: Formats = {
  dateTime: {
    long: {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      minute: 'numeric',
      hour: 'numeric',
      hour12: false,
    },
    short: {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    },
  },
  number: {
    precise: {
      maximumFractionDigits: 5,
    },
  },
  list: {
    enumeration: {
      style: 'long',
      type: 'conjunction',
    },
  },
};

export const friendlyDomains = [
  ...Object.values(SiteUrls),
  SiteUrls.ReAnimeOrg,
  SiteUrls.ReMangaOrgMirror,
  'реманга.орг',
  SiteUrls.ReMangaMe,
  SiteUrls.ReNovelsOrg,
  SiteUrls.ReAnimeOrg,
  'shikimori.org',
  SiteUrls.ReMangaKz,
  SiteUrls.ReMangaGe,
  SiteUrls.ReComicsOrg,
] as const;

export const russianLocalization = {
  locale: Locale.RU,
  formats: russianFormats,
  direction: 'ltr',
  localeCode: 'ru-RU',
  currency: '₽',
  dateFormat: 'DD.MM.YYYY',
  serverDateFormat: 'YYYY-MM-DD',
  longDateFormat: 'DD MMM YYYY',
  timeFormat: 'HH:mm',
  datetimeFormat: 'DD.MM.YYYY HH:mm',
} as const;

export const englishLocalization = {
  locale: Locale.EN,
  formats: russianFormats,
  direction: 'ltr',
  localeCode: 'en-US',
  currency: '$',
  dateFormat: 'MM-DD-YYYY',
  serverDateFormat: 'YYYY-MM-DD',
  longDateFormat: 'MMM DD YYYY',
  timeFormat: 'HH:mm',
  datetimeFormat: 'MM.DD.YYYY HH:mm',
} as const;
