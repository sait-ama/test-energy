import * as React from 'react';

import { Button } from '@re/ui-kit/ui/button';
import { cn } from '@re/ui-kit/utils/cn';

import { useLightboxProps } from '~shared/lib/lightbox/stores/lightbox-props';

import { ELEMENT_ICON } from '../consts';
import { Label } from '../types';
import { cssClass, label as translateLabel } from '../utils';

export type IconButtonProps = React.ComponentProps<'button'> & {
  label: Label;
  icon: React.ElementType;
  renderIcon?: () => React.ReactNode;
};

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, className, icon: Icon, renderIcon, onClick, style, color, ...rest },
  ref
) {
  const { styles, labels } = useLightboxProps();
  const buttonLabel = translateLabel(labels, label);

  return (
    <Button
      ref={ref}
      circle
      variant="secondary"
      size="lg"
      title={buttonLabel}
      aria-label={buttonLabel}
      onClick={onClick}
      style={{ ...style, ...styles.button }}
      className={cn('', className)}
      {...rest}
    >
      {renderIcon ? (
        renderIcon()
      ) : (
        <Icon className={cn(cssClass(ELEMENT_ICON))} style={styles.icon} />
      )}
    </Button>
  );
});
