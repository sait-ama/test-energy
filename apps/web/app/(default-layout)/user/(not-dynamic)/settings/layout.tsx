import { unauthorized } from 'next/navigation';

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { Separator } from '@re/ui-kit/ui/separator';
import { ReText } from '@re/ui-kit/ui/text';

import { SidebarNav } from '~pages/(user)/sidebar';
import { getQueryClient } from '~shared/api/react-query';
import { getSession } from '~shared/lib/session/get-session';
import { Container } from '~shared/ui/container';

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  const session = await getSession();

  if (!session) unauthorized();

  // await queryClient.prefetchQuery(getUserQuery({ id: params.id }));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Container slim className="mt-4 px-3">
        <ReText size="xl" weight="semibold">
          Настройки
        </ReText>
        <Separator className="my-4" />
        <div className="flex flex-col gap-2 lg:flex-row">
          <aside className="w-full lg:w-1/5">
            <SidebarNav />
          </aside>
          <div className="flex-1">{children}</div>
        </div>
      </Container>
    </HydrationBoundary>
  );
}
