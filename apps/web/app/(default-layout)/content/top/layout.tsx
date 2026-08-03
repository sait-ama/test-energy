import { unstable_cache } from 'next/cache';

import { ReText } from '@re/ui-kit/ui/text';

import { TopRepository } from '~entities/top/model/repository';
import { TopPeriodTabs } from '~entities/top/ui/top-period-tabs';
import { TopTypeTabs } from '~entities/top/ui/top-tabs';
// import { TopTitle } from '~entities/top/ui/top-title';
import { TopTabSchemaFragment } from '~shared/api/models/top';
import { Container } from '~shared/ui/container';

const getCachedTabs = unstable_cache(async () => {
  return (await TopRepository.tabs(
    {},
    { skipAuthorizationHeaders: true }
  )) as unknown as TopTabSchemaFragment[];
}, ['top-tabs']);

export default async function Layout({
  children,
  // params,
}: {
  children: React.ReactNode;
  params: Promise<{ tab: string }>;
}) {
  const tabs = await getCachedTabs();
  // const { tab } = await params;

  // const selectedTab = tabs.find((t) => t.id === tab);

  return (
    <>
      <Container layout="wide" className="space-y-4 py-4">
        <div className="mt-2 flex flex-col items-center justify-between gap-6 md:gap-12">
          <TopTypeTabs tabs={tabs} />
        </div>
      </Container>

      <Container layout="extraslim" className="space-y-4 py-8 md:pb-12">
        <div className="flex flex-col items-center justify-center gap-2 px-2">
          <ReText size="xl" className="font-semibold md:text-4xl">
            Топы
          </ReText>
          {/* <ReText size="md" align="center" className="text-muted-foreground">
            <TopTitle tabs={tabs} />
          </ReText> */}
          <TopPeriodTabs />
        </div>
      </Container>

      <Container layout="extraslim" className="space-y-4 py-4">
        {children}
      </Container>
    </>
  );
}
