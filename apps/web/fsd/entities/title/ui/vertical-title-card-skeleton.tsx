import { SkeletonV2 } from '@re/ui-kit/ui/skeleton';

import {
  TitleCardContent,
  TitleCardRoot,
  TitleCardRootProps,
} from '~entities/title/ui/title-card-base/title-card-base';

export const VerticalTitleCardSkeleton = (
  props: TitleCardRootProps & { contentHidden?: boolean }
) => {
  return (
    <TitleCardRoot {...props}>
      <SkeletonV2 className="aspect-[2/3] w-full" />
      <TitleCardContent className="h-[56px]">
        <SkeletonV2 className="h-4 w-1/2" />
        <SkeletonV2 className="h-5 w-3/4" />
      </TitleCardContent>
    </TitleCardRoot>
  );
};
