import Remove from '@re/ui-kit/icons/remove';
import type { ButtonProps } from '@re/ui-kit/ui/button';
import { Button } from '@re/ui-kit/ui/button';

export const CancelWithDrawTrigger = ({ loading, ...props }: ButtonProps) => (
  <Button
    className={loading || props.disabled ? 'opacity-60' : ''}
    variant="destructive"
    aria-label="отклонить вывод"
    circle
    {...props}
  >
    <Remove />
  </Button>
);
