import { sendGAEvent } from '@next/third-parties/google';

import { v2UsersCurrentRetrieveQueryKey } from '@re/api/generated/@tanstack/react-query.gen';

import { AuthCookies } from '~entities/user/model/const';
import { AuthCookieServiceServer } from '~entities/user/model/lib/auth-service-server';
import { createCookieUser } from '~entities/user/model/utils';
import type { DetailedCurrentUserSchema } from '~shared/api/models/user';
import { queryClient } from '~shared/api/react-query';
import type { Ctx } from '~shared/utils/cookie-service';
import { CookieService } from '~shared/utils/cookie-service';

// todo: Зарефакторить на  AuthCookiesService(или репозиторий?) и AuthServiceClient + AuthServiceServer,
// чтобы избежать путаницы server cookies / client cookies
/**
 * - All the methods are available both on client & server.
 * - Pass {req, res} or {cookie} to "ctx" param to use on server
 */
export namespace AuthCookiesService {
  export const setClientUser = (user: DetailedCurrentUserSchema, ctx?: Ctx) => {
    CookieService.set(AuthCookies.USER, JSON.stringify(createCookieUser(user)), ctx);
  };

  export const setToken = (token: string, ctx?: Ctx) => {
    CookieService.set(AuthCookies.TOKEN, token, ctx);
  };

  export const setClient = (
    options: { token: string; user: DetailedCurrentUserSchema },
    ctx?: Ctx
  ) => {
    const { token, user } = options;

    setClientUser(user, ctx);
    setToken(token, ctx);
  };

  export const deleteClient = (ctx?: Ctx) => {
    CookieService.delete(AuthCookies.USER, ctx);
    CookieService.delete(AuthCookies.TOKEN, ctx);
  };

  export const isLogged = (ctx?: Ctx) => !!CookieService.get(AuthCookies.TOKEN, ctx);
}

/**
 * - Only client usage, use "AuthCookiesService" to handle auth on server
 */
export namespace AuthService {
  export const login = async (options: { token: string; user: DetailedCurrentUserSchema }) => {
    AuthCookiesService.setClient(options);
    sendGAEvent('login', { provider: 'manual' });

    // eslint-disable-next-line handle-errors/log-error-in-promises
    await AuthCookieServiceServer.setServer(options).catch(console.error);

    queryClient.invalidateQueries({
      predicate: ({ queryKey }) =>
        queryKey?.[0]?._id === v2UsersCurrentRetrieveQueryKey({})[0]?._id,
    });
    // await revalidateAuth();
  };

  export const logout = async (
    { refreshAfter }: { refreshAfter?: boolean } = { refreshAfter: true }
  ) => {
    queryClient.setQueryData(
      {
        predicate: ({ queryKey }) =>
          queryKey?.[0]?._id === v2UsersCurrentRetrieveQueryKey({})[0]?._id,
      },
      null
    );
    AuthCookiesService.deleteClient();
    // TODO: transfer to external component for server usage
    sendGAEvent('logout');
    // eslint-disable-next-line handle-errors/log-error-in-promises
    await AuthCookieServiceServer.deleteServer().catch(console.error);

    if (refreshAfter) {
      window.location.reload();
    }
    // removeAuthDependentQueries();
  };

  export const isLogged = () => AuthCookiesService.isLogged();
}
