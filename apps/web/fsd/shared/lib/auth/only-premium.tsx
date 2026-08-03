import type { ReactNode } from 'react';

import { useSession } from '~shared/lib/session/use-session';

interface OnlyPremiumProps {
  children: ReactNode;
}

export const OnlyPremium = (props: OnlyPremiumProps) => {
  const isPremium = useSession((v) => v?.is_premium);
  if (!isPremium) return null;

  return props.children;
};
