'use client';
import React from 'react';
import { useReportWebVitals } from 'next/web-vitals';

import { GoogleTagManager } from '@next/third-parties/google';

import { logger } from '~shared/lib/logger';
import { publicEnv } from '~shared/utils/env';

const GoogleTagManagerWrapper = ({ gtmId }: { gtmId: string }) => {
  useReportWebVitals((metric) => {
    logger.log(`${metric.name} = ${metric.value}`);
    window.gtag('event', metric.name, {
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_label: metric.id,
      non_interaction: true,
    });
  });

  return <GoogleTagManager gtmId={gtmId} />;
};

export const GoogleTagScript = () => {
  const tagManagerId = publicEnv('GOOGLE_TAG_MANAGER_ID');

  if (!tagManagerId) return null;

  return <GoogleTagManagerWrapper gtmId={tagManagerId} />;
};
