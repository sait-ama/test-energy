// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/
import {
  captureRouterTransitionStart,
  contextLinesIntegration,
  init as initSentry,
} from '@sentry/nextjs';
// import posthog from 'posthog-js';

const supportedBrowsers =
  /Edge?\/(79|[89]\d|\d{3,})\.\d+(\.\d+|)|Firefox\/(6[7-9]|[7-9]\d|\d{3,})\.\d+(\.\d+|)|Chrom(ium|e)\/(6[4-9]|[7-9]\d|\d{3,})\.\d+(\.\d+|)([\d.]+$|.*Safari\/(?![\d.]+ Edge\/[\d.]+$))|(Maci|X1{2}).+ Version\/(1[2-9]|[2-9]\d|\d{3,})\.\d+([,.]\d+|)( \(\w+\)|)( Mobile\/\w+|) Safari\/|Chrome.+OPR\/(5[1-9]|[6-9]\d|\d{3,})\.\d+\.\d+/;

initSentry({
  enabled: process.env.SENTRY_ENABLED === '1',
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1,
  profilesSampleRate: 0,
  release: process.env.RELEASE_ID,
  integrations: (defaultIntegrations) => [...defaultIntegrations, contextLinesIntegration()],
  // debug: process.env.NODE_ENV === 'development',
  sendDefaultPii: true,
  // tunnel: '/bff-api/monitoring',
  // profilesSampleRate: 1,
  // replaysOnErrorSampleRate: 1,
  denyUrls: [
    // analytics
    /mc\.yandex\.ru/i,
    /analytics\.google\.com/i,
    /google-analytics\.com/i,

    // Random plugins and extensions.
    /^resource:\/\//i,
    /127\.0\.0\.1:4001\/isrunning/i,
    /bestpriceninja/i,
    /googleapis/i,
    /googlebot/i,
    /googlest/i,
    /itunes\.apple\.com\//i,
    /metrics\.itunes\.apple\.com\.edgesuite\.net\//i,
    /re-markit/i,
    /webappstoolbarba\.texthelp\.com\//i,

    // Analytics.
    /doubleclick\.net/i,
    /hotjar\./i,
    /netstats\.space/i,
    /pagead\/js/i,

    // Chrome extensions.
    /^chrome:\/\//i,
    /chrome-extension:/i,
    /extensions\//i,

    // Facebook.
    /connect\.facebook\.net\/en_US\/all\.js/i,
    /graph\.facebook\.com/i,

    // Kaspersky antivirus.
    /kaspersky/i,

    // Locally saved copies
    /file:\/\//i,

    // Proxy servers.
    /nph-proxy\./i,
    /\.cloudfront\..+\/statistic\//i,

    // Safari extensions.
    /safari-web-extension:/i,
    /safari-extension:/i,

    // Woopra.
    /eatdifferent\.com\.woopra-ns\.com/i,
    /static\.woopra\.com\/js\/woopra\.js/i,
  ],
  ignoreErrors: [
    // Generic error code from errors outside the security sandbox.
    'Script error.',
    'controller[kState].transformAlgorithm is not a function', // idk what is it but is doesn't affect anyhow
    'TypeError: can\'t redefine non-configurable property "ethereum"',
    "ReferenceError: Can't find variable: gmo",
    // Analytics code.
    'vars.hotjar.com',
    'doubleclick.net',

    // Avast.
    '_avast_',

    // Facebook.
    'fb_xd_fragment',

    // Broadcom ASG error.
    'ICAP Error',

    // Bytemobile proxy.
    'bmi_SafeAddOnload',
    'EBCallBackMessageReceived',

    // Conduit Toolbar.
    'conduitPage',

    // Chrome for iOS bug.
    // https://groups.google.com/a/chromium.org/forum/#!topic/chromium-discuss/7VU0_VvC7mE
    '__gCrWeb',

    // Chromium bug.
    // https://bugs.chromium.org/p/chromium/issues/detail?id=97172
    'ntp is not defined',

    // Edge on iOS.
    'instantSearchSDKJSBridgeClearHighlight',

    // Firefox bug.
    // https://bugzilla.mozilla.org/show_bug.cgi?id=783260
    // http://stackoverflow.com/a/13101119
    'Permission denied to access property "toString"',

    // Firefox internals.
    '_firefox_',

    // Firefox freeing add-on memory.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Dead_object
    "can't access dead object",

    // Nuance Dragon Web Extension.
    'plugin.setSuspendState',

    // Safari bug.
    // https://bugs.webkit.org/show_bug.cgi?id=119472
    'promiseReactionJob',

    // SafeBrowse extension.
    'jQSB',

    // Commonly ignored errors of unknown origin.
    'androidInterface',
    'eshopcomp',
    'eval at C',
    'eval at E_c',
    'frameConnector_isForegroundChanged',
    'harkedtremblings',
    'kw__injected',
    'NPObject',
    'siteroot',
    'SymBrowser_',
    'touchDownX',
    'uiWebview_',
    'variable: inf',
    'Window.dologin',

    // react
    /This Suspense boundary received an update before it finished hydrating. This caused the boundary to switch to client rendering. The usual way to fix this is to wrap the original update in startTransition/gim,
    /Failed to execute 'evaluate' on 'Document': The string '' is not a valid XPath expression/gim,
    /undefined is not an object \(evaluating 'r\["@context"]\.toLowerCase'\)/gim,
    /history.replaceState\(\)/gim,
    /history.pushState\(\)/gim,
    /Minified React error/gim,
    /Support for defaultProps will be removed from function components/gim,
    /This Suspense boundary received an update before it finished hydrating/gim,
    /Hydration failed because the initial UI does not match what was rendered on the server/gim,
    /There was an error while hydrating this Suspense boundary. Switched to client rendering/gim,
    /The server could not finish this Suspense boundary, likely due to an error during server rendering/gim,
    /useLayoutEffect does nothing on the server/gim,
    'https://nextjs.org/docs/messages/react-hydration-error',
    'https://reactjs.org/docs/error-decoder.html?invariant=423', // There was an error while hydrating.
    'https://reactjs.org/docs/error-decoder.html?invariant=425', // Text content does not match server-rendered HTML...
    /Loading chunk/gim,
    /Java object is gone/gim,
    /Java bridge method invocation error/gim,

    /Method not found/gim, // sentry

    /Database deleted by request of the user/gim, // yandex metrika ?

    'NEXT_HTTP_ERROR_FALLBACK;403', // next authInterrupts
    'NEXT_HTTP_ERROR_FALLBACK;401',

    // apple...
    // /TypeError: Failed to fetch/gim,
    // /TypeError: NetworkError when attempting to fetch resource/gim,
    // /TypeError: cancelled/gim,
  ],

  beforeSend(event) {
    if (supportedBrowsers.test(window.navigator.userAgent)) {
      event.level = 'warning';
    }

    for (const exception of event.exception?.values ?? []) {
      if (exception.type === 'API Error') {
        event.level = 'warning';
        break;
      }
    }

    event.breadcrumbs = (event.breadcrumbs ?? []).filter((it) => {
      if (it.category === 'fetch') {
        return (
          !it.data?.url.includes('yandex.ru') &&
          !it.data?.url.includes('mail.ru') &&
          !it.data?.url.includes('analytics.google.com') &&
          !it.data?.url.includes('reservices.io')
        );
      }

      return true;
    });

    return event;
  },
});

export const onRouterTransitionStart = captureRouterTransitionStart;

// posthog.init('phc_YFmbDmno5DV4k8VmmqxRI1Pl2NGBUVRF0sZH2joNbyI', {
//   api_host: 'https://eu.i.posthog.com',
//   defaults: '2025-05-24',
// });
