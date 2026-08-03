import { memo, ReactNode } from 'react';

import { AgeSubmittedProvider } from '~shared/lib/age-submit/use-age-submitted';
import { AuthModalProvider } from '~shared/lib/auth/use-auth-modal';
import { getAgeSubmitted } from '~shared/lib/session/get-age-submitted';
import { getSession } from '~shared/lib/session/get-session';
import { SessionProvider } from '~shared/lib/session/use-session';

export const AuthProvider = memo(({ children }: { children: ReactNode }) => {
  const userPromise = getSession();
  const ageSubmittedPromise = getAgeSubmitted();

  return (
    <AuthModalProvider>
      <SessionProvider value={userPromise}>
        <AgeSubmittedProvider value={ageSubmittedPromise}>{children}</AgeSubmittedProvider>
      </SessionProvider>
    </AuthModalProvider>
  );
});
