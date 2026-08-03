'use client';
import type { ReactNode } from 'react';
import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';

import Coin from '@re/ui-kit/icons/coin';
import Ticket from '@re/ui-kit/icons/ticket';
import { Accordion, AccordionContent, AccordionItem } from '@re/ui-kit/ui/accordion';
import { Button } from '@re/ui-kit/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@re/ui-kit/ui/dialog';
import { DialogLoading } from '@re/ui-kit/ui/dialog-loading';
import { RadioGroup, RadioGroupInputItem } from '@re/ui-kit/ui/radio-group';
import { Spinner } from '@re/ui-kit/ui/spinner';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import {
  calculateCommissionValue,
  getBonusTicketsCount,
  getChargeMethodByServiceName,
  useActiveOfferIndex,
  useAmount,
  useBonusTicketsCount,
  useChargeCoinLimits,
  useChargeFormFilled,
  useChargeMeta,
} from '~entities/billing/model/hooks';
import { useCreateCharge } from '~entities/billing/model/mutations';
import { useCharge } from '~entities/billing/model/queries';
import {
  ChargeOfferCardCardPremium,
  ChargeOfferCardCardStandard,
} from '~entities/billing/ui/charge-offer-card';
import type { ChargeFormSchema } from '~features/charge/model/types';
import { ChargeFormValidator, ChargeFormValidatorSchema } from '~features/charge/model/validators';
import { ChargeCurrencies } from '~shared/api/models/billing';
import { useChargeModal } from '~shared/lib/charge/use-charge-modal';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
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

const ChargeSuccessContent = ({ link, trackingLink }: { link: string; trackingLink: string }) => {
  const { close } = useChargeModal();

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Готово!</h2>
      <div className="flex flex-col gap-4">
        <p>
          Проведите перевод средств в открывшемся окне. Если окно не открылось, перейдите по
          <a href={link} target="_blank" className="text-primary" rel="noreferrer">
            ссылке
          </a>
        </p>
        <p>После выполнения, ваш баланс пополнится в течение пары минут</p>
        <p>
          Если вы использовали иностранную карту, деньги зачислятся до 24 часов. Если проблема
          осталась, обратитесь в
          <a
            href="https://vk.com/im?sel=-185404064"
            target="_blank"
            className="text-primary"
            rel="noreferrer"
          >
            поддержку
          </a>
        </p>
      </div>
      <Button onClick={close}>Понял</Button>
    </div>
  );
};

const ChargeRoot = ({ children }: { children: ReactNode }) => {
  const limits = useChargeCoinLimits();
  const form = useForm({
    schema: ChargeFormValidator(limits),
    mode: 'onChange',
  });

  const [state, setState] = useState({
    link: '',
    trackingLink: '',
    status: 0,
  });

  const mutation = useCreateCharge();
  const { charge_methods: methods } = useCharge().data!;

  const onCharge = ({ method, amount }: ChargeFormValidatorSchema) => {
    const chargeMethod = getChargeMethodByServiceName(methods, method)!;

    mutation.mutate(
      {
        service: method,
        sum: amount + calculateCommissionValue(amount, chargeMethod.commission),
        currency: chargeMethod?.codes[0] ?? ChargeCurrencies.RUB,
      },
      {
        onSuccess: (response) => {
          const { link, tracking_code } = response;

          setState({
            status: 1,
            link,
            trackingLink: tracking_code,
          });

          window.open(link, '_blank');
        },
        onError: async (error) => {
          await resolveErrorAsync(error);
        },
      }
    );
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit(onCharge, (v) => console.log(v))}
      >
        {state.status === 1 ? (
          <ChargeSuccessContent link={state.link} trackingLink={state.trackingLink} />
        ) : (
          children
        )}
        {mutation.isPending ? <DialogLoading /> : null}
      </form>
    </Form>
  );
};

