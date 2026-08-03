import { useContentType } from '~app/providers/site-config-provider';
import type { ChapterFragmentSchema } from '~shared/api/models/chapter';
import type { PublisherSchemaFragment } from '~shared/api/models/publisher';
import type { TitleSchemaFragment } from '~shared/api/models/title';

export interface ObjectPost {
  id: number;
  name: string;
  img: string;
  href: string;
  type: 'publisher' | 'title' | 'chapter';
}

export const useMergeObjectsPosts = (
  publisher?: PublisherSchemaFragment | null,
  title?: TitleSchemaFragment | null,
  chapter?: ChapterFragmentSchema | null
) => {
  const isPublisher = !!publisher;
  const { main_name, dir, cover, id } = (title ?? publisher ?? {}) as TitleSchemaFragment &
    PublisherSchemaFragment;
  const contentType = useContentType();
  return {
    id,
    name: isPublisher ? dir : main_name,
    type: isPublisher ? 'publisher' : 'title',
    img: cover?.mid ?? '',
    href: isPublisher ? `/publisher/${dir}` : `/${contentType}/${dir}/${chapter ? chapter.id : ''}`,
  } satisfies ObjectPost;
};
