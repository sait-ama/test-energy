import { useTranslations } from 'next-intl';

import Ordering from '@re/ui-kit/icons/ordering';
import { Button } from '@re/ui-kit/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@re/ui-kit/ui/select';
import { cn } from '@re/ui-kit/utils/cn';

import { TestProps } from '~shared/lib/test/utils/test-props';

import { OrderField, useTicketsListQueryStore } from '../model/store';

const orderingOptions: OrderField[] = ['date', 'sum', 'sum_left', 'date_expire'];

export const OrderingSelector = ({ className }: { className?: string }) => {
  const t = useTranslations('promo-codes');

  const { setOrdering, getOrderField, getOrderDirection } = useTicketsListQueryStore();

  const field = getOrderField();
  const direction = getOrderDirection();

  const handleFieldChange = (newField: OrderField) => {
    setOrdering(newField, direction);
  };

  const handleDirectionToggle = () => {
    setOrdering(field, direction === 'desc' ? 'asc' : 'desc');
  };

  return (
    <Select<OrderField> onValueChange={handleFieldChange} value={field} defaultValue="date">
      <div className="flex items-center gap-2">
        <Button onClick={handleDirectionToggle} circle variant="secondary">
          <Ordering
            className="transition-all data-[state=reverse]:rotate-180"
            data-state={direction === 'desc' ? 'default' : 'reverse'}
            size={16}
            {...TestProps.id(`user-promo-code-list-ordering-asc-button`)}
          />
        </Button>
        <SelectTrigger
          tabIndex={0}
          className={cn('border-border z-50 h-10 w-fit border', className)}
          withIcon
          {...TestProps.id(`user-promo-code-list-ordering-button`)}
        >
          <SelectValue placeholder={t('orderings.placeholder')}>
            {t(`orderings.${field}`)}
          </SelectValue>
        </SelectTrigger>
      </div>

      <SelectContent className={cn('z-50')}>
        <SelectGroup className="z-50">
          {orderingOptions.map((value, index) => (
            <SelectItem
              {...TestProps.id(`user-promo-code-list-ordering-item-${value}`)}
              key={index}
              className="z-50 mb-2"
              value={value}
            >
              {t(`orderings.${value}`)}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
