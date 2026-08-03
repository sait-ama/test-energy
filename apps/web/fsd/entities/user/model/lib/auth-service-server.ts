import { setCookies } from '~entities/user/model/actions';
import { AuthCookies } from '~entities/user/model/const';
import { AuthCredentialsRepository } from '~entities/user/model/repository';
import { createCookieUser } from '~entities/user/model/utils';
import type { DetailedCurrentUserSchema } from '~shared/api/models/user';
import type { Ctx } from '~shared/utils/cookie-service';
import { CookieService } from '~shared/utils/cookie-service';

export namespace AuthCookieServiceServer {
  export const setServer = async (
    options: { token: string; user: DetailedCurrentUserSchema },
    ctx?: Ctx
  ) => {
    const { token, user } = options;

    if (ctx) {
      // server

      CookieService.set(AuthCookies.SERVER_USER, JSON.stringify(createCookieUser(user)), ctx);
      CookieService.set(AuthCookies.SERVER_TOKEN, token, ctx);
    } else {
      // client

      await setCookies({ user: JSON.stringify(createCookieUser(user)), token });
      // todo: refactor to server action after full switch to app router
      // await AuthCredentialsRepository.setCookies([
      //     { key: AuthCookies.SERVER_USER, value:  },
      //     { key: AuthCookies.SERVER_TOKEN, value: token },
      // ]);
    }
  };

  export const deleteServer = async (ctx?: Ctx) => {
    if (ctx) {
      // server

      CookieService.delete(AuthCookies.SERVER_USER, ctx);
      CookieService.delete(AuthCookies.SERVER_TOKEN, ctx);
    } else {
      // client

      await AuthCredentialsRepository.deleteCookies([
        AuthCookies.SERVER_USER,
        AuthCookies.SERVER_TOKEN,
      ]);
    }
  };
}
