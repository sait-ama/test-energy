import { HorizontalTitleCard } from '~entities/title/ui/horizontal-title-card';

export const TopContentSkeleton = () => {
  return (
    <div className="gap-sm grid grid-cols-1 gap-2 md:grid-cols-2">
      {Array(8)
        .fill(0)
        .map((_, i) => (
          <HorizontalTitleCard model={null} isLoading key={`l_${i}`} />
        ))}
    </div>
  );
};
