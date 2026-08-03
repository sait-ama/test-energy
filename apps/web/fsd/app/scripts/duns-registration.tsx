import React from 'react';
import Script from 'next/script';

import { publicEnv } from '~shared/utils/env';

export const DunsRegistered = () => {
  const duns = publicEnv('DUNS_REGISTERED');

  if (!duns) return null;

  return <Script strategy="afterInteractive" src="https://dunsregistered.dnb.com" />;
};
