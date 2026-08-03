import { PostSkeletons } from '~entities/post/ui/post-skeletons-list';
import { FlatListLayout } from '~shared/ui/flat-list-v2';

export default () => (
  <FlatListLayout className="flex flex-col gap-4">
    <PostSkeletons />
  </FlatListLayout>
);
