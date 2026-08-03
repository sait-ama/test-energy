import React from 'react';
import Script from 'next/script';

export const PolyfillsScripts = () => (
  <Script
    strategy="afterInteractive"
    src="https://polyfill-fastly.io/v3/polyfill.min.js?features=IntersectionObserver%2CIntersectionObserverEntry%2CResizeObserver%2CRegExp.prototype.%40%40matchAll%2CRegExp.prototype.flags"
  />
);
