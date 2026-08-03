import { Button, ButtonProps } from '@re/ui-kit/ui/button';
import { Spinner } from '@re/ui-kit/ui/spinner';

import { useStrictContext } from '~shared/utils/use-strict-context';

import { PostMutationContext } from '../../../model/store';

export interface FormButtonFieldProps
  extends Omit<ButtonProps, 'onClick' | 'type' | 'loading' | 'endIcon'> {}

export const FormSubmitButton = (props: FormButtonFieldProps) => {
  const { className, ...rest } = props;

  const {
    actions: { handleSubmit },
    state: { isSubmitSuccess, isPending },
  } = useStrictContext(PostMutationContext);

  const isFormLoading = isPending;
  return (
    <Button
      loading={isFormLoading}
      disabled={isSubmitSuccess}
      onClick={handleSubmit}
      endIcon={isFormLoading ? <Spinner className="text-secondary size-4" /> : undefined}
      size="lg"
      type="submit"
      className={className}
      {...rest}
    />
  );
};
