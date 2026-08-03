import { useMemo } from 'react';

import { defineAbility } from '@casl/ability';

import { useCurrentPublisher } from '~entities/publisher/model/hooks';
import { Monetization } from '~shared/api/models/publisher';
import type { Ability } from '~shared/lib/ability-v2/Ability';
import { useSession } from '~shared/lib/session/use-session';

export type MoneyAbility = ['read' | 'create', 'withdraw' | 'contract'];
export const useMoneyAbility = () => {
  const is_staff = useSession((v) => v?.is_staff);
  const { data: publisher } = useCurrentPublisher();
  const { props: { can_sign_contract = false, can_withdraw_money = false } = {} } = publisher!;
  const { content: { monetization } = {} } = publisher!;
  const monetizationValueWhichCanWithdrawMoney =
    monetization === Monetization.ENABLED || monetization === Monetization.DECLINED;

  return useMemo(
    () =>
      defineAbility<Ability<MoneyAbility>>((can) => {
        if (is_staff) can(['read', 'create'], ['withdraw', 'contract']);
        if (can_withdraw_money && monetizationValueWhichCanWithdrawMoney)
          can(['read', 'create'], ['withdraw', 'contract']);
        if (can_sign_contract) can(['read', 'create'], 'contract');
      }),
    [is_staff, can_sign_contract, monetizationValueWhichCanWithdrawMoney, can_withdraw_money]
  );
};
