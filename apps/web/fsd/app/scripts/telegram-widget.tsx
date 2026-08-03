import Script from 'next/script';

import { publicEnv } from '~shared/utils/env';

export const TelegramWidgetScript = () => {
  const telegramId = publicEnv('TELEGRAM_BOT_ID');

  if (!telegramId) return null;

  return (
    <Script
      strategy="afterInteractive"
      async
      src="https://telegram.org/js/telegram-widget.js?22"
      data-request-access="write"
    />
  );
};
