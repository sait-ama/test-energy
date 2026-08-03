import type { ReactNode } from 'react';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { Card, CardContent, CardFooter, CardHeader } from '@re/ui-kit/ui/card';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { useContentType } from '~app/providers/site-config-provider';
import { UserAvatar } from '~entities/user/ui/user-avatar';
import {
  SubContentType,
  SubscriptionAsPublisher,
  SubscriptionAsTitle,
  SubscriptionAsUser,
  SubscriptionSchema,
} from '~shared/api/models/user-subscriptions';
import { Routing } from '~shared/config/routing';
import { UrlFormatter } from '~shared/utils/url-formatter';

export const SubscriptionOnUserCard = (
  props: SubscriptionAsUser & {
    className?: string;
    footer?: ReactNode | ReactNode[];
    header?: ReactNode | ReactNode[];
  }
) => {
  const { avatar: { high = '' } = {}, id, username, className, footer, header } = props;
  return (
    <Card className={cn(className, '!border-border rounded-md !border pt-3')}>
      {header && <CardHeader>{header}</CardHeader>}
      <CardContent className="flex flex-col items-center">
        <Link shallow={false} prefetch={false} href={Routing.User.detail({ params: { id } })}>
          <UserAvatar size={80} alt={username} avatarSrc={high} />
        </Link>
        <ReText size="md" align="center" component="span" className="mt-2 break-all" lineClamp={1}>
          {username}
        </ReText>
      </CardContent>
      {footer && <CardFooter className="flex items-center justify-center">{footer}</CardFooter>}
    </Card>
  );
};

export const SubscriptionOnPublisherCard = (
  props: SubscriptionAsPublisher & {
    footer?: ReactNode | ReactNode[];
    header?: ReactNode | ReactNode[];
    className?: string;
  }
) => {
  const { cover: { high = '' } = {}, dir, name, className, header, footer } = props;
  return (
    <Card
      className={cn('!border-border flex flex-col items-center rounded-md !border pt-3', className)}
    >
      {header && <CardHeader>{header}</CardHeader>}
      <CardContent className="flex flex-col items-center gap-2">
        <Link href={Routing.Publisher.detail({ params: { dir, tab: 'about' } })}>
          <UserAvatar size={80} className="size-[60px]" alt={name} avatarSrc={high} />
        </Link>
        <ReText size="md" align="center" component="span" className="mt-2 break-all" lineClamp={1}>
          {name}
        </ReText>
      </CardContent>
      <CardFooter>{footer}</CardFooter>
    </Card>
  );
};

export const SubscriptionOnTitleCard = (
  props: SubscriptionAsTitle & {
    footer?: ReactNode | ReactNode[];
    header?: ReactNode | ReactNode[];
    className?: string;
  }
) => {
  const { cover, dir, main_name, className, header, footer } = props;
  const contentType = useContentType();

  return (
    <Card
      className={cn('!border-border flex flex-col items-center rounded-md !border pt-3', className)}
    >
      {header && <CardHeader>{header}</CardHeader>}
      <CardContent className="flex flex-col items-center gap-2">
        <Link href={Routing.Title.detail({ params: { content: contentType, dir, tab: 'main' } })}>
          <Image
            width={64}
            height={96}
            className="aspect-[2/3] rounded-md"
            alt={main_name}
            src={UrlFormatter.media(cover?.mid)}
          />
        </Link>
        <ReText size="md" align="center" component="span" className="mt-2 break-all" lineClamp={1}>
          {main_name}
        </ReText>
      </CardContent>
      <CardFooter>{footer}</CardFooter>
    </Card>
  );
};

export interface SubscriptionCardFabricProps {
  subType: SubContentType;
  className?: string;
  subscribtion: SubscriptionSchema;
  footer?: ReactNode | ReactNode[];
  header?: ReactNode | ReactNode[];
}

export const SubscriptionCardFabric = ({
  subscribtion,
  className,
  subType,
  header,
  footer,
}: SubscriptionCardFabricProps) => {
  switch (subType) {
    case 'author_publishers':
    case 'titles_publishers': {
      return (
        <SubscriptionOnPublisherCard
          header={header}
          footer={footer}
          className={className}
          {...(subscribtion as SubscriptionAsPublisher)}
        />
      );
    }
    case 'author_users': {
      return (
        <SubscriptionOnUserCard
          header={header}
          footer={footer}
          className={className}
          {...(subscribtion as SubscriptionAsUser)}
        />
      );
    }
    case 'title_cards': {
      return (
        <SubscriptionOnTitleCard
          header={header}
          footer={footer}
          className={className}
          {...(subscribtion as SubscriptionAsTitle)}
        />
      );
    }
    default: {
      return null;
    }
  }
};
