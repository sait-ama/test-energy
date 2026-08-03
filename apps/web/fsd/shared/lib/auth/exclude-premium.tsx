import type { ReactNode } from 'react';

import { useSession } from '~shared/lib/session/use-session';

interface ExcludePremiumProps {
  children: ReactNode;
}

export const ExcludePremium = (props: ExcludePremiumProps) => {
  const isPremium = useSession((v) => v?.is_premium);

  if (isPremium) return null;

  return props.children;
};
