'use client';
import type { ButtonProps } from '@re/ui-kit/ui/button';

import { useMoneyAbility } from '~features/(publisher)/withdraw/model/ability';

import { PublisherBalance } from './fragments/publisher-balance';
import { PublisherRequestMonetization } from './fragments/publisher-request-monetization';

export const PublisherMonetizationButton = (props: ButtonProps) => {
  const ability = useMoneyAbility();
  const canRead = ability.can('read', 'withdraw');
  if (ability.can('read', 'withdraw')) return <PublisherBalance {...props} />;

  if (ability.can('read', 'contract')) return <PublisherRequestMonetization {...props} />;

  return null;
};
