'use client';
import { Fragment } from 'react';
import Link from 'next/link';

import PlusIcon from '@re/ui-kit/icons/plus';
import { Button } from '@re/ui-kit/ui/button';

import { canCreatePost } from '~entities/post/model/ability/forum/actions';
import { Routing } from '~shared/config/routing';
import { useMediaQuery } from '~shared/hooks/use-media-query';
import { useAuthModal } from '~shared/lib/auth/use-auth-modal';
import { useSession } from '~shared/lib/session/use-session';

export const CreateButton = () => {
  const { open: openAuthModal } = useAuthModal();
  const sessionId = useSession((v) => v?.id);
  const can_create = canCreatePost({ sessionId });
  const Comp = can_create ? Link : Fragment;
  const props = can_create ? { href: Routing.Forum.Create.create({ query: {} }) } : undefined;
  const isMobile = useMediaQuery(`(max-width: 800px)`, { defaultValue: undefined });
  if (!isMobile) return null;
  return (
    <Button
      className="fixed right-4 bottom-16 z-10 size-12"
      circle
      onClick={
        !can_create
          ? () => {
              openAuthModal();
            }
          : undefined
      }
      asChild={can_create}
      fullWidth
      color="primary"
      size="lg"
    >
      {/*@ts-ignore*/}
      <Comp {...props}>
        <PlusIcon className="size-6" />
      </Comp>
    </Button>
  );
};
