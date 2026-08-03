'use client';
import { useCallback, useEffect, useState } from 'react';
import { SubmitHandler } from 'react-hook-form';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useTranslations } from 'use-intl';
import { z } from 'zod';

import Plus from '@re/ui-kit/icons/plus';
import { Button } from '@re/ui-kit/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@re/ui-kit/ui/select';

import { CollectionType } from '~entities/card-collections/model/queries';
import {
  MAX_NAME_COLLECTION,
  MIN_NAME_COLLECTION,
} from '~features/(manage-card-collections)/manage-forms/model/consts';
import { InfoModalTrigger } from '~features/info-modal';
import { useCollectionCardType } from '~pages/(user)/inventory-tab/ui/collection-cards-tab/model/state';
import { InfoModalType } from '~shared/api/models/info-modal';
import { Routing } from '~shared/config/routing';
import { useIsomorphicEffect } from '~shared/hooks/use-isomorphic-effect';
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
    .max(MAX_NAME_COLLECTION),
});

const Content = () => {
  'use no memo';
  const [linking, setLinking] = useState(false);

  const router = useRouter();
  const { handleSubmit, trigger, getValues, ...form } = useForm({
    schema,
    defaultValues: { name: '' },
  });
  const submitHandler: SubmitHandler<z.infer<typeof schema>> = useCallback(({ name }) => {
    try {
      setLinking(true);
      router.push(Routing.ManageCardCollections.create({ query: { name } }));
    } catch (e) {
      setLinking(false);

      logger.error(e);
    }
  }, []);
  useEffect(() => {
    return () => setLinking(false);
  });
  const handleEnterDown: KeyboardEvent = async (e) => {
    if (e.key === 'Enter') {
      const isNameValid = await trigger('name');
      if (!isNameValid) return;
      const name = getValues('name');
      submitHandler({ name });
    }
  };
  useIsomorphicEffect(() => {
    document.addEventListener('keydown', handleEnterDown);
    return () => {
      document.removeEventListener('keydown', handleEnterDown);
    };
  }, []);
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
        loading={form.formState.isSubmitting || linking}
        onClick={handleSubmit(submitHandler)}
      >
        Создать
      </Button>
    </Form>
  );
};
export const CollectionCardsActions = () => {
  const [type, setType] = useCollectionCardType();
  const t = useTranslations('collections');

  return (
    <div className="flex w-max gap-2 sm:self-start">
      {type === CollectionType.USER ? (
        <InfoModalTrigger
          variant="default"
          className="shadow-md"
          options={{
            type: InfoModalType.CONTENT,
            title: 'Создание коллекции карт',
            content: <Content />,
          }}
          startIcon={<Plus />}
        >
          Создать
        </InfoModalTrigger>
      ) : null}
      {type === CollectionType.TITLE ? (
        <Button startIcon={<Plus />} asChild>
          <Link href={Routing.Collection.add()} target="_blank">
            Создать
          </Link>
        </Button>
      ) : null}
      <Select onValueChange={setType} value={type}>
        <SelectTrigger className="!h-9 w-fit">{t(`exchangeable.${type}`)}</SelectTrigger>
        <SelectContent>
          <SelectItem value={CollectionType.EXCHANGEABLE}>
            {t('exchangeable.exchangeable')}
          </SelectItem>
          <SelectItem value={CollectionType.USER}>{t('exchangeable.user')}</SelectItem>
          <SelectItem value={CollectionType.TITLE}>{t('exchangeable.title')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
