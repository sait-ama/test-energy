'use client';

import { memo } from 'react';

import CloseIcon from '@re/ui-kit/icons/close';
import { Badge } from '@re/ui-kit/ui/badge';
import { Button } from '@re/ui-kit/ui/button';

interface FilterChipProps {
  label: string;
  onRemove: () => void;
  variant?: 'default' | 'secondary';
}

export const FilterChip = memo<FilterChipProps>(({ label, onRemove, variant = 'secondary' }) => {
  return (
    <Badge variant={variant} className="gap-1 pr-0.5">
      <span className="mt-[-1px]">{label}</span>
      <Button
        size="sm"
        variant="ghost"
        className="hover:bg-destructive hover:text-destructive-foreground size-5 min-w-0 p-0"
        onClick={onRemove}
      >
        <CloseIcon className="size-4" />
      </Button>
    </Badge>
  );
});

FilterChip.displayName = 'FilterChip';
