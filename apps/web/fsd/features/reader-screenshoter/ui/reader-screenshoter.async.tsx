import { lazy, Suspense } from 'react';

const ReaderScreenshoter = lazy(() =>
  import(/* webpackChunkName: "ReaderScreenshoter" */ './reader-screenshoter').then((m) => ({
    default: m.ReaderScreenshoter,
  }))
);

export const ReaderScreenshoterAsync = () => (
  <Suspense>
    <ReaderScreenshoter />
  </Suspense>
);
