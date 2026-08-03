import { lazy, Suspense } from 'react';

const CreateMomentInReader = lazy(() =>
  import(/* webpackChunkName: "MomentCreator" */ './create-moment-in-reader').then((m) => ({
    default: m.CreateMomentInReader,
  }))
);

export const CreateMomentInReaderAsync = () => (
  <Suspense>
    <CreateMomentInReader />
  </Suspense>
);
