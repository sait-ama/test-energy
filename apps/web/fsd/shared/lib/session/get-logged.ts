import { getSession } from '~shared/lib/session/get-session';

export const getLogged = async () => {
  const data = await getSession();

  return !!data;
};
