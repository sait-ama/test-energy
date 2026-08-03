import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export const useSaveAuthProvider = (
  provider: (action: 'login' | 'register', meta: { provider?: string }) => void
) => {
  const searchParams = useSearchParams();
  let cancel = false;

  // TODO: register by login and password + login
  useEffect(() => {
    if (!searchParams.has('__loggedBy') && !searchParams.has('__registeredBy')) return;
    if (cancel) return;

    const registeredBy = searchParams.get('__registeredBy');
    const loggedBy = searchParams.get('__loggedBy');

    if (loggedBy) {
      provider('login', { provider: loggedBy });
    }

    if (registeredBy) {
      provider('register', { provider: registeredBy });
    }

    return () => {
      cancel = true;
    };
  }, []);
};
