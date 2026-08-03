import { lazy, Suspense } from 'react';

import { DialogLoading } from '@re/ui-kit/ui/dialog-loading';

import { useSession } from '~shared/lib/session/use-session';

const NeedEmail = lazy(() =>
  import(/* webpackChunkName: "NeedEmail" */ './need-email').then((m) => ({
    default: m.NeedEmail,
  }))
);

export const NeedEmailLazy = () => {
  const session = useSession();

  if (!session || !session.need_email) return null;

  return (
    <Suspense fallback={<DialogLoading />}>
      <NeedEmail />
    </Suspense>
  );
};
