import { SocialProviders } from '~shared/api/models/user';
import { reSocial, russianLocalization } from '~shared/config/_configs/common';
import type { SiteConfig } from '~shared/config/constants';
import { ContentTypes, SiteNames, SiteUrls } from '~shared/config/constants';
import { Features } from '~shared/config/feature-flags';

export const reanimeConfig = {
  contentType: ContentTypes.SERIES,
  routing: {
    hostname: SiteUrls.ReAnimeOrg,
    url: `https://${SiteUrls.ReAnimeOrg}`,
  },
  site: {
    contacts: {
      email: 'contact@reanime.org',
      supportUrl: 'https://vk.com/im?media=&sel=-185404064',
      social: reSocial,
    },
    name: SiteNames.ReAnime,
  },
  auth: {
    methods: {
      [SocialProviders.VK]: true,
      [SocialProviders.DISCORD]: false,
      [SocialProviders.GOOGLE]: true,
      [SocialProviders.YANDEX]: true,
      [SocialProviders.TELEGRAM]: true,
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
    [Features.EMOJIS]: false,
    [Features.STICKERS]: true,
    [Features.BATTLEPASS]: true,
    [Features.FORUM]: true,
    [Features.OLD_VERSION_SWITCH]: false,
    [Features.EXTERNAL_TITLE_ADAPTATION]: false,
  },
  entries: {
    about: {},
    common: {},
    translators: {},
    users: {},
  },
} satisfies SiteConfig;
