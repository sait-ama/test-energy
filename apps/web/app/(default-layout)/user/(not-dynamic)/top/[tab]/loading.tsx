import {} from '~pages/(user)/top/user-top-detailed';
import {
  ListItemSkeleton,
  ListTopContentRoot,
  ListTopRoot,
  ListTopThreeRoot,
  TopItemSkeleton,
} from '~shared/ui/item-top';

export default function RootLoading() {
  return (
    <ListTopRoot>
      <ListTopThreeRoot>
        <TopItemSkeleton className="justify-end" />
        <TopItemSkeleton className="justify-start" />
        <TopItemSkeleton className="justify-end" />
      </ListTopThreeRoot>
      <ListTopContentRoot>
        {Array(8)
          .fill(null)
          .map((_, index) => (
            <ListItemSkeleton key={index} />
          ))}
      </ListTopContentRoot>
    </ListTopRoot>
  );
}
