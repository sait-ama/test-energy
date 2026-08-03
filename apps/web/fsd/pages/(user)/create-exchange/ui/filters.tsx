import { ComponentPropsWithoutRef } from 'react';

import { Input } from '~shared/ui/input';

import { useExchangesStore } from '../model/store';

export interface ExchangeMessageProps extends ComponentPropsWithoutRef<typeof Input> {}

export const ExchangeMessage = (props: ExchangeMessageProps) => {
  const exchangesStore = useExchangesStore();

  return (
    <Input
      {...props}
      placeholder="Сообщение получателю"
      type="text"
      value={exchangesStore.message}
      onChange={(e) => exchangesStore.setMessage(e.target.value)}
    />
  );
};