const ChargeInput = () => {
  const { control } = useFormContext<ChargeFormSchema>();
  const amount = useAmount();
  const bonus = useBonusTicketsCount(amount);

  return (
    <FormField
      control={control}
      name="amount"
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <Input
              {...field}
              onChange={(event) => field.onChange(event.target.valueAsNumber)}
              type="number"
              placeholder="Сколько закинем?"
              startIcon={<Coin />}
              endIcon={
                bonus ? (
                  <div className="flex items-center gap-1">
                    <div className="text-nowrap">{bonus}</div>
                    <Ticket className="mb-0.5" />
                  </div>
                ) : null
              }
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

const ChargeResults = () => {
  const amount = useAmount();
  const bonus = useBonusTicketsCount(amount);
  const { currency, isLoading, commission } = useChargeMeta();

  if (amount === 0 || isLoading) return null;

  return (
    <ReText className="text-muted-foreground flex flex-col items-center justify-center text-sm">
      <span className="flex items-center gap-1">
        Баланс будет пополнен на {amount} <Coin size={16} />
        {bonus ? (
          <>
            и {bonus}
            <Ticket size={16} />
          </>
        ) : null}
      </span>
      {commission ? `включая комиссию эквайринга: ${commission} ${currency}` : null}
    </ReText>
  );
};

const ChargeOffers = () => {
  const { bonus: offers, special_offer } = useCharge().data!;
  const amount = useAmount();
  const activeOfferIndex = useActiveOfferIndex(amount, true);

  return (
    <div className="grid grid-cols-2 grid-rows-2 gap-2">
      {offers.slice(0, 4).map(([amount, tickets], index) => {
        const Card = index === 1 ? ChargeOfferCardCardPremium : ChargeOfferCardCardStandard;
        const bonus = getBonusTicketsCount(amount, offers, special_offer);

        return (
          <Card
            bonus={bonus === tickets ? undefined : bonus}
            key={amount}
            tickets={tickets}
            amount={amount}
            isSelected={activeOfferIndex === index}
          />
        );
      })}
    </div>
  );
};

const ChargeMethods = () => {
  const { charge_methods: methods } = useCharge().data!;
  const { control } = useFormContext();

  if (!methods.length) return null;

  return (
    <div className="my-2 flex flex-col gap-2 px-[4px]">
      <ReText className="mb-1 text-lg font-medium">Платежная система</ReText>
      <FormField
        control={control}
        name="method"
        rules={{ required: 'Обязательное поле' }}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="space-y-0.5s flex flex-col"
              >
                {methods?.map(({ name, subinfo, service, commission }) => (
                  <FormItem
                    key={service}
                    onClick={() => {
                      field.onChange({ target: { value: service } });
                    }}
                    className={cn(
                      'border-card bg-card border-border flex cursor-pointer items-center space-y-0 space-x-3 rounded-sm border border-2 px-4 py-3',
                      'hover:border-accent hover:bg-accent transition-colors',
                      {
                        ['border-primary hover:border-primary']: field.value === service,
                      }
                    )}
                  >
                    <FormControl>
                      <RadioGroupInputItem value={service} className="hidden" />
                    </FormControl>
                    <FormLabel className="mb-0 flex w-full cursor-pointer flex-col gap-1">
                      <span className="text-sm font-medium">{name}</span>
                      <span className="text-muted-foreground text-xs">{subinfo}</span>
                    </FormLabel>
                    <div>{commission}%</div>
                  </FormItem>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

const HideableEntriesRoot = ({ children }: { children: ReactNode }) => {
  const isFormFilled = useChargeFormFilled();
  const amount = useAmount();
  const isAmountValid = amount >= 100;

  return (
    <Accordion
      type="multiple"
      value={[...(isFormFilled ? ['submit'] : []), ...(isAmountValid ? ['methods'] : [])]}
    >
      {children}
    </Accordion>
  );
};

const ChargeSubmitButton = () => {
  const { amount, currency, isLoading, commission } = useChargeMeta();

  return (
    <Button disabled={isLoading} fullWidth type="submit">
      {isLoading ? <Spinner /> : `К оплате ${amount + commission} ${currency}`}
    </Button>
  );
};

export const Charge = () => {
  'use no memo';

  const { isOpen, close } = useChargeModal();
  const { isLoading } = useCharge();

  if (isLoading) return <DialogLoading />;

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="cs-modal-payment p-6 sm:max-w-lg">
        <DialogTitle className="sr-only">Форма пополнения баланса</DialogTitle>
        <ChargeRoot>
          <ReText size="lg" weight="semibold">
            Пополнение баланса
          </ReText>
          <ChargeInput />
          <ChargeOffers />
          <HideableEntriesRoot>
            <AccordionItem value="methods">
              <AccordionContent className="pb-0">
                <ChargeMethods />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="submit" className="mt-4 pb-0">
              <AccordionContent className="flex flex-col gap-4">
                <ChargeSubmitButton />
                <ChargeResults />
              </AccordionContent>
            </AccordionItem>
          </HideableEntriesRoot>
        </ChargeRoot>
      </DialogContent>
    </Dialog>
  );
};
