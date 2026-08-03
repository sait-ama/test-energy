import type { ComponentPropsWithoutRef } from 'react';

import { Badge } from '@re/ui-kit/ui/badge';

interface RequestItemAutosaveProps extends Omit<ComponentPropsWithoutRef<'div'>, 'autoSave'> {
  autoSave?: boolean;
}

export const RequestItemAutosave = (props: RequestItemAutosaveProps) => {
  const { autoSave, ...rest } = props;

  if (!autoSave) return null;

  return (
    <Badge variant="warning" {...rest}>
      Авто
    </Badge>
  );
};
