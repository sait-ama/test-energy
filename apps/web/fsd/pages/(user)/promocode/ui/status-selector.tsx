import { useTranslations } from 'next-intl';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@re/ui-kit/ui/select';

import { useTicketsListQueryStore } from '~pages/(user)/promocode/model/store';
import { TestProps } from '~shared/lib/test/utils/test-props';

const options = [1, 2, 3] as const;

export const StatusSelector = () => {
  const t = useTranslations('promo-codes.filters.status');
  const { query } = useTicketsListQueryStore();
  const { setQuery: handleSetQuery } = useTicketsListQueryStore();
  const handleSetStatus = (status: `${NonNullable<(typeof query)['status']>}` | 'all') => {
    handleSetQuery({ status: status === 'all' ? null : (Number(status) as 1 | 2 | 3) });
  };
  const finalStatus = query.status ?? 'all';
  return (
    <Select onValueChange={handleSetStatus} value={`${finalStatus}`}>
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
