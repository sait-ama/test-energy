import { getRequestConfig } from 'next-intl/server';

import { getSiteConfig } from '~shared/config/site-config';

export default getRequestConfig(async () => {
  const config = getSiteConfig()!;
  const locale = config.localization.locale;

  return {
    locale,
    formats: config.localization.formats,
    messages: await import(`../i18n/${locale}.json`).then((m) => m.default),
  };
});
