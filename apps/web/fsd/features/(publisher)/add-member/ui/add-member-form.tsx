import React from 'react';
import type { SubmitHandler } from 'react-hook-form';

import { Button } from '@re/ui-kit/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@re/ui-kit/ui/select';

import { useCreateMemberMutation } from '~features/(publisher)/add-member/model/mutations';
import type { AddMemberRequestSchema } from '~features/(publisher)/add-member/model/validator';
import { AddMemberValidator } from '~features/(publisher)/add-member/model/validator';
import { useBeforeUnloadAlert } from '~shared/hooks/use-before-unloaded';
import { canSaveCond, haveChangesCond } from '~shared/lib/form/can-save-cond';
import { useErrorHandler } from '~shared/lib/form/error-handling';
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
import { importToastAsync } from '~shared/ui/toast/toast.async';
import { usePublisherPrivilegesRecord } from '~widgets/(publisher-settings)/members/model/hooks';

export const AddPublisherMemberForm = ({ publisherId }: { publisherId: number }) => {
  const form = useForm({ schema: AddMemberValidator });
  const haveUnsavedChanges = haveChangesCond(form);
  const canSave = canSaveCond(form);
  const resolveError = useErrorHandler({ form });
  const { array } = usePublisherPrivilegesRecord();
  const { mutateAsync, isPending } = useCreateMemberMutation();
  const onSubmit: SubmitHandler<AddMemberRequestSchema> = async (data) => {
    const { userId, ...otherData } = data;
    try {
      const toast = await importToastAsync();
      // @ts-ignore
      await mutateAsync({
        params: { publisher_id: publisherId, user_id: userId },
        data: otherData,
      });
      toast.success(`Участник ${userId} успешно приглашён`);
      form.reset();
    } catch (e) {
      await resolveError(e);
      logger.error(e);
    }
  };
  useBeforeUnloadAlert(haveUnsavedChanges);

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit, console.log)}>
        <FormField
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>*Id юзера</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => {
                    field.onChange(
                      e.currentTarget.value ? Number(e.currentTarget.value) : undefined
                    );
                  }}
                  placeholder="id юзера"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
          name="userId"
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Роль</FormLabel>
              <FormControl>
                <Select
                  onValueChange={(value) => {
                    field.onChange(Number(value));
                  }}
                  value={String(field.value)}
                >
                  <SelectTrigger>
                    <SelectValue defaultValue={1} placeholder="Выбрать" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {array.map(({ id, name }) => (
                        <SelectItem key={id} value={String(id)}>
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
        <Button type="submit" loading={isPending} disabled={!canSave}>
          Пригласить
        </Button>
      </form>
    </Form>
  );
};
