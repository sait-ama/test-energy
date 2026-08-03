import { PostSkeletonWithoutTitle } from '~entities/post/ui/post-view-skeleton';

export default () => (
  <div className="flex h-screen w-full flex-col gap-4">
    <PostSkeletonWithoutTitle withImage className="h-3/5" />
    <PostSkeletonWithoutTitle className="h-1/5" />
  </div>
);
