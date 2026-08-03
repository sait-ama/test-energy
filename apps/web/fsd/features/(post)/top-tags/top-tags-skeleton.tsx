import { Skeleton } from '@re/ui-kit/ui/skeleton';

import { TopTagsContent } from '~features/(post)/top-tags/tags-content';
import { TopTagsTitle } from '~features/(post)/top-tags/tags-title';

import { TopTagsRoot } from './tags-root';

export const SkeletonTags = () => (
  <TopTagsRoot>
    <TopTagsTitle />
    <TopTagsContent className="grid grid-cols-[60px_minmax(90px,_94px)_95px] gap-1">
      {new Array(10).fill(null).map((_, key) => (
        <Skeleton
          containerClassName="flex-1"
          className="h-[28px] flex-1 rounded-[10px]"
          key={key}
        />
      ))}
    </TopTagsContent>
  </TopTagsRoot>
);
