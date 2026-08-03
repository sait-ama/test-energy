import { FC, memo, ReactNode } from 'react';
import Link from 'next/link';

import { ReText } from '@re/ui-kit/ui/text';

import { UserAvatar } from '~entities/user/ui/user-avatar';
import type { UserSchemaFragment } from '~shared/api/models/common';
import { Routing } from '~shared/config/routing';

type SimpleUserCardBaseProps = {
  user?: UserSchemaFragment | null | undefined;
  title: ReactNode;
  content: ReactNode;
};

export interface SimpleUserCardProps extends SimpleUserCardBaseProps {}

export const SimpleUserCard: FC<SimpleUserCardProps> = memo(({ user, title, content }) => (
  <div className="flex items-center gap-3 overflow-hidden">
    <Link
      prefetch={false}
      href={user ? Routing.User.detail({ params: { id: user.id } }) : '#'}
      className="flex size-14 shrink-0 items-center justify-center overflow-hidden select-none"
      target="_blank"
    >
      <UserAvatar
        size="md"
        className="shrink-0 select-none"
        avatarSrc={user?.avatar.mid}
        frameSrc={user?.frame.high}
        alt={user?.username || 'user card'}
      />
    </Link>
    <div className="flex flex-col">
      <ReText component="span" weight="semibold">
        {title}
      </ReText>
      <ReText component="span" size="sm" weight="medium" color="muted-foreground">
        {content}
      </ReText>
    </div>
  </div>
));
