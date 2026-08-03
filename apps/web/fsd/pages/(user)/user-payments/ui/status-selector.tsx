import { useTranslations } from 'next-intl';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@re/ui-kit/ui/select';
import { useQuery } from '@tanstack/react-query';

import {
  type Query,
  usePaymentsCoinsListQueryStore,
} from '~pages/(user)/user-payments/model/store';
import { FormsTypes } from '~shared/api/models/forms';
import { TestProps } from '~shared/lib/test/utils/test-props';
import { getTypesBaseKey } from '~shared/lib/use-types-base';

type Status = NonNullable<Query['status']>;

export const StatusSelector = () => {
  const { data: options = [] } = useQuery({
    ...getTypesBaseKey({
      type: FormsTypes.MONEY_PAYMENTS,
      get: ['type', 'status'],
    }),
    select: (v) => {
      return v?.content?.status?.map?.((v) => Number(v.id) as Status);
    },
  });
  const t = useTranslations('user-coins-history.filters.status');
  const status = usePaymentsCoinsListQueryStore((v) => v.query.status);
  const setQuery = usePaymentsCoinsListQueryStore((v) => v.setQuery);
  const handleSetStatus = (status: `${Status}` | 'all') => {
    setQuery({ status: status === 'all' ? null : (Number(status) as Status) });
  };
  return (
    <Select onValueChange={handleSetStatus} value={`${status ?? 'all'}`}>
      <SelectTrigger
        {...TestProps.id(`user-promo-code-list-status-type-trigger`)}
        className="w-fit"
      >
        <SelectValue placeholder="Типы" />
      </SelectTrigger>

      <SelectContent>
        <SelectGroup>
          <SelectItem key="all" value="all">
            {t('all')}
          </SelectItem>

          {options?.map((option) => (
            <SelectItem
              key={option}
              value={String(option)}
              {...TestProps.id(`user-promo-code-list-status-type-item-${option}`)}
            >
              {t(`${option}`)}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
