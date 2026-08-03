import { cn } from '@re/ui-kit/utils/cn';

export const StoryProgress = (props: { progress: number; className?: string }) => {
  const { progress, className } = props;

  return (
    <div className={cn('sd bg-muted h-3 w-full overflow-hidden rounded-full', className)}>
      <div
        className={cn('bg-primary h-full rounded-full')}
        style={{ translate: `${-((1 - progress) * 100)}%` }}
      />
    </div>
  );
};
