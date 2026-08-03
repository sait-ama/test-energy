import type { ButtonProps } from '@re/ui-kit/ui/button';
import { Button } from '@re/ui-kit/ui/button';

export type FeedbackTriggerButtonProps = ButtonProps;

export const FeedbackTriggerButton = ({ ref, ...props }: FeedbackTriggerButtonProps) => {
  const { children, ...rest } = props;

  return (
    <Button {...rest} ref={ref} color="default">
      {children || 'Обратная связь'}
    </Button>
  );
};
