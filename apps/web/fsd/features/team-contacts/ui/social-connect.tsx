'use client';

import type { ReactNode } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useParams } from 'next/navigation';

import pick from 'lodash.pick';
import type { z } from 'zod';

import Close from '@re/ui-kit/icons/close';
import { Button } from '@re/ui-kit/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@re/ui-kit/ui/card';

import { useCurrentSuspensePublisherQuery } from '~entities/publisher/model/hooks';
import { usePublisherUpdate } from '~entities/publisher/model/mutations';
import type { Social } from '~features/connect-social/model/consts';
import { isBanned, socialIcons, socialNames } from '~features/team-contacts/model/const';
import { createSocialSchema } from '~features/team-contacts/model/validators';
import type { PublisherLinkType } from '~shared/api/models/publisher';
import { useBeforeUnloadAlert } from '~shared/hooks/use-before-unloaded';
import { canSaveCond, haveChangesCond } from '~shared/lib/form/can-save-cond';
import { useErrorHandler } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { Form, FormControl, FormField, FormItem, FormMessage, useForm } from '~shared/ui/form';
import { Input } from '~shared/ui/input';
import { importToastAsync } from '~shared/ui/toast/toast.async';

type SocialCardProps = {
  id?: NumberIsomorphic | null | undefined;
  children: ReactNode;
} & Pick<Social, 'name' | 'icon'>;

const SocialCard = (props: SocialCardProps) => {
  const { icon: Icon, name, children } = props;
  return (
    <Card variant="ghost" className="aspect-square">
      <CardHeader className="flex-row items-center justify-between">
        <div className="flex w-full flex-row items-center gap-4">
          <Icon size={48} className="bg-muted rounded-sm p-2" />
          <div className="flex w-full flex-col justify-center gap-2">
            <CardTitle>{name}</CardTitle>
            <CardDescription>{children}</CardDescription>
          </div>
        </div>
        {/*<SocialButton isConnected={isConnected} provider={provider} field={field} />*/}
      </CardHeader>
    </Card>
  );
};
export const ConnectSocial = () => {
  const { dir } = useParams();
  const { data: links } = useCurrentSuspensePublisherQuery((v) => v.content.links);
  const { mutateAsync, isPending } = usePublisherUpdate();
  const schema = createSocialSchema(links);
  // @ts-ignore
  const form = useForm({ schema, shouldUnregister: !links, defaultValues: links });
  const haveChanges = haveChangesCond(form);
  useBeforeUnloadAlert(haveChanges);

  const canSave = canSaveCond(form);
  const resolver = useErrorHandler({ form });
  const handleSubmit: SubmitHandler<z.infer<typeof schema>> = async (data) => {
    const validated = pick(data, Object.keys(form.formState.dirtyFields));
    try {
      await mutateAsync({ params: { dir }, data: { ...validated } });
      const toast = await importToastAsync();
      toast.success('Изменения усмешно применены');
    } catch (error) {
      await resolver(error);
      logger.error(error);
    }
  };
  // @ts-ignore
  const validSocials = Object.keys(links).filter((v) => !isBanned(v)) as PublisherLinkType[];
  return (
    <Form {...form}>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {validSocials.map((field) => {
          const name = socialNames[field];
          const icon = socialIcons[field];
          return (
            <FormField
              key={field}
              control={form.control}
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <SocialCard name={name} icon={icon}>
                      <Input
                        endIcon={
                          field.value ? (
                            <Close
                              className="text-red-700 duration-200 hover:text-red-900"
                              onClick={() => {
                                field.onChange('');
                              }}
                            />
                          ) : null
                        }
                        className="w-full"
                        placeholder={`Введите ссылку на ${name}`}
                        {...field}
                      />
                    </SocialCard>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
              name={field}
            />
          );
        })}
      </div>
      <Button
        className="mt-2"
        loading={isPending}
        disabled={!canSave}
        onClick={form.handleSubmit(handleSubmit)}
      >
        Применить
      </Button>
    </Form>
  );
};
