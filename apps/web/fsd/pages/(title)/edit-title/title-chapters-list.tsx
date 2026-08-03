'use client';

import { useParams, useSearchParams } from 'next/navigation';

import { useRouter } from '@bprogress/next';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@re/ui-kit/ui/tabs';

import { useContentType } from '~app/providers/site-config-provider';
import { TitleEditProvider } from '~entities/title/model/store';
import { EditTitlePublishedChapters } from '~pages/(title)/edit-title-published-chapters/edit-title-published-chapters';
import { EditTitleUnpublishedChapters } from '~pages/(title)/edit-title-unpublished-chapters/edit-title-unpublished-chapters';
import { Routing } from '~shared/config/routing';
import { useControllableState } from '~shared/hooks/use-controllable-state';

export const TitleChaptersList = () => {
  const params = useParams<{ dir: string }>();
  const searchParams = useSearchParams();
  const contentType = useContentType();
  const tab = searchParams.get('tab') ?? 'published';

  const [state, setState] = useControllableState({
    defaultProp: tab,
    onChange: (tab) => {
      router.push(
        Routing.Title.editChapters({
          params: { dir: params.dir, content: contentType },
          query: { tab },
        })
      );
    },
  });

  const router = useRouter();

  return (
    <Tabs value={state} onValueChange={setState} defaultValue="published">
      <TabsList className="mb-2">
        <TabsTrigger value="published">Опубликованные</TabsTrigger>
        <TabsTrigger value="unpublished">Ожидают публикации</TabsTrigger>
      </TabsList>
      <TabsContent value="published">
        <TitleEditProvider>
          <EditTitlePublishedChapters />
        </TitleEditProvider>
      </TabsContent>
      <TabsContent value="unpublished">
        <TitleEditProvider>
          <EditTitleUnpublishedChapters />
        </TitleEditProvider>
      </TabsContent>
    </Tabs>
  );
};
