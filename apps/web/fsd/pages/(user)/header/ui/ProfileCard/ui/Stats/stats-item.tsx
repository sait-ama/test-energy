import type { ReactElement } from 'react';
import { cloneElement } from 'react';

import type { BadgeProps } from '@re/ui-kit/ui/badge';
import { Badge } from '@re/ui-kit/ui/badge';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

interface StatsItemProps extends BadgeProps {
  icon?: ReactElement;
}

export const StatsItem = (props: StatsItemProps) => {
  const { icon, className, children, ...rest } = props;

  return (
    <Badge
      className={cn('flex items-center gap-2 py-1 hover:bg-transparent', className)}
      variant="secondary"
      {...rest}
    >
      {!!icon && cloneElement(icon, { className: 'w-[18px] text-muted-foreground' })}
      <ReText
        size="sm"
        weight="medium"
        color="muted-foreground"
        className="flex items-center gap-2 whitespace-nowrap"
      >
        {children}
      </ReText>
    </Badge>
  );
};
