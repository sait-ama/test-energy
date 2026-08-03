import type { PropsWithChildren } from 'react';
import { getTranslations } from 'next-intl/server';

import { ReText } from '@re/ui-kit/ui/text';

import { Container } from '~shared/ui/container';
import { Underline } from '~shared/ui/underline';
import { Filters } from '~widgets/(collections)/_filters';

export default async function CollectionsLayout({ children }: PropsWithChildren) {
  const t = await getTranslations('pages.collections.collections-page.sections.header');

  return (
    <Container slim className="px-4 py-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Underline>
            <ReText weight="bold" className="max-sm:text-md" size="2xl" component="h1">
              {t('title')}
            </ReText>
          </Underline>
          <Filters />
        </div>
        {children}
      </div>
    </Container>
  );
}
export const dynamic = 'force-dynamic';
