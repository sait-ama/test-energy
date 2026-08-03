import type { PropsWithChildren } from 'react';

import { SectionContent } from '~shared/ui/section';

export const TopTagsContent = ({
  children,
  className,
}: PropsWithChildren & { className?: string }) => (
  <SectionContent className={className}>{children}</SectionContent>
);
