import dynamic from 'next/dynamic';

import { useLogged } from '~shared/lib/session/use-logged';

const RegisterGiftButton = dynamic(
  () => import('./register-gift-button').then((mod) => mod.RegisterGiftButton),
  {
    ssr: false,
  }
);

export const RegisterGiftButtonAsync = () => {
  const isLogged = useLogged();

  if (isLogged) return null;

  return <RegisterGiftButton />;
};
