'use client';

import { Button } from '@re/ui-kit/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@re/ui-kit/ui/tabs';

import { ShopRepository } from '~entities/shop/model/repository';
import { CustomizationItemForm } from '~features/customization-item-form/ui/customization-item-form';
import { ShopImageItemType } from '~shared/api/models/shop';
import { useBeforeUnloadAlert } from '~shared/hooks/use-before-unloaded';
import { haveChangesCond } from '~shared/lib/form/can-save-cond';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { Form, useForm } from '~shared/ui/form';
import { importToastAsync } from '~shared/ui/toast/toast.async';
import { type2Name } from '~widgets/customization-add-form/model/consts';
import type { CustomizationFormSchema } from '~widgets/customization-add-form/model/types';
import { CustomizationFormValidator } from '~widgets/customization-add-form/model/validators';

export const CustomizationAddForm = () => {
  'use no memo';

  const form = useForm({
    schema: CustomizationFormValidator,
    defaultValues: {
      type: ShopImageItemType.AVATAR,
      amount: 0,
    },
  });

  const tab = form.watch('type');

  const haveUnsavedChanges = haveChangesCond(form);
  // const canSave = canSaveCond(form);

  useBeforeUnloadAlert(haveUnsavedChanges);

  const handleSubmit = async (values: CustomizationFormSchema) => {
    const toast = await importToastAsync();

    try {
      await ShopRepository.createShopItem({ data: values });
      toast.success('Элемент кастомизации успешно добавлен');
    } catch (e: unknown) {
      logger.error(e);
      await resolveErrorAsync(e); // todo error resolver/transformer
    }
  };

  const onValueChange = (tab: string) => {
    form.setValue('type', tab as ShopImageItemType);
    form.setValue('image', '');
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit(handleSubmit, (e) => logger.error(e, { scope: ['local'] }))}
      >
        <Tabs value={tab} onValueChange={onValueChange}>
          <TabsList>
            {Object.entries(type2Name).map(([value, key]) => (
              <TabsTrigger key={key} value={value}>
                {key}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <CustomizationItemForm type={tab} />
        <div className="flex justify-end">
          <Button type="submit">Отправить на модерацию</Button>
        </div>
      </form>
    </Form>
  );
};
