import { useFormStatus } from 'react-dom';
import { SubmitHandler, useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';

import { Button, ButtonProps } from '@re/ui-kit/ui/button';
import { z } from 'zod';

import {
  CreateCollectionCardsClientFormType,
  MangeCollectionCardsClientSchema,
} from '~features/(manage-card-collections)/manage-forms/model/schema';
import { useCanSave } from '~features/(manage-card-collections)/manage-forms/model/use-can-save';

export interface SubmitActionProps {
  compoundOnSubmitHandler: SubmitHandler<z.infer<typeof MangeCollectionCardsClientSchema>>;
}

export const SubmitAction = ({
  compoundOnSubmitHandler,
  disabled,
  loading,
  ...props
}: ButtonProps & SubmitActionProps) => {
  const t = useTranslations('reusable.actions');
  const { pending: formPending } = useFormStatus();
  const form = useFormContext<z.infer<typeof MangeCollectionCardsClientSchema>>();
  const {
    formState: { isSubmitting },
  } = useFormContext<CreateCollectionCardsClientFormType>();
  const canSave = useCanSave();
  return (
    <Button
      {...props}
      disabled={isSubmitting || disabled || !canSave}
      loading={isSubmitting || formPending || loading}
      variant="default"
      onClick={form.handleSubmit(compoundOnSubmitHandler)}
    >
      {t('save')}
    </Button>
  );
};
