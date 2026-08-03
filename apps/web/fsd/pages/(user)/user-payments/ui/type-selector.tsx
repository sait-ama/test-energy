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

import { usePaymentsCoinsListQueryStore } from '~pages/(user)/user-payments/model/store';
import { FormsTypes } from '~shared/api/models/forms';
import { TestProps } from '~shared/lib/test/utils/test-props';
import { getTypesBaseKey } from '~shared/lib/use-types-base';

export const TypeSelector = () => {
  const t = useTranslations('promo-codes.filters.action-type');
  const { data: { content: { type: options = [] } = {} } = {} } = useQuery({
    ...getTypesBaseKey({
      type: FormsTypes.MONEY_PAYMENTS,
      get: ['type', 'status'],
    }),
  });
  const {
    setQuery: handleSetQuery,
    query: { type: currentType },
  } = usePaymentsCoinsListQueryStore();
  const handleSetType = (value: string) => {
    handleSetQuery({ type: value === 'all' ? null : Number(value) });
  };

  const selectedValue = String(currentType ?? 'all');
  const disabled = !options.length;
  return (
    <Select disabled={disabled} onValueChange={handleSetType} value={selectedValue}>
      <SelectTrigger
        {...TestProps.id(`user-promo-code-list-action-type-trigger`)}
        className="w-fit"
      >
        <SelectValue placeholder={t('placeholder')} />
      </SelectTrigger>

      <SelectContent>
        <SelectGroup>
          <SelectItem key="all" value="all">
            {t('all')}
          </SelectItem>

          {options?.map((option) => (
            <SelectItem
              disabled={disabled}
              {...TestProps.id(`user-promo-code-list-ordering-item-${option.id}`)}
              key={option.id}
              value={option.id.toString()}
            >
              {option.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
