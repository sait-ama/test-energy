import { cn } from '@re/ui-kit/utils/cn';

import { LightBoxRoot } from '../../components/light-box-root';
import type { LightBoxComponentProps } from '../../types';
import { cssVar } from '../../utils';

/** Inline plugin container */
export function InlineContainer({
  inline: { className, style, ...rest } = {},
  styles,
  children,
}: LightBoxComponentProps) {
  return (
    <LightBoxRoot
      className={cn('relative', className)}
      style={{
        [cssVar('controller_overscroll_behavior')]: 'contain auto',
        ...styles.root,
        ...style,
      }}
      {...rest}
    >
      {children}
    </LightBoxRoot>
  );
}
