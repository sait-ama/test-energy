'use client';
import type { PropsWithChildren } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Button } from '@re/ui-kit/ui/button';

import { usePublisherSettingsAbility } from '~entities/publisher/model/hooks';
import { ErrorBase } from '~features/error-view/ui/error-base';
import type { PublisherResponseSchema } from '~shared/api/models/publisher';
import { Routing } from '~shared/config/routing';

export const ContentWith403Checking = ({
  children,
  publisher,
}: { tab: string } & PropsWithChildren & {
    publisher: PublisherResponseSchema;
  }) => {
  const ability = usePublisherSettingsAbility();
  const pathname = usePathname() || '';
  const tab = pathname.split('/').at(-1);
  // @ts-ignore
  const canViewCurrentPage = ability.can('read', tab!);
  const canViewSomething = ability.can('read', 'something');
  const error = (
    <ErrorBase
      className="m-auto flex translate-y-[50%] items-center justify-center md:translate-x-1/4 md:justify-normal"
      actions={
        <Link
          prefetch={false}
          href={Routing.Publisher.detail({ params: { dir: publisher.content.dir, tab: 'about' } })}
        >
          <Button>К команде</Button>
        </Link>
      }
      status={403}
      text={`Вы не имеете доступа к настройкам команды ${publisher.content.name} - ${tab}`}
    />
  );

  return canViewSomething && canViewCurrentPage ? children : error;
};
