import { useTranslations } from 'next-intl';

import { z } from 'zod';

import { v2ClubsChangeRolesCreateMutation } from '@re/api/generated/@tanstack/react-query.gen';
import { ChangeRoleMemberRoleEnum } from '@re/api/generated/types.gen';
import { Button } from '@re/ui-kit/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@re/ui-kit/ui/select';

import { ClubKeys } from '~entities/guild/api/query-keys';
import { useDirDepClub } from '~entities/guild/model/hooks';
import { client } from '~shared/api/client';
import type { MemberSchema } from '~shared/api/models/guild-club';
import { useOptimisticMutation } from '~shared/api/react-query';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { Form, FormControl, FormField, FormItem, FormLabel, useForm } from '~shared/ui/form';
import { importToastAsync } from '~shared/ui/toast/toast.async';

export const ClubManageMemberForm = ({ member }: { member: MemberSchema }) => {
  const form = useForm({
    schema: z.object({ role: z.string() }),
    defaultValues: { role: member.role },
  });
  const dir = useDirDepClub();

  const t = useTranslations('pages.guild.members.roles');
  const { mutateAsync, isPending } = useOptimisticMutation({
    invalidateV2: ClubKeys.clubsRetrieveQueryKey({ path: { dir } }),
    ...v2ClubsChangeRolesCreateMutation({ client }),
  });

  const onSubmit = async ({ role }: { role: string }) => {
    const toast = await importToastAsync();
    try {
      await mutateAsync({
        path: { dir },
        body: { members: [{ user_id: member.user.id, role: role as ChangeRoleMemberRoleEnum }] },
      });
      toast.success(`Изменения по участнику ${member.user.username} применены`);
    } catch (e) {
      logger.error(e);
      await resolveErrorAsync(e);
    }
  };

  return (
    <Form {...form}>
      <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel className="mb-3 ml-2">Роль участника "{member.user.username}"</FormLabel>
              <FormControl>
                <Select
                  defaultValue="user"
                  onValueChange={(value) => {
                    field.onChange(value);
                  }}
                  value={field.value}
                >
                  <SelectTrigger>
                    <SelectValue defaultValue="user" placeholder="Выбрать" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {(['member', 'admin'] as const).map((value) => (
                        <SelectItem key={value} value={value}>
                          {/*@ts-ignore*/}
                          {t(value)}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          )}
          name="role"
        />
        <Button loading={isPending} type="submit">
          Применить
        </Button>
      </form>
    </Form>
  );
};
