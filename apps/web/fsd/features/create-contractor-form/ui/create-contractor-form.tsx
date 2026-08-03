'use client';

import { useParams } from 'next/navigation';

import { Button } from '@re/ui-kit/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@re/ui-kit/ui/select';

import { useCreateContractor } from '~entities/publisher/model/mutations';
import { usePublisherQuery } from '~entities/publisher/model/queries';
import type { CreateContractorFormSchema } from '~features/create-contractor-form/model/validators';
import { CreateContractorFormValidator } from '~features/create-contractor-form/model/validators';
import { InfoModalType } from '~shared/api/models/info-modal';
import { useErrorHandler } from '~shared/lib/form/error-handling';
import { useInfoModal } from '~shared/lib/info-modal/use-info-modal';
import { logger } from '~shared/lib/logger';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from '~shared/ui/form';
import { Input } from '~shared/ui/input';
import { PhoneInput } from '~shared/ui/phone-input';
import { Section, SectionTitle } from '~shared/ui/section';

export const CreateContractorForm = () => {
  const params = useParams<{ dir: string }>();
  const { open: openInfoModal } = useInfoModal();

  const { data } = usePublisherQuery({ variables: { params } });
  const { mutateAsync } = useCreateContractor({
    params: {
      publisherId: data!.content.id,
    },
  });

  const form = useForm({
    schema: CreateContractorFormValidator,
    defaultValues: {
      phone: '',
      email: '',
      first_name: '',
      middle_name: '',
      last_name: '',
    },
  });

  const resolveErrors = useErrorHandler({ form });

  const onSubmit = async (data: CreateContractorFormSchema) => {
    try {
      await mutateAsync(data);
      openInfoModal({
        type: InfoModalType.TEXT,
        text: 'А теперь скачай приложение оно во тут',
      });
    } catch (e) {
      await resolveErrors(e);
      logger.error(e);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Section className="space-y-4">
          <SectionTitle>Подписание договора</SectionTitle>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem className="flex flex-col items-start">
                  <FormLabel className="text-left">Имя</FormLabel>
                  <FormControl className="w-full">
                    <Input type="text" placeholder="Введите имя" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="middle_name"
              render={({ field }) => (
                <FormItem className="flex flex-col items-start">
                  <FormLabel className="text-left">Отчество</FormLabel>
                  <FormControl className="w-full">
                    <Input type="text" placeholder="Введите отчество" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem className="flex flex-col items-start">
                  <FormLabel className="text-left">Фамилия</FormLabel>
                  <FormControl className="w-full">
                    <Input type="text" placeholder="Введите фамилию" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="flex flex-col items-start">
                  <FormLabel className="text-left">Номер телефона</FormLabel>
                  <FormControl className="w-full">
                    <PhoneInput placeholder="Введите номер телефона" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex flex-col items-start">
                  <FormLabel className="text-left">Почта</FormLabel>
                  <FormControl className="w-full">
                    <Input type="email" placeholder="Введите почту" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <FormField
              control={form.control}
              name="legal_form_id"
              render={({ field }) => (
                <FormItem className="flex flex-col items-start">
                  <FormLabel className="text-left">Форма сотрудничества</FormLabel>
                  <FormControl className="w-full">
                    <Select
                      value={String(field.value)}
                      onValueChange={(value) => {
                        field.onChange(value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {[
                            { name: 'Самозанятый', id: 2 },
                            {
                              name: 'ИП',
                              id: 3,
                            },
                          ].map(({ name, id }) => (
                            <SelectItem value={String(id)} key={id}>
                              {name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="inn"
              render={({ field }) => (
                <FormItem className="flex flex-col items-start">
                  <FormLabel className="text-left">ИНН</FormLabel>
                  <FormControl className="w-full">
                    <Input type="number" placeholder="Введите ИНН" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" className="flex self-end">
            Сохранить
          </Button>
        </Section>
      </form>
    </Form>
  );
};
