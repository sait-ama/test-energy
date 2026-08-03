import { Skeleton } from '@re/ui-kit/ui/skeleton';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { sanitizeSync } from '~shared/lib/sanitize/sanitize-sync';

export interface BadgeBaseProps {
  tagline?: string;
  loading?: boolean;
  className?: string;
}

// todo переносы должны быть насильно применены или оставить автоприменение по shy? текущий вариант - 2
export const BadgeBase = ({ loading = false, tagline, className }: BadgeBaseProps) =>
  loading ? (
    <Skeleton containerClassName="h-[30px] w-30" className="h-full" />
  ) : (
    <div
      className={cn(
        'md:bg-secondary flex min-h-[30px] items-center justify-center rounded-md px-2 whitespace-nowrap',
        className
      )}
    >
      <ReText
        className="text-center"
        dangerouslySetInnerHTML={{
          __html: sanitizeSync(tagline || ''),
        }}
        color="muted-foreground"
        size="sm"
      />
    </div>
  );
