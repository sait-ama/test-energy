'use client';
import { useParams } from 'next/navigation';

import { Button } from '@re/ui-kit/ui/button';

import { useUpdateHeroCard } from '~entities/inventory/model/mutations';
import { useHeroCardByIdQuery } from '~entities/inventory/model/queries';
import { AddCardManualForm } from '~features/add-card-manual/ui/add-card-manual-form';
import { useBeforeUnloadAlert } from '~shared/hooks/use-before-unloaded';
import { canSaveCond, haveChangesCond } from '~shared/lib/form/can-save-cond';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { useSession } from '~shared/lib/session/use-session';
import { Form, useForm } from '~shared/ui/form';

import type { EditInventoryCardFormSchema } from '../model/validators';
import { EditInventoryCardSchemaBuilder } from '../model/validators';

export interface CardEditFormProps {
  disabled: boolean;
}

export const CardEditForm = (props: CardEditFormProps) => {
  const { disabled } = props;
  const params = useParams<{ id: string }>();
  const session = useSession();
  const { data: heroCardData } = useHeroCardByIdQuery({
    variables: { params: { cardId: params.id } },
  });

  const form = useForm({
    schema: EditInventoryCardSchemaBuilder({ is_staff: !!session?.is_staff }),
    defaultValues: {
      // title: heroCardData?.title,
      description: heroCardData?.description,
      rank: heroCardData?.rank,
      character: heroCardData?.character?.id,
      cover: heroCardData?.cover?.mid,
    },
    disabled,
  });

  const haveUnsavedChanges = haveChangesCond(form);
  const canSave = canSaveCond(form);

  const { mutateAsync: updateHeroCard, isPending: isCreateHeroCardPending } = useUpdateHeroCard({
    cardId: params.id,
  });

  const onSubmit = form.handleSubmit(
    async (formValues) => {
      const { user_message, ...data } = formValues;
      try {
        const changedData: Partial<EditInventoryCardFormSchema> = {};

        Object.keys(form.formState.dirtyFields).forEach((key) => {
          //@ts-ignore
          changedData[key] = data[key];
        });

        const payload = { data: changedData, user_message };
        await updateHeroCard(payload);
      } catch (e) {
        logger.error(e);
        await resolveErrorAsync(e);
      }
    },
    (e) => logger.error(e, { scope: ['local'] })
  );

  useBeforeUnloadAlert(haveUnsavedChanges);

  return (
    <Form {...form}>
      <AddCardManualForm />
      <div className="flex justify-end">
        <Button
          className="mt-2"
          type="submit"
          disabled={!canSave || isCreateHeroCardPending}
          onClick={onSubmit}
        >
          Применить
        </Button>
      </div>
    </Form>
  );
};
