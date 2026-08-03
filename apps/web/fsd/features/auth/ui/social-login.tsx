import type { ReactNode } from 'react';
import Link from 'next/link';

import DiscordIcon from '@re/ui-kit/icons/discord';
import GoogleIcon from '@re/ui-kit/icons/google';
import TelegramIcon from '@re/ui-kit/icons/telegram';
import YandexIcon from '@re/ui-kit/icons/yandex';
import { Button } from '@re/ui-kit/ui/button';
import { ReText } from '@re/ui-kit/ui/text';

import { useRequestState } from '~app/providers/request-state-provider';
import { useSiteConfig } from '~app/providers/site-config-provider';
import { SocialService } from '~features/auth/model/service';
import { InfoModalTrigger } from '~features/info-modal';
import { InfoModalType } from '~shared/api/models/info-modal';
import { SocialProviders } from '~shared/api/models/user';
import { ConnectionCountry } from '~shared/config/constants';
import { Routing } from '~shared/config/routing';
import { linkBaseVariants } from '~shared/ui/link-base';
import { publicEnv } from '~shared/utils/env';

import { VkAuthButton } from './vk-auth-button';

const Telegram = ({ redirect }: { redirect: string }) => {
  const handleClick = () => {
    SocialService.LoginOuter[SocialProviders.TELEGRAM]({
      redirect,
      onSuccess: (query) => (window.location.href = Routing.Social.main({ query })),
    });
  };

  return (
    <Button color="secondary" onClick={handleClick} className="flex-[1]">
      <TelegramIcon />
    </Button>
  );
};

const Discord = ({ redirect }: { redirect: string }) => (
  <Button color="secondary" asChild>
    <Link
      shallow={false}
      prefetch={false}
      href={SocialService.LoginOuter[SocialProviders.DISCORD]!({ redirect })}
      target="_blank"
      className="flex-[1]"
    >
      <DiscordIcon />
    </Link>
  </Button>
);

const Yandex = ({ redirect }: { redirect: string }) => (
  <Button color="secondary" asChild>
    <Link
      shallow={false}
      prefetch={false}
      href={SocialService.LoginOuter[SocialProviders.YANDEX]!({ redirect })}
      target="_blank"
      className="flex-[1]"
    >
      <YandexIcon />
    </Link>
  </Button>
);

const Google = ({ redirect }: { redirect: string }) => (
  <Button color="secondary" asChild>
    <Link
      shallow={false}
      prefetch={false}
      href={SocialService.LoginOuter[SocialProviders.GOOGLE]!({ redirect })}
      target="_blank"
      className="flex-[1]"
    >
      <GoogleIcon />
    </Link>
  </Button>
);

interface App {
  provider: SocialProviders;
  render: (redirect: string) => ReactNode;
}

const APPS: App[] = [
  {
    provider: SocialProviders.TELEGRAM,
    render: (redirect) => <Telegram key="telegram" redirect={redirect} />,
  },
  {
    provider: SocialProviders.YANDEX,
    render: (redirect) => <Yandex key="yandex" redirect={redirect} />,
  },
  {
    provider: SocialProviders.GOOGLE,
    render: (redirect) => <Google key="google" redirect={redirect} />,
  },
  {
    provider: SocialProviders.DISCORD,
    render: (redirect) => <Discord key="discord" redirect={redirect} />,
  },
  // {
  //     provider: SocialProviders.VK,
  //     render: () => <VkAuthButton />,
  // },
];

export interface SocialLogin {
  exclude?: SocialProviders[];
}

export const SocialLogin = (props: SocialLogin) => {
  const { exclude = [] } = props;
  const redirect = window.location.pathname;
  const { headers } = useRequestState();
  const enabledApps = useSiteConfig((v) => v?.auth?.methods);
  const articles = useSiteConfig((v) => v?.articles);
  const limitations = useSiteConfig((v) => v?.auth?.limitations ?? {});

  const header = publicEnv('CONNECTING_IP_HEADER');
  const country = headers[header] as ConnectionCountry | undefined;

  let supportedApps = APPS.filter((app) => !exclude.includes(app.provider));

  if (Object.keys(enabledApps).length) {
    supportedApps = supportedApps.filter((app) => enabledApps?.[app.provider]);
  }

  if (country) {
    const limitation = limitations[country];
    supportedApps = supportedApps.filter((app) => !limitation?.[app.provider]);
  }

  return (
    <>
      <div className="flex justify-center gap-2">
        {supportedApps.map((app) => app.render(redirect))}
      </div>
      {enabledApps[SocialProviders.VK] && !exclude.includes(SocialProviders.VK) ? (
        <VkAuthButton />
      ) : null}
      {country === ConnectionCountry.RUSSIA && articles?.GOOGLE_DELETION_GUIDE ? (
        <ReText align="center" size="xs" color="muted-foreground" weight="medium">
          ⚠️ С 25.04.2024 регистрация и авторизация с помощью{' '}
          <span className="font-bold underline">Google и Apple ID</span> недоступны. Если вы
          использовали один из этих способов для входа, восстановите доступ к аккаунту{' '}
          <InfoModalTrigger
            asChild
            options={{ type: InfoModalType.ENTRY, entryId: articles.GOOGLE_DELETION_GUIDE }}
          >
            <span className={linkBaseVariants({})}>по инструкции.</span>
          </InfoModalTrigger>
        </ReText>
      ) : null}
    </>
  );
};
