import { AuthRepository } from '~entities/user/model/repository';
import { SocialProviders } from '~shared/api/models/user';
import { publicEnv } from '~shared/utils/env';

export const enum SocialActionType {
  LINK = 'link',
  AUTH = 'auth',
}

export namespace SocialStrategy {
  export const oauth =
    (provider: SocialProviders, type: SocialActionType) =>
    async ({ payload, meta = {} }: { payload: any; meta?: any }) => {
      const { code } = payload;

      if (type === SocialActionType.AUTH) {
        const response = await AuthRepository.loginSocial({
          code,
          redirect_uri: publicEnv('SOCIAL_REDIRECT'),
          provider,
          ...meta,
        });

        //@ts-ignore
        const { access_token: token, auth_type, ...user } = response.content;

        return { token, auth_type, user };
      } else {
        await AuthRepository.linkSocial({
          code,
          redirect_uri: publicEnv('SOCIAL_REDIRECT'),
          provider,
        });

        return null;
      }
    };
  export const vk = async ({ payload, meta = {} }: { payload: any; meta?: any }) => {
    const { token: silent_token, uuid } = JSON.parse(payload.payload as string);

    const response = await AuthRepository.loginSocial({
      silent_token,
      uuid,
      redirect_uri: publicEnv('SOCIAL_REDIRECT'),
      provider: SocialProviders.VK,
      ...meta,
    });

    //@ts-ignore
    const { access_token: token, ...user } = response.content;

    return { token, user };
  };
}

export namespace SocialService {
  const outerRedirect = (provider: SocialProviders, type: SocialActionType) => {
    switch (provider) {
      case SocialProviders.GOOGLE:
        return ({ redirect }: { redirect: string }) =>
          `https://accounts.google.com/o/oauth2/auth?response_type=code&client_id=${publicEnv('GGL_APP_ID')}&redirect_uri=${publicEnv(
            'SOCIAL_REDIRECT'
          )}&scope=openid%20email%20profile&state=${btoa(`${SocialProviders.GOOGLE},${redirect},${type}`)}`;

      case SocialProviders.DISCORD:
        return ({ redirect }: { redirect: string }) =>
          `https://discord.com/oauth2/authorize?client_id=${publicEnv('DISCORD_APP_ID')}&response_type=code&redirect_uri=${publicEnv(
            'SOCIAL_REDIRECT'
          )}&scope=email+identify&state=${btoa(`${SocialProviders.DISCORD},${redirect},${type}`)}`;

      case SocialProviders.YANDEX:
        return ({ redirect }: { redirect: string }) =>
          `https://oauth.yandex.ru/authorize?response_type=code&client_id=${publicEnv('YANDEX_APP_ID')}&redirect_uri=${publicEnv('SOCIAL_REDIRECT')}&state=${btoa(
            `${SocialProviders.YANDEX},${redirect},${type}`
          )}`;

      case SocialProviders.VK_CONNECT:
        return ({ redirect }: { redirect: string }) =>
          `https://oauth.vk.com/authorize?client_id=${publicEnv('VK_APP_ID')}&display=popup&redirect_uri=${publicEnv('SOCIAL_REDIRECT')}&scope=email,offline&response_type=token&v=5.199&state=${btoa(
            `vk_privazka,${redirect},${type}`
          )}`;
    }

    return null;
  };

  const outerTelegram =
    (type: SocialActionType) =>
    ({
      redirect,
      onSuccess,
    }: {
      redirect: string;
      onSuccess: (options: { state: string; code: string }) => void;
    }) =>
      //@ts-ignore
      void window.Telegram?.Login.auth(
        {
          bot_id: publicEnv('TELEGRAM_BOT_ID'),
          request_access: true,
        },
        async (user: any) => {
          if (!user) return;

          const query = {
            state: btoa(`${SocialProviders.TELEGRAM},${redirect},${type}`),
            code: JSON.stringify(user),
          };

          onSuccess(query);
        }
      );

  export const LoginInner = {
    [SocialProviders.GOOGLE]: SocialStrategy.oauth(SocialProviders.GOOGLE, SocialActionType.AUTH),
    [SocialProviders.DISCORD]: SocialStrategy.oauth(SocialProviders.DISCORD, SocialActionType.AUTH),
    [SocialProviders.TELEGRAM]: SocialStrategy.oauth(
      SocialProviders.TELEGRAM,
      SocialActionType.AUTH
    ),
    [SocialProviders.YANDEX]: SocialStrategy.oauth(SocialProviders.YANDEX, SocialActionType.AUTH),

    [SocialProviders.VK]: SocialStrategy.vk,
  };

  export const LoginOuter = {
    [SocialProviders.GOOGLE]: outerRedirect(SocialProviders.GOOGLE, SocialActionType.AUTH),
    [SocialProviders.DISCORD]: outerRedirect(SocialProviders.DISCORD, SocialActionType.AUTH),
    [SocialProviders.YANDEX]: outerRedirect(SocialProviders.YANDEX, SocialActionType.AUTH),

    [SocialProviders.TELEGRAM]: outerTelegram(SocialActionType.AUTH),
  };

  export const LinkOuter = {
    [SocialProviders.GOOGLE]: outerRedirect(SocialProviders.GOOGLE, SocialActionType.LINK),
    [SocialProviders.DISCORD]: outerRedirect(SocialProviders.DISCORD, SocialActionType.LINK),
    [SocialProviders.YANDEX]: outerRedirect(SocialProviders.YANDEX, SocialActionType.LINK),
    [SocialProviders.VK_CONNECT]: outerRedirect(SocialProviders.VK_CONNECT, SocialActionType.LINK),

    [SocialProviders.TELEGRAM]: outerTelegram(SocialActionType.LINK),
  };

  export const LinkInner = {
    [SocialProviders.GOOGLE]: SocialStrategy.oauth(SocialProviders.GOOGLE, SocialActionType.LINK),
    [SocialProviders.TELEGRAM]: SocialStrategy.oauth(
      SocialProviders.TELEGRAM,
      SocialActionType.LINK
    ),
    [SocialProviders.YANDEX]: SocialStrategy.oauth(SocialProviders.YANDEX, SocialActionType.LINK),
    [SocialProviders.VK_CONNECT]: SocialStrategy.oauth(
      SocialProviders.VK_CONNECT,
      SocialActionType.LINK
    ),
    [SocialProviders.DISCORD]: SocialStrategy.oauth(SocialProviders.DISCORD, SocialActionType.LINK),
  };
}
