import { SubmitHandler } from 'react-hook-form';

import { z } from 'zod';

import { Button, ButtonProps } from '@re/ui-kit/ui/button';

import { resolvedName } from '~entities/card-collections/model/utils';
import {
  MAX_NAME_COLLECTION,
  MIN_NAME_COLLECTION,
} from '~features/(manage-card-collections)/manage-forms/model/consts';
import { InfoModalTrigger } from '~features/info-modal';
import { InfoModalType } from '~shared/api/models/info-modal';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { useInfoModal } from '~shared/lib/info-modal/use-info-modal';
import { logger } from '~shared/lib/logger';
import { Form, FormControl, FormField, FormItem, FormMessage, useForm } from '~shared/ui/form';
import { Input } from '~shared/ui/input';

const schema = z.object({
  name: z
    .string()
    .regex(/^[A-Za-zА-Яа-я]/, {
      message: 'Строка должна начинаться с буквы (латиница или кириллица)',
    })
    .min(MIN_NAME_COLLECTION)
    .max(MAX_NAME_COLLECTION)
    .transform(resolvedName),
});
type SubmitHandler = (name: string) => void;
const Content = ({
  onSuccess,
  defaultValue,
}: {
  onSuccess?: SubmitHandler;
  defaultValue: string;
}) => {
  'use no memo';
  const close = useInfoModal((v) => v.close);
  const form = useForm({ schema, defaultValues: { name: defaultValue } });
  const handleSubmit: SubmitHandler<z.infer<typeof schema>> = async ({ name }) => {
    try {
      onSuccess?.(name);
      close();
    } catch (e) {
      await resolveErrorAsync(e);
      logger.error(e);
    }
  };
  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem className="w-full">
            <FormControl>
              <Input {...field} placeholder="Введите название коллекции" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <Button
        className="px-12"
        size="xl"
        loading={form.formState.isSubmitting}
        onClick={form.handleSubmit(handleSubmit)}
      >
        Изменить
      </Button>
    </Form>
  );
};
//todo bad dry
export const NameFieldEditTrigger = ({
  children,
  onSuccess,
  defaultValue,
  ...props
}: ButtonProps & { onSuccess?: SubmitHandler; defaultValue: string }) => {
  'use no memo';
  return (
    <InfoModalTrigger
      {...props}
      options={{
        type: InfoModalType.CONTENT,
        title: 'Изменение названия',
        content: <Content defaultValue={defaultValue} onSuccess={onSuccess} />,
      }}
    >
      {children}
    </InfoModalTrigger>
  );
};
