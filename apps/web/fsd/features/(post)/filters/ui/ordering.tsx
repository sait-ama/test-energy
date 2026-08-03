'use client';
import { cn } from '@re/ui-kit/utils/cn';

import { RouterMenuSelect } from '~shared/ui/router-menu/ui/router-menu-select';

//'-score', '-created_at', 'id', '-id'
export const sortVariantsAlt = [
  { value: 'id', label: 'Старые' },
  { value: '-id', label: 'Новые' },
  { value: '-score', label: 'По лайкам' },
  // { value: 'week', label: 'За неделю' },
];

export const Ordering = ({ className }: { className?: string }) => {
  return (
    <RouterMenuSelect
      defaultValue="-id"
      className={cn('transition-hidden min-w-[140px]', className)}
      fieldName="ordering"
      options={sortVariantsAlt}
    />
  );
};
