'use client';

import type { ChangeEvent, JSX } from 'react';
import { useState } from 'react';

import Activity from '@re/ui-kit/icons/activity';
import Coin from '@re/ui-kit/icons/coin';
import Ticket from '@re/ui-kit/icons/ticket';
import { Badge } from '@re/ui-kit/ui/badge';
import { Button } from '@re/ui-kit/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@re/ui-kit/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@re/ui-kit/ui/select';
import { ReText } from '@re/ui-kit/ui/text';

import { useExchangeCoins } from '~entities/billing/model/mutations';
import { useExchangeCoinsRate } from '~entities/billing/model/queries';
import { useExchangeModal } from '~shared/lib/exchange/use-exchnage-modal';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { useSession } from '~shared/lib/session/use-session';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormSeparateMessage,
  useForm,
} from '~shared/ui/form';
import { Input } from '~shared/ui/input';
import { importToastAsync } from '~shared/ui/toast/toast.async';
import { CurrencyExchangeSchema } from '~widgets/currency-exchange/model/validators';

interface Option {
  value: 'money' | 'ticket';
  icon: JSX.Element;
  label: string;
}

const options: Option[] = [
  {
    value: 'money',
    icon: <Coin className="size-4 flex-shrink-0" />,
    label: 'Монетки',
  },
  {
    value: 'ticket',
    icon: <Ticket className="size-4 flex-shrink-0" />,
    label: 'Тикеты',
  },
];

export const StoreCurrencyExchangeModal = () => {
  'use no memo';

  const { isOpen, close } = useExchangeModal();
  const { mutateAsync } = useExchangeCoins();
  const { data } = useExchangeCoinsRate({ variables: {} }, { enabled: isOpen });
  const { money_rate, ticket_rate } = data ?? {};

  const [chosenCurrency, setChosenCurrency] = useState<'money' | 'ticket' | undefined>(undefined);

  const user = useSession();
  const userMoneyBalance = Number(user?.balance);
  const userTicketsBalance = Number(user?.ticket_balance);

  const maxValues = {
    money: userMoneyBalance ?? 0,
    ticket: userTicketsBalance ?? 0,
  };

  const form = useForm({
    reValidateMode: 'onChange',
    schema: CurrencyExchangeSchema,
    defaultValues: {
      currencyCount: 1,
    },
  });

  const {
    setError,
    clearErrors,
    watch,
    formState: { errors },
  } = form;

  const calculateActivityPoints = (count: number): number | null => {
    if (!money_rate || !ticket_rate) return null;

    if (chosenCurrency === 'money') {
      return count * money_rate;
    }
    if (chosenCurrency === 'ticket') {
      return count * ticket_rate;
    }

    return null;
  };

  const handleInputChange =
    (field: any, maxValue: number) => (e: ChangeEvent<HTMLInputElement>) => {
      const inputValue = Number(e.target.value);

      if (inputValue > maxValue) {
        setError('__error.notEnoughCurrency', { message: 'Недостаточно средств' });
      } else {
        clearErrors('__error.notEnoughCurrency');
      }
      field.onChange(inputValue);
    };

  const onSubmit = async (data: { currencyCount: number }) => {
    const toast = await importToastAsync();
    try {
      await mutateAsync({ amount: Number(data.currencyCount), currency: chosenCurrency });
      toast.success('Обмен прошел успешно!');
    } catch (e) {
      logger.error(e);
      await resolveErrorAsync(e);
    }
  };

  const currencyCount = watch('currencyCount');

  return (
    <Dialog onOpenChange={close} open={isOpen}>
      <DialogContent className="mt-[-60px] sm:mt-0 sm:max-w-lg">
        <div className="flex flex-col gap-1">
          <DialogTitle className="flex items-center gap-1">
            <ReText weight="semibold" size="lg">
              Обмен на очки активности
            </ReText>
            <Activity />
          </DialogTitle>
          <ReText size="xs" color="muted-foreground" className="flex">
            Курс: 1 монетка =&nbsp;
            <span className="text-accent-foreground flex items-center gap-1">
              {money_rate}
              <Activity className="size-3" />
            </span>
            &nbsp; активности, 1 тикет =&nbsp;
            <span className="text-accent-foreground flex items-center gap-1">
              {ticket_rate}
              <Activity className="size-3" />
            </span>
            .
          </ReText>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-1 flex flex-col gap-2">
            <>
              <ReText weight="bold">Баланс:</ReText>
              <div className="flex gap-2">
                <Badge className="flex gap-2 px-3 py-2" variant="outline">
                  <Coin />
                  <ReText>{userMoneyBalance ?? '0'}</ReText>
                </Badge>
                <Badge variant="outline" className="flex gap-2 px-3 py-2">
                  <Ticket />
                  <ReText>{userTicketsBalance ?? '0'}</ReText>
                </Badge>
              </div>
            </>
            <ReText className="mb-1" weight="bold">
              Отдадите:
            </ReText>
            <div className="flex gap-2">
              <Select
                onValueChange={(value) => {
                  setChosenCurrency(value as 'money' | 'ticket');
                }}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Выбрать..."></SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {options.map((it) => (
                    <SelectItem key={it.value} value={it.value}>
                      <div className="flex items-center gap-2">
                        {it.icon}
                        <ReText size="sm">{it.label}</ReText>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <FormField
                control={form.control}
                name="currencyCount"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormControl>
                      <Input
                        {...field}
                        value={String(field.value)}
                        type="number"
                        max={chosenCurrency ? maxValues[chosenCurrency] : 0}
                        className="col-span-2"
                        disabled={!chosenCurrency}
                        placeholder="Введите количество монет/тикетов"
                        onChange={handleInputChange(
                          field,
                          chosenCurrency ? maxValues[chosenCurrency] : 0
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <ReText className="mb-1" weight="bold">
              Получаете:
            </ReText>
            <Input
              startIcon={<Activity />}
              disabled
              placeholder="Сумма очков активности..."
              value={calculateActivityPoints(currencyCount) ?? undefined}
            />

            <FormSeparateMessage name="__error.notEnoughCurrency" />

            <Button
              disabled={!chosenCurrency || !currencyCount || !!errors.__error}
              className="mt-2"
              type="submit"
            >
              Обменять
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
