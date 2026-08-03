'use client';

import { Suspense } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';

import { queryKeyPredicateResolver } from '@re/api/exports-core';
import { Button } from '@re/ui-kit/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@re/ui-kit/ui/dialog';
import { RadioGroup, RadioGroupInputItem } from '@re/ui-kit/ui/radio-group';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { usePublisherVariables } from '~pages/(publisher)/helpers/use-publisher-variables';
import { client } from '~shared/api/client';
import {
  v2DashboardPromoBillingBuyCreateMutation,
  v2DashboardPromoBillingBuyRetrieveOptions,
  v2PublishersRetrieve2QueryKey,
} from '~shared/api/generated/tanstack';
import { queryClient } from '~shared/api/react-query';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { QuerySuspenseContainer } from '~shared/lib/react-query/query-suspense-container';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from '~shared/ui/form';
import { openUrl } from '~shared/utils/open-url';

const BundleSelectField = () => {
  const t = useTranslations('publisher.actions.buy-days.do');
  const form = useFormContext();

  const vars = usePublisherVariables();

  const { data } = useSuspenseQuery(
    v2DashboardPromoBillingBuyRetrieveOptions({ client, path: { publisher_id: vars.publisherId } })
  );

  const options = data.available_packets;

  return (
    <FormField
      control={form.control}
      name="days"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="mt-0 mb-4">{t('form-fields.days.label')}</FormLabel>
          <FormControl>
            <RadioGroup
              value={field.value}
              onValueChange={field.onChange}
              className="flex flex-col justify-center gap-3 md:justify-start"
            >
              {options.map((it) => (
                <FormItem key={it.days}>
                  <FormLabel
                    className="flex cursor-pointer flex-col items-center gap-4"
                    htmlFor={String(it.days)}
                  >
                    <FormControl>
                      <div className="flex w-full items-center justify-center gap-2 md:justify-start">
                        <RadioGroupInputItem value={String(it.days)} id={String(it.days)} />

                        {t('form-fields.days.values', {
                          days: String(it.days),
                          price: String(it.price),
                        })}
                      </div>
                    </FormControl>
                  </FormLabel>
                </FormItem>
              ))}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

const buyAdDaysSchema = z.object({
  days: z.string(),
});

export const PublisherBuyAdDaysButton = () => {
  'use no memo';
  const t = useTranslations('publisher.actions.buy-days.do');
  const vars = usePublisherVariables();

  const form = useForm({
    schema: buyAdDaysSchema,
    defaultValues: {
      days: '10',
    },
  });

  const { mutateAsync: handleBuyDays } = useMutation({
    ...v2DashboardPromoBillingBuyCreateMutation({ client }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        predicate: queryKeyPredicateResolver(v2PublishersRetrieve2QueryKey),
      });
    },
  });

  const onSubmit = async (data: z.infer<typeof buyAdDaysSchema>) => {
    try {
      const response = await handleBuyDays({
        path: { publisher_id: vars.publisherId },
        body: {
          days: Number(data.days),
        },
      });
      openUrl(response.link);
    } catch (e) {
      logger.error(e);
      await resolveErrorAsync(e);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button color="secondary">{t('title')}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-screen-md">
        <QuerySuspenseContainer
          fallback={<div className="bg-secondary h-100 w-full animate-pulse rounded-md" />}
        >
          <Form {...form}>
            <DialogTitle>{t('title')}</DialogTitle>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
              <Suspense
                fallback={<div className="bg-secondary h-18 w-full animate-pulse rounded-md" />}
              >
                <BundleSelectField />
              </Suspense>
              <div className="mt-3 flex w-full justify-end">
                <Button type="submit">{t('trigger')}</Button>
              </div>
            </form>
          </Form>
        </QuerySuspenseContainer>
      </DialogContent>
    </Dialog>
  );
};
