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

import { useTicketsListQueryStore } from '~pages/(user)/promocode/model/store';
import { FormsTypes } from '~shared/api/models/forms';
import { TestProps } from '~shared/lib/test/utils/test-props';
import { getTypesBaseKey } from '~shared/lib/use-types-base';

export const ActionTypeSelector = () => {
  const t = useTranslations('promo-codes.filters.action-type');
  const { data: { content: { action_type: options = [] } = {} } = {} } = useQuery({
    ...getTypesBaseKey({
      type: FormsTypes.TICKETS_PAYMENTS,
      get: ['action_type'],
    }),
  });

  const {
    setQuery: handleSetQuery,
    query: { action_type: currentActionType },
  } = useTicketsListQueryStore();

  const handleSetActionType = (value: string) => {
    handleSetQuery({ action_type: value === 'all' ? null : Number(value) });
  };

  const selectValue = currentActionType ? currentActionType.toString() : 'all';

  return (
    <Select onValueChange={handleSetActionType} value={selectValue}>
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
