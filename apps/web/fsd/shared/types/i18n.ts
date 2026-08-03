import { russianFormats } from '~shared/config/_configs/common';
import { Locale } from '~shared/i18n';

import type ru from '../../../i18n/ru.json';

declare module 'next-intl' {
  interface AppConfig {
    Messages: typeof ru;
    Formats: typeof russianFormats;
    Locale: Locale;
  }
}
