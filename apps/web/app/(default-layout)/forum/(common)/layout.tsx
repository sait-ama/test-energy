import type { ReactNode } from 'react';

import { GlobalImagePreviewAsync } from '~shared/lib/multy-image-preview/ui/global-image-preview.async';
import { ScrollToTop } from '~shared/lib/react/scroll-to-top';
import { ForumLayout } from '~widgets/post/layout/layout';

export default async function ForumLayoutApp({ children }: { children: ReactNode }) {
  // Нужно перенести это вниз вместе с провайдером - на уровень Page
  // const url = `?${new URLSearchParams(searchParams).toString()}`;

  // const store = createForumTagsStore({
  //   // @ts-expect-error
  //   url,
  // });

  // const storeState = store.getState();

  return (
    <ForumLayout>
      {children}

      <GlobalImagePreviewAsync />

      <ScrollToTop className="md:bottom-inherit bottom-16 size-12" />
    </ForumLayout>
  );
}
