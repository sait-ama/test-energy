export const ActivityItemSkeletonList = ({ count = 5, max = 5, SkeletonItem }) =>
  Array.from({ length: Math.min(Math.max(count, 0), max) }, (_, i) => i++).map((key) => (
    <SkeletonItem key={key} />
  ));
