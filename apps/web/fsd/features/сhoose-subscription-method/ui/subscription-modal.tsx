'use client';

import React, { ComponentProps, useState } from 'react';
import { FieldErrors } from 'react-hook-form/dist/types/errors';
import { useTranslations } from 'next-intl';

import DayJS from 'dayjs';
import { z } from 'zod';

import Coin from '@re/ui-kit/icons/coin';
import { Button } from '@re/ui-kit/ui/button';
import { Checkbox } from '@re/ui-kit/ui/checkbox';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@re/ui-kit/ui/dialog';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { useSubscriptionQuery } from '~entities/subscription/model/api/queries';
import { SubscriptionPriceButton } from '~entities/subscription/ui/subscription-price-button';
import { useBuySubscriptionMutation } from '~features/deactivate-premium/model/mutations';
import { UnsubscribeButton } from '~features/deactivate-premium/ui/unsubscribe-button';
import { ChargeType, PaymentTypes } from '~shared/api/models/subscription';
import { useChargeModal } from '~shared/lib/charge/use-charge-modal';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { useLoggedCheck } from '~shared/lib/session/use-logged';
import { useSession } from '~shared/lib/session/use-session';
import { Form, FormControl, FormDescription, FormField, FormItem, useForm } from '~shared/ui/form';
import { IntLink } from '~shared/ui/int-link';
import { LinearGradient } from '~shared/ui/linear-gradient';
import { importToastAsync } from '~shared/ui/toast/toast.async';
import { openUrl } from '~shared/utils/open-url';
import { UrlFormatter } from '~shared/utils/url-formatter';

const SubscriptionValidator = (t: (message: string) => string) =>
  z.object({
    agreement_accepted: z.literal(true, {
      errorMap: () => ({ message: t('user.pages.subscription.accept-agreement-error') }),
    }),
    offer_accepted: z.literal(true, {
      errorMap: () => ({ message: t('user.pages.subscription.accept-offer-error') }),
    }),
    type: z.nativeEnum(ChargeType),
  });

type SubscriptionSchema = z.infer<ReturnType<typeof SubscriptionValidator>>;

export const SubscriptionModal = ({
  className,
  denyMessage,
  confirmMessage,
  ...props
}: ComponentProps<'div'> & {
  confirmMessage?: string;
  denyMessage?: string;
}) => {
  'use no memo';
  const [open, setOpen] = useState(false);
  const withAuth = useLoggedCheck();
  const session = useSession();
  const openWithAuth = withAuth((value: boolean) => {
    setOpen(value);
  });
  const { is_premium = false, balance = '0' } = session || {};
  const { mutateAsync } = useBuySubscriptionMutation();
  const t = useTranslations();
  const { open: openChargeModal } = useChargeModal();

  const form = useForm({ schema: SubscriptionValidator(t) });
  const { data } = useSubscriptionQuery();
  const { date_end, price = '0' } = data ?? {};
  const isSubscriptionEnd = DayJS(date_end).isBefore(DayJS(new Date()));

  const handleSubscribe = async (values: SubscriptionSchema) => {
    const toast = await importToastAsync();

    if (values.type === ChargeType.BALANCE && parseFloat(balance) < parseFloat(price)) {
      openChargeModal();
      return;
    }

    try {
      const response = await mutateAsync({ buy_type: values.type });

      if (values.type === ChargeType.TINKOFF_SUB) {
        openUrl(response.link);
      }

      if (values.type === ChargeType.BALANCE) {
        toast.success(t('user.pages.subscription.subscription-success'));
      }
    } catch (e: unknown) {
      logger.error(e);
      await resolveErrorAsync(e);
    }
  };

  const handleError = async (errors: FieldErrors<SubscriptionSchema>) => {
    const toast = await importToastAsync();

    const message = Object.values(errors)
      .map((it) => it.message)
      .join('. ');

    toast.error(message);
  };

  if (is_premium && !isSubscriptionEnd && !!date_end)
    return (
      <UnsubscribeButton {...props} className={cn('h-10', className)}>
        {denyMessage || t('user.pages.subscription.unsubscribe-button')}
      </UnsubscribeButton>
    );

  return (
    <Dialog open={open} onOpenChange={openWithAuth}>
      <DialogTrigger asChild>
        <Button className={cn('h-10', className)} {...props}>
          {confirmMessage || t('user.pages.subscription.subscribe-button')}
        </Button>
      </DialogTrigger>
      <DialogContent
        style={{ transform: 'translate(0px, 70px)' }}
        className="s-modal-premium align-center flex w-full flex-col justify-center sm:max-w-lg"
      >
        <DialogTitle className="sr-only">
          {t('user.pages.subscription.subscribe-title')}
        </DialogTitle>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubscribe, handleError)}>
            <div className="mb-[-164px] flex -translate-y-[170px] justify-center">
              <LinearGradient
                width={153}
                height={213}
                src={UrlFormatter.media('public/app-promo-respect/girl.webp')}
                className="pointer-events-none select-none"
                alt="Девочка"
                linearPercent={50}
              />
            </div>
            <div className="flex flex-col gap-2">
              <ReText align="center" weight="semibold" size="lg">
                {t('user.pages.subscription.subscribe-title')}
              </ReText>
              <ReText align="center" color="muted-foreground">
                {t('user.pages.subscription.subscribe-description')}
              </ReText>
            </div>
            <div className="mt-1 flex flex-col gap-1.5">
              <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-center">
                <SubscriptionPriceButton
                  color="secondary"
                  paymentType={PaymentTypes.coins}
                  className="min-w-[180px]"
                  type="submit"
                  onClick={() => {
                    form.setValue('type', ChargeType.BALANCE);
                  }}
                />
                <ReText className="text-center">{t('reusable.conjunctions.or')}</ReText>
                <SubscriptionPriceButton
                  paymentType={PaymentTypes.card}
                  className="min-w-[180px]"
                  type="submit"
                  onClick={() => {
                    form.setValue('type', ChargeType.TINKOFF_SUB);
                  }}
                />
              </div>
              <div className="grid grid-cols-2 items-center justify-items-center">
                <div className="flex flex-row items-center justify-items-center gap-1">
                  <ReText size="sm" color="muted-foreground">
                    {t('user.pages.subscription.balance-label', { balance })}
                  </ReText>

                  <Coin width={20} height={20} />
                </div>
                <ReText size="sm" color="muted-foreground">
                  {t('user.pages.subscription.payment-methods')}
                </ReText>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <FormField
                control={form.control}
                name="agreement_accepted"
                render={({ field }) => (
                  <FormItem>
                    <div className="mt-4 flex items-center gap-3">
                      <FormControl>
                        <Checkbox onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormDescription>
                        {t.rich('user.pages.subscription.agree-with-terms', {
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
                    <div className="flex items-center gap-3">
                      <FormControl>
                        <Checkbox onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormDescription>
                        {t.rich('user.pages.subscription.agree-with-personal-data', {
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
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
