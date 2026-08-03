import { PostSkeletonTitle, PostSkeletonWithoutTitle } from '~entities/post/ui/post-view-skeleton';

export const renderPostsSkeleton = ({ key, index }: { key: NumberIsomorphic; index: number }) =>
  !(index % 2) ? (
    <PostSkeletonTitle withImage={!(index % 4)} key={key} />
  ) : (
    <PostSkeletonWithoutTitle withImage={!!(((index + 1) / 4) | 0)} key={key} />
  );

export const PostSkeletons = () =>
  new Array(10).fill(null).map((_, index) =>
    renderPostsSkeleton({
      key: index,
      index,
    })
  );
