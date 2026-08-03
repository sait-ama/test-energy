import { unauthorized } from 'next/navigation';

import { getLogged } from '~shared/lib/session/get-logged';

export default async ({ children }: PropsW) => {
  const isLogged = await getLogged();
  if (!isLogged) unauthorized();
  return <>{children}</>;
};
