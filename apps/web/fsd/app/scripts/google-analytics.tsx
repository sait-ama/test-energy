import React from 'react';

import { GoogleAnalytics } from '@next/third-parties/google';

import { publicEnv } from '~shared/utils/env';

export const GoogleAnalyticsScript = () => {
  const googleAnalyticsId = publicEnv('GOOGLE_ANALYTICS_ID');

  if (!googleAnalyticsId) return null;

  return <GoogleAnalytics gaId={googleAnalyticsId} />;
};
