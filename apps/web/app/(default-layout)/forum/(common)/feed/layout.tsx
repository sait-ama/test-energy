import type { ReactNode } from 'react';

import { Tabs, TabsList, TabsTrigger } from '@re/ui-kit/ui/tabs';

import { Ordering } from '~features/(post)/filters/ui/ordering';
import { SearchPostContextProvider } from '~features/(post)/search-bar/model/context/search-provider';
import { SearchPost } from '~features/(post)/search-bar/ui';
import { Container } from '~shared/ui/container';
import { RightBlock } from '~widgets/post/layout/right-block';

export default function PostLayout({ children }: { children: ReactNode }) {
  return (
    <Container slim className="flex gap-4 px-1 py-1 md:py-4">
      <SearchPostContextProvider>
        <div className="relative flex w-full flex-col flex-wrap gap-2 md:max-w-[calc(100%-300px)] md:gap-4">
          <SearchPost name="search_term_string" className="post-header bg-secondary/60" />
          <Tabs defaultValue="feed" className="flex w-full flex-col">
            <div className="flex w-full items-center justify-between gap-3">
              <TabsList className="h-9 md:hidden" defaultValue="feed">
                <TabsTrigger value="feed" className="h-8 px-4">
                  Лента
                </TabsTrigger>
                <TabsTrigger value="tops" className="h-8 px-4">
                  Топы
                </TabsTrigger>
              </TabsList>
              <Ordering className="md:hidden" />
            </div>
            {children}
          </Tabs>
        </div>
      </SearchPostContextProvider>
      <RightBlock />
    </Container>
  );
}

export const dynamic = 'force-dynamic';
