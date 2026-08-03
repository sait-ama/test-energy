'use client';
import React from 'react';
import Sticky from 'react-sticky-el';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Button } from '@re/ui-kit/ui/button';

import { canCreatePost } from '~entities/post/model/ability/forum/actions';
import { Routing } from '~shared/config/routing';
import { useAuthModal } from '~shared/lib/auth/use-auth-modal';
import { Media } from '~shared/lib/media';
import { Display } from '~shared/lib/media/const';
import { useSession } from '~shared/lib/session/use-session';
import { Tops } from '~widgets/post/tops';

export const RightBlock = () => {
  const sessionId = useSession((v) => v?.id);
  const can_create = canCreatePost({ sessionId });
  const pathname = usePathname();
  const isCreatePage = pathname.includes('create');
  const { open: openAuthModal } = useAuthModal();

  const content = (
    <Button
      style={{ textTransform: 'none' }}
      className="w-full"
      onClick={
        !can_create
          ? () => {
              openAuthModal();
            }
          : undefined
      }
      size="lg"
      color="primary"
      variant="shadow"
    >
      Создать пост
    </Button>
  );

  return (
    <Media greaterThanOrEqual={Display.md} className="sticky-container w-full max-w-[300px]">
      <Sticky
        hideOnBoundaryHit={false}
        topOffset={-76}
        stickyClassName="mt-[76px] z-100"
        boundaryElement=".sticky-container"
      >
        <div className="flex w-full flex-col gap-4">
          {!isCreatePage ? (
            can_create ? (
              <Link shallow={false} prefetch={false} href={Routing.Forum.Create.create({})}>
                {content}
              </Link>
            ) : (
              content
            )
          ) : null}
          <Tops />
        </div>
      </Sticky>
    </Media>
  );
};
