'use client';

import Link from 'next/link';

import { Button } from '@re/ui-kit/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@re/ui-kit/ui/card';

import { useUpdateCurrentUser } from '~entities/user/model/mutations';
import { useUserSuspenseQuery } from '~entities/user/model/queries';
import { SocialService } from '~features/auth/model/service';
import type { Social } from '~features/connect-social/model/consts';
import { providers } from '~features/connect-social/model/consts';
import { SocialProviders } from '~shared/api/models/user';
import { Routing } from '~shared/config/routing';
import { useSession } from '~shared/lib/session/use-session';
import { linkBaseVariants } from '~shared/ui/link-base';

const getHref = (options: { id: NumberIsomorphic; provider: SocialProviders }) => {
  const { id, provider } = options;

  switch (provider) {
    case SocialProviders.VK_CONNECT:
      return `https://vk.com/id${id}/`;
    // case SocialProviders.GOOGLE:
    // case SocialProviders.YANDEX:
    // case SocialProviders.TELEGRAM:
    // case SocialProviders.DISCORD:
    default:
      return null;
  }
};

const SocialId = ({ id, provider }) => {
  const href = getHref({ id, provider });

  return (
    <>
      id:
      {href ? (
        <Link
          shallow={false}
          prefetch={false}
          href={href}
          target="_blank"
          className={linkBaseVariants()}
        >
          {id}
        </Link>
      ) : (
        id
      )}
    </>
  );
};

export type SocialButtonProps = {
  isConnected: boolean;
} & Pick<Social, 'provider' | 'field'>;

export const SocialButton = (props: SocialButtonProps) => {
  const { isConnected, field, provider } = props;

  const { mutateAsync } = useUpdateCurrentUser();

  const redirect = Routing.User.settings({ params: { tab: 'social' } });

  const handleDisconnect = () => mutateAsync({ [field]: 0 });
  const handleTelegram = () => {
    SocialService.LinkOuter[SocialProviders.TELEGRAM]({
      redirect,
      onSuccess: (query) => {
        window.location.href = Routing.Social.main({ query });
      },
    });
  };

  const connectButton =
    provider === SocialProviders.TELEGRAM ? (
      <Button onClick={handleTelegram}>Привязать</Button>
    ) : (
      <Button asChild>
        <Link
          shallow={false}
          prefetch={false}
          /* target="_blank"  */ href={SocialService.LinkOuter[provider]({ redirect })}
        >
          Привязать
        </Link>
      </Button>
    );

  const disconnectButton = (
    <Button variant="destructive" onClick={handleDisconnect}>
      Отвязать
    </Button>
  );

  return isConnected ? disconnectButton : connectButton;
};

type SocialCardProps = {
  id?: NumberIsomorphic | null | undefined;
} & Pick<Social, 'name' | 'icon' | 'provider' | 'field'>;

const SocialCard = (props: SocialCardProps) => {
  const { icon: Icon, name, id, provider, field } = props;

  const isConnected = !!id;

  return (
    <Card variant="ghost">
      <CardHeader className="flex-row items-center justify-between">
        <div className="flex flex-row items-center gap-4">
          <Icon size={48} className="bg-muted rounded-sm p-2" />

          <div className="flex flex-col justify-center">
            <CardTitle>{name}</CardTitle>
            <CardDescription>
              {isConnected ? <SocialId id={id} provider={provider} /> : null}
            </CardDescription>
          </div>
        </div>
        <SocialButton isConnected={isConnected} provider={provider} field={field} />
      </CardHeader>
    </Card>
  );
};

export const ConnectSocial = () => {
  const session = useSession()!;
  const { data: user } = useUserSuspenseQuery({
    variables: { params: { userId: String(session.id) } },
  });

  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
      {providers.map((item) => {
        const { name, icon, field, provider } = item;

        return (
          <SocialCard
            name={name}
            icon={icon}
            id={user?.[field]}
            provider={provider}
            key={provider}
            field={field}
          />
        );
      })}
    </div>
  );
};
