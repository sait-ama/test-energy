import type { ReactNode } from 'react';

import { ReText } from '@re/ui-kit/ui/text';

export const HorizontalBreak = ({ children = 'или' }: { children?: ReactNode }) => (
  <div className="flex items-center gap-3">
    <span className="bg-secondary h-[2px] flex-1 rounded-md" />
    <ReText
      className="select-none"
      component="span"
      size="sm"
      color="muted-foreground"
      weight="medium"
    >
      {children}
    </ReText>
    <span className="bg-secondary h-[2px] flex-1 rounded-md" />
  </div>
);
