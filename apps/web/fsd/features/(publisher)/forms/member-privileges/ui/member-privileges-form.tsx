import React, { useCallback, useMemo } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useParams } from 'next/navigation';

import { z } from 'zod';

import { Button } from '@re/ui-kit/ui/button';
import { Checkbox } from '@re/ui-kit/ui/checkbox';
import { Skeleton } from '@re/ui-kit/ui/skeleton';
import { cn } from '@re/ui-kit/utils/cn';

import {
  usePublisherMemberDetailQuery,
  usePublisherQuery,
} from '~entities/publisher/model/queries';
import { PublisherQueryKey } from '~entities/publisher/model/query-keys';
import { useAllRightsRecord } from '~features/(publisher)/forms/member-privileges/model/hooks';
import type {
  PublisherMemberSchema,
  PublisherMembersListResponseSchema,
  RightSchema,
} from '~shared/api/models/publisher';
import { getQueryClient } from '~shared/api/react-query';
import { useBeforeUnloadAlert } from '~shared/hooks/use-before-unloaded';
import { canSaveCond } from '~shared/lib/form/can-save-cond';
import { useErrorHandler } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import type { FlatListItemRenderer, FlatListLoadingProps } from '~shared/ui/flat-list-v2';
import { FlatList, FlatListRoot } from '~shared/ui/flat-list-v2';
import { Form, FormControl, FormField, FormItem, FormLabel, useForm } from '~shared/ui/form';
import { importToastAsync } from '~shared/ui/toast/toast.async';
import { useCurrentPublisherMemberUpdateMutation } from '~widgets/(publisher-settings)/members/model/mutations';

export const MemberPrivilegesForm = ({
  memberId,
  onSettled,
}: {
  memberId: number;
  onSettled?: (success?: boolean) => void;
}) => {
  const { dir } = useParams();
  const { data: { content } = {}, isLoading: isPublisherLoading } = usePublisherQuery(
    { variables: { params: { dir } } },
    { enabled: !!dir }
  );
  const { data: { rights = [] as string[], role } = {}, isLoading } = usePublisherMemberDetailQuery(
    { variables: { params: { id: content!.id, memberId } } },
    { enabled: !!content }
  );
  const { array: allRightsArray } = useAllRightsRecord();
  const form = useForm({
    schema: z.object({ rights: z.string().array() }),
    defaultValues: useMemo(() => ({ rights }), [rights]),
  });
  const haveUnsavedChanges = canSaveCond(form);
  useBeforeUnloadAlert(!haveUnsavedChanges);
  const resolver = useErrorHandler({ form });
  const { mutateAsync, isPending } = useCurrentPublisherMemberUpdateMutation();
  const onSubmit: SubmitHandler<{ rights: string[] }> = async (data) => {
    try {
      await mutateAsync({
        params: { publisher_id: content!.id, user_id: memberId },
        data: { ...data, role },
      });
      const toast = await importToastAsync();
      const queryClient = getQueryClient();
      queryClient.setQueryData<PublisherMembersListResponseSchema>(
        PublisherQueryKey.membersByPublisherId({ params: { publisherId: content!.id } }),
        // @ts-ignore
        (v) =>
          !v
            ? v
            : {
                ...v,
                results: v.results.map((v) => (v.user.id === memberId ? { ...v, ...data } : v)),
              }
      );
      queryClient.setQueryData<PublisherMemberSchema>(
        PublisherQueryKey.MemberDetail.get({
          params: {
            id: content!.id,
            memberId,
          },
        }),
        (old) => {
          if (!old) return old;
          return { ...old, rights: data.rights };
        }
      );
      toast.success('Права успешно изменены');
      onSettled?.(true);
    } catch (e) {
      await resolver(e);
      logger.error(e);
      onSettled?.(false);
    }
  };

  const renderSkeletons: FlatListLoadingProps['children'] = useCallback(
    ({ key }) => <Skeleton key={key} className="mb-4 h-6 w-full" containerClassName="w-full" />,
    []
  );

  const renderFields: FlatListItemRenderer<RightSchema> = useCallback(
    ({ item: { label, name } }) => (
      <FormField
        defaultValue={rights}
        shouldUnregister={!content || !allRightsArray || isLoading}
        key={name}
        control={form.control}
        render={({ field }) => (
          <FormItem className="flex items-center gap-4">
            <FormControl className="mb-3">
              <Checkbox
                checked={field.value.includes(String(name))}
                onCheckedChange={(checked) => {
                  checked
                    ? field.onChange([...(field.value ?? []), name])
                    : field.onChange(field.value.filter((value: string) => value !== name) ?? []);
                }}
              />
            </FormControl>
            <FormLabel
              className={cn(
                'cursor-pointer font-normal',
                !field.value.includes(name) && 'text-muted-foreground'
              )}
            >
              {label}
            </FormLabel>
          </FormItem>
        )}
        name="rights"
      />
    ),
    []
  );
  return (
    <Form {...form}>
      <FlatListRoot
        asChild
        className="flex flex-col gap-4"
        content={allRightsArray}
        isLoading={isPublisherLoading || isLoading || !allRightsArray.length}
      >
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FlatList.Content>{renderFields}</FlatList.Content>
          <FlatList.Loading count={20}>{renderSkeletons}</FlatList.Loading>
          <Button type="submit" loading={isPending} disabled={!haveUnsavedChanges}>
            Сохранить
          </Button>
        </form>
      </FlatListRoot>
    </Form>
  );
};
