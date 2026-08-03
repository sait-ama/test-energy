'use client';

import { useState } from 'react';
import Link from 'next/link';

import { z } from 'zod';

import { Button } from '@re/ui-kit/ui/button';
import { Checkbox } from '@re/ui-kit/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@re/ui-kit/ui/select';
import { ReText } from '@re/ui-kit/ui/text';

import { usePublisherForms } from '~entities/publisher/model/queries';
import { PublisherRepository } from '~entities/publisher/model/repository';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { Form, FormControl, FormField, FormItem, FormMessage, useForm } from '~shared/ui/form';
import { Input } from '~shared/ui/input';
import { LinkBase } from '~shared/ui/link-base';
import { importToastAsync } from '~shared/ui/toast/toast.async';

const getVklUrl = (url?: string | null) => (url?.startsWith('https://') ? url : `https://${url}`);

export interface PublisherFormProps {}

const PublisherFormValidator = () =>
  z.object({
    type: z.string().min(1, { message: 'Поле тип обязательное' }).optional(),
    name: z.string().min(6, { message: 'Название должно быть больше 6 символов' }).optional(),
    vk: z.string().min(1, { message: 'Обязательно' }).optional(),
    agree: z.literal<boolean>(true).optional(),
  });

type PublisherFormSchema = z.infer<ReturnType<typeof PublisherFormValidator>>;

export const PublisherForm = () => {
  const { data } = usePublisherForms(['type']);

  const form = useForm({
    schema: PublisherFormValidator(),
  });

  const {
    handleSubmit,
    clearErrors,
    control,
    formState: { errors },
  } = form;
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (formData: PublisherFormSchema) => {
    const { agree, type, ...rest } = formData;

    const toast = await importToastAsync();

    const payload = {
      data: {
        agree,
        data: {
          type: Number(type) /* Иначе не воркает o_ o */,
          ...rest,
        },
      },
    };

    setIsLoading(true);

    try {
      await PublisherRepository.add(payload);

      toast.success(
        'Ваша заявка принята и отправлена на модерацию, скоро придет уведомление с решением модерации'
      );
    } catch (e: unknown) {
      logger.error(e);

      await resolveErrorAsync(e);
    }

    setIsLoading(false);
  };

  return (
    <Form {...form}>
      <form
        autoComplete="off"
        onSubmit={(e) => {
          clearErrors();
          handleSubmit(onSubmit)(e);
        }}
        className="border-border m-auto flex w-full max-w-[340px] flex-col items-center gap-5 rounded-md border p-5"
      >
        <ReText size="md" align="center" weight="semibold">
          Создать отряд контент-мейкеров!
        </ReText>
        <div className="flex w-full flex-col gap-3">
          <FormField
            control={control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                    }}
                  >
                    <SelectTrigger withIcon>
                      <SelectValue placeholder="*Род деятельности :D" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {data?.content?.type
                          ?.filter((it) => it.id !== 2)
                          ?.map(({ name, id }) => (
                            <SelectItem key={id} value={String(id) /* Иначе не воркает o_ o */}>
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
            control={control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input {...field} placeholder="*Название" type="text" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="vk"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    onChange={(e) => {
                      field.onChange(getVklUrl(e.target.value));
                    }}
                    placeholder="*Ссылка на группу или сообщество"
                    type="text"
                  />
                </FormControl>
                <FormMessage className="ml-3" />
              </FormItem>
            )}
          />
        </div>

        <div className="w-full">
          <FormField
            control={control}
            name="agree"
            render={({ field: { value, ...field } }) => (
              <FormItem className="ml-4 flex items-center gap-3">
                <FormControl>
                  <Checkbox {...field} required onCheckedChange={field.onChange} checked={value} />
                </FormControl>
                <ReText size="sm" weight="semibold">
                  Нажимая на галочку, вы подтверждаете, что согласны
                  <LinkBase>
                    <Link shallow={false} prefetch={false} href="/rules" target="_blank">
                      с правилами сайта
                    </Link>
                  </LinkBase>
                </ReText>
              </FormItem>
            )}
          />
        </div>

        <div className="mx-auto">
          <Button color="primary" disabled={isLoading} type="submit">
            Добавить
          </Button>
        </div>
      </form>
    </Form>
  );
};
