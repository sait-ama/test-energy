'use client';

import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';

import { Alert } from '@re/ui-kit/ui/alert';
import { Button } from '@re/ui-kit/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@re/ui-kit/ui/select';
import { ReText } from '@re/ui-kit/ui/text';

import type { ReportSchema } from '~entities/report/model/types';
import { ReportValidator } from '~entities/report/model/types';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { htmlRegExp } from '~shared/lib/regexp/is-html';
import { TestProps } from '~shared/lib/test/utils/test-props';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '~shared/ui/form';
import { Input } from '~shared/ui/input';
import { importToastAsync } from '~shared/ui/toast/toast.async';

import { useSendReport } from '../model/mutations';
import { useReportReasons } from '../model/queries';

export interface ReportProps {
  type: string;
  target: NumberIsomorphic;
  onSuccess?: () => void;
  prepare?: (arg: any) => any;
}

export const Report = (props: ReportProps) => {
  'use no memo';

  const { type, target, prepare = (v) => v, onSuccess } = props;
  const { data: reasons = [] } = useReportReasons({ variables: { query: { type } } });
  const { mutateAsync } = useSendReport();
  const form = useForm<ReportSchema>({
    resolver: zodResolver(ReportValidator),
  });

  const { watch, control } = form;
  const [loading, setLoading] = useState(false);

  const onSubmit: SubmitHandler<ReportSchema> = async (values) => {
    if (loading) return;
    const toast = await importToastAsync();

    try {
      setLoading(true);
      await mutateAsync(
        prepare({
          type,
          target,
          ...values,
        })
      );

      onSuccess?.();
      toast.success('Жалоба успешно отправлена. Когда ее проверят, придет уведомление');
    } catch (e: unknown) {
      logger.error(e);
      await resolveErrorAsync(e);
      // setError('reason', { type: 'server', message: e.detail.message });
    } finally {
      setLoading(false);
    }
  };

  const reason = watch('reason');
  const foundReason = reasons.find((r) => String(r.id) === reason);
  return (
    <Form {...form}>
      <form name="form" className="flex w-full max-w-[400px] flex-col gap-4">
        <ReText size="lg" weight="semibold">
          Отправить жалобу
        </ReText>
        <div className="flex flex-col gap-2">
          <FormField
            control={control}
            name="reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Причина репорта</FormLabel>
                <FormControl>
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
                        {reasons.map(({ name, id }, idx) => (
                          <SelectItem
                            {...TestProps.id(`reason_${idx + 1}`)}
                            value={String(id)}
                            key={id}
                          >
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
          {(foundReason?.description ?? '').replace(htmlRegExp, '').replace('&nbsp;', '') ? (
            <Alert
              severity="info"
              className="rounded-md"
              dangerouslySetInnerHTML={{ __html: foundReason?.description ?? '' }}
            />
          ) : null}

          <FormField
            control={control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Сообщение</FormLabel>
                <FormControl>
                  <Input {...TestProps.id(`report_msg_input`)} {...field} type="text" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          onClick={form.handleSubmit(onSubmit)}
          disabled={loading}
          {...TestProps.id(`send_report_btn`)}
          className="self-end"
        >
          Отправить жалобу
        </Button>
      </form>
    </Form>
  );
};
