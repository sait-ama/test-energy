import { memo, ReactNode } from 'react';
import Link from 'next/link';

import { createContext } from '@re/core/utils/create-context';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import {
  MomentCardBackground,
  MomentCardDescription,
  MomentCardImage,
  MomentCardRoot,
} from '~entities/moment/ui/moment-card';
import { UserAvatar } from '~entities/user/ui/user-avatar';
import { MomentSchema } from '~shared/api/models/inventory';
import { Routing } from '~shared/config/routing';
import { htmlRegExp } from '~shared/lib/regexp/is-html';
import { sanitizeSync } from '~shared/lib/sanitize/sanitize-sync';
import { UrlFormatter } from '~shared/utils/url-formatter';

const { Provider: MomentShortProvider, useStore: useMomentShort } = createContext<
  MomentSchema,
  MomentSchema
>((v) => v);

export const MomentShortRoot = memo(
  ({ children, moment }: { children: ReactNode; moment: MomentSchema }) => {
    return <MomentShortProvider value={moment}>{children}</MomentShortProvider>;
  },
  (prev, next) => prev.moment.id === next.moment.id
);

const MomentShortAuthor = memo(() => {
  const moment = useMomentShort();
  return (
    <Link
      className="-mx-1 flex items-center gap-2"
      href={Routing.User.detail({ params: { id: moment.author.id, tab: 'about' } })}
    >
      <UserAvatar
        size={32}
        frameSrc={moment.author.frame.high}
        alt={moment.author.username}
        avatarSrc={moment.author.avatar.high}
      />
      <ReText weight="semibold" size="md">
        {moment.author.username}
      </ReText>
    </Link>
  );
});

const MomentShort = memo(() => {
  const moment = useMomentShort();

  return (
    <MomentCardRoot
      className={cn('relative flex h-screen w-full justify-center', {
        'after:to-secondary after:absolute after:inset-0 after:size-full after:bg-gradient-to-b after:from-transparent after:from-40% dark:after:to-black':
          !!moment.description,
        'opacity-[0.7]': moment.is_deleted || moment.is_banned,
      })}
    >
      <MomentCardBackground src={UrlFormatter.media(moment.image.low)} />
      <MomentCardImage src={UrlFormatter.media(moment.image.high)} className="h-screen" />
      <div className="absolute right-0 bottom-32 left-0 z-[5] flex w-full flex-col gap-1 px-4 pr-20 md:bottom-20">
        <MomentShortAuthor />
        {String(sanitizeSync(moment.description)).replace(htmlRegExp, '') ? (
          <MomentCardDescription style={{ fontSize: 17 }}>
            {moment.description}
          </MomentCardDescription>
        ) : null}
      </div>
    </MomentCardRoot>
  );
});

export { MomentShort, MomentShortAuthor };
