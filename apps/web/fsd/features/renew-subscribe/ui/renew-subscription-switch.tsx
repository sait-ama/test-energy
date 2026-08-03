import React, { ComponentProps, useState } from 'react';
import { useTranslations } from 'next-intl';

import { z } from 'zod';

import { Button } from '@re/ui-kit/ui/button';
import { Checkbox } from '@re/ui-kit/ui/checkbox';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@re/ui-kit/ui/dialog';
import { Switch } from '@re/ui-kit/ui/switch';
import { cn } from '@re/ui-kit/utils/cn';

import { useSubscriptionQuery } from '~entities/subscription/model/api/queries';
import { useRenewSubscriptionMutation } from '~features/renew-subscribe/model/mutations';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { useLoggedCheck } from '~shared/lib/session/use-logged';
import { Form, FormControl, FormDescription, FormField, FormItem, useForm } from '~shared/ui/form';
import { IntLink } from '~shared/ui/int-link';
import { LinearGradient } from '~shared/ui/linear-gradient';
import { importToastAsync } from '~shared/ui/toast/toast.async';
import { UrlFormatter } from '~shared/utils/url-formatter';

const RenewValidator = (t: (message: string) => string) =>
  z.object({
    agreement_accepted: z.literal(true, {
      errorMap: () => ({ message: t('accept-agreement-error') }),
    }),
    offer_accepted: z.literal(true, { errorMap: () => ({ message: t('accept-offer-error') }) }),
  });

export const RenewSubscriptionSwitch = ({ className }: ComponentProps<'div'>) => {
  'use no memo';
  const [open, setOpen] = useState(false);
  const { mutateAsync } = useRenewSubscriptionMutation();
  const { data } = useSubscriptionQuery();
  const { is_renew, status } = data ?? {};
  const withLoggedCheck = useLoggedCheck();
  const t = useTranslations('user.pages.subscription');
  const form = useForm({ schema: RenewValidator(t) });

  const handleRenew = async () => {
    const toast = await importToastAsync();

    try {
      await mutateAsync({ data: { is_renew: !is_renew } });
      toast.success(t(is_renew ? 'un-renew-subscription-success' : 'subscription-success'));
    } catch (e: unknown) {
      logger.error(e);
      await resolveErrorAsync(e);
    }
  };
  if (!status) return null;
  return (
    <Dialog
      open={open}
      onOpenChange={withLoggedCheck((value) => {
        setOpen(value);
      })}
    >
      <DialogTrigger asChild>
        <Button
          asChild
          endIconClassName="mr-2"
          variant={is_renew ? 'outline' : 'default'}
          className={cn(className, 'bg-accent/40 hover:bg-accent/50')}
        >
          <span className="flex items-center gap-4">
            {t('renew-subscribe')}
            <Switch checked={is_renew} onCheckedChange={() => setOpen(true)} />
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="flex w-full flex-col justify-center rounded-md sm:max-w-lg">
        <DialogTitle className="sr-only">{t('renew-form')}</DialogTitle>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleRenew)}>
            <div className="mb-[-164px] flex -translate-y-[170px] justify-center">
              <LinearGradient
                linearPercent={20}
                width={153}
                height={213}
                src={UrlFormatter.media('public/payment-bonus/girl.webp')}
                className="pointer-events-none select-none after:h-[20%] dark:after:h-[50%]"
                alt="Девочка"
              />
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex flex-col gap-2">
                <div className="flex flex-col items-center justify-items-center gap-2">
                  <FormField
                    control={form.control}
                    name="agreement_accepted"
                    render={({ field }) => (
                      <FormItem>
                        <div className="mt-4 flex w-[360px] items-center gap-3">
                          <FormControl>
                            <Checkbox onCheckedChange={field.onChange} />
                          </FormControl>
                          <FormDescription>
                            {t.rich('agree-with-terms', {
                              serviceAgree: (chunks) => (
                                <IntLink href="/subscription-service-agreement" content={chunks} />
                              ),
                              offerAgree: (chunks) => (
                                <IntLink href="/subscription-offer" content={chunks} />
                              ),
                            })}
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="offer_accepted"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex w-[360px] items-center gap-3">
                          <FormControl>
                            <Checkbox onCheckedChange={field.onChange} />
                          </FormControl>
                          <FormDescription>
                            {t.rich('agree-with-personal-data', {
                              dataAgree: (chunks) => (
                                <IntLink href="/personal-data-processing" content={chunks} />
                              ),
                              subscAgree: (chunks) => (
                                <IntLink href="/subscription-agreement" content={chunks} />
                              ),
                            })}
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <Button type="submit">{t('renew-subscribe')}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
