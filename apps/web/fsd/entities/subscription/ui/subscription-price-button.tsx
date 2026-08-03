'use client';

import React from 'react';

import Card from '@re/ui-kit/icons/card';
import Coin from '@re/ui-kit/icons/coin';
import type { ButtonProps } from '@re/ui-kit/ui/button';
import { Button } from '@re/ui-kit/ui/button';
import { ReText } from '@re/ui-kit/ui/text';

import { useSubscriptionQuery } from '~entities/subscription/model/api/queries';
import { PaymentTypes } from '~shared/api/models/subscription';

interface SubscriptionPriceButtonProps extends ButtonProps {
  paymentType: PaymentTypes;
}

const paymentTypeIconMap = {
  [PaymentTypes.coins]: Coin,
  [PaymentTypes.card]: Card,
};

export const SubscriptionPriceButton = ({ paymentType, ...rest }: SubscriptionPriceButtonProps) => {
  const { data = {} } = useSubscriptionQuery();
  const { price, discount, default_price } = data;

  const Icon = paymentTypeIconMap[paymentType];

  return (
    <div className="flex flex-col items-center justify-start gap-1">
      <Button type="submit" size="xl" {...rest}>
        <div className="flex flex-row items-center gap-1">
          <ReText color="secondary-foreground" className="mr-1">
            {paymentType === 'coins' ? 'Монетами' : 'Картой'}
          </ReText>
          <Icon width={20} height={20} />
          <ReText color="secondary-foreground" className={discount ? 'line-through' : ''}>
            {default_price}
          </ReText>
          {discount ? <ReText>{price}</ReText> : null}
        </div>
      </Button>
    </div>
  );
};
