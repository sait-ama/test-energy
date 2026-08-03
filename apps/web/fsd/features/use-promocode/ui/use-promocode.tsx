import { ComponentProps } from 'react';
import { SubmitHandler } from 'react-hook-form';
import { useTranslations } from 'next-intl';

import type { z } from 'zod';

import ArrowRight from '@re/ui-kit/icons/arrow-right';
import { Button, ButtonProps } from '@re/ui-kit/ui/button';
import { Input } from '@re/ui-kit/ui/input';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { useBillingPromoCodesCreateMutation } from '~pages/(user)/promocode/model/mutations';
import { useBeforeUnloadAlert } from '~shared/hooks/use-before-unloaded';
import { haveChangesCond } from '~shared/lib/form/can-save-cond';
import { useErrorHandler } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { TestProps } from '~shared/lib/test/utils/test-props';
import { Form, FormControl, FormField, FormItem, useForm } from '~shared/ui/form';
import { Section } from '~shared/ui/section';
import { importToastAsync } from '~shared/ui/toast/toast.async';

import { TypePomocodeValidator } from '../model/validators';

const UserPromoCodeFormSubmitButton = ({ disabled }: ButtonProps) => {
  const t = useTranslations('promo-codes');

  return (
    <Button
      className="h-9 p-0 px-1 pl-5"
      endIcon={
        <span
          style={{ width: '30px', height: '30px' }}
          className="bg-secondary flex !h-[30px] !w-[30px] items-center justify-center rounded-full hover:opacity-[0.7] dark:bg-white"
          role="button"
        >
          <ArrowRight stroke="hsl(var(--r-primary))" size={16} className="-rotate-[45deg]" />
        </span>
      }
      disabled={disabled}
      type="submit"
    >
      {t('actions.create.do.submit')}
    </Button>
  );
};
export const UserPromoCodeForm = (props: ComponentProps<'form'>) => {
  const { className, ...rest } = props;
  const t = useTranslations('promo-codes');

  const { mutateAsync, isPending } = useBillingPromoCodesCreateMutation();
  const form = useForm({ schema: TypePomocodeValidator });
  const resolveError = useErrorHandler({ form });
  const haveChanges = haveChangesCond(form);

  useBeforeUnloadAlert(haveChanges);

  const onSubmit: SubmitHandler<z.infer<typeof TypePomocodeValidator>> = async (data) => {
    try {
      const toast = await importToastAsync();
      const r = await mutateAsync({ body: data });
      toast.success(r?.msg || t('actions.create.do.success'));
    } catch (e) {
      await resolveError(e);
      logger.error(e);
    }
  };

  return (
    <Form {...form}>
      <form
        {...rest}
        {...TestProps.id(`user-promo-code-form`)}
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('flex flex-col gap-[14px]', className)}
      >
        <Section className="!bg-secondary flex flex-row gap-3 rounded-full p-3">
          <FormField
            control={form.control}
            name="promo_code"
            render={({ field }) => (
              <FormItem className="h-9 w-full flex-1 basis-[220px]">
                <FormControl>
                  <Input
                    {...TestProps.id(`user-promo-code-form-main-input`)}
                    className="h-9 w-full bg-white/12"
                    placeholder={t('fields.promo-code.placeholder')}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <UserPromoCodeFormSubmitButton
            {...TestProps.id(`user-promo-code-form-main-submit-button`)}
            disabled={isPending || !haveChanges}
          />
        </Section>
        <ReText align="center" size="md" color="muted-foreground">
          {t('fields.promo-code.title')}
        </ReText>
      </form>
    </Form>
  );
};
