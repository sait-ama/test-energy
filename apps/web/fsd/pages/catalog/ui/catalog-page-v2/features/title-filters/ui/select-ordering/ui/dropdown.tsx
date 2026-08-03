import { Button } from '@re/ui-kit/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@re/ui-kit/ui/select';
import { cn } from '@re/ui-kit/utils/cn';

import { id2NameMap } from '~features/select-catalog-ordering/model/const';

import { SelectCatalogOrderingSharedProps } from '../model/types';

export const SelectCatalogOrderingDropdown = (props: SelectCatalogOrderingSharedProps) => {
  const { className, renderButton, value, onValueChange, isReversed, onReversedChange } = props;

  return (
    <div className={cn('flex items-center', className)}>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger asChild data-testid="catalog-ordering-value" withIcon={false}>
          {renderButton(<SelectValue />)}
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {Object.entries(id2NameMap).map(([id, name]) => (
              <SelectItem value={id} key={id} data-testid="catalog-ordering-option">
                {name}
              </SelectItem>
            ))}
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup className="px-2 py-2">
            <SelectLabel className="">Сортировать</SelectLabel>
            <Button
              size="sm"
              fullWidth
              variant="link"
              className="justify-start"
              color={isReversed ? 'default' : 'secondary'}
              onClick={() => onReversedChange(true)}
            >
              По убыванию
            </Button>
            <Button
              size="sm"
              fullWidth
              className="justify-start"
              variant="link"
              color={isReversed ? 'secondary' : 'default'}
              onClick={() => onReversedChange(false)}
            >
              По возрастанию
            </Button>
          </SelectGroup>
        </SelectContent>
      </Select>
      {/* <Button
        // size="lg"
        circle
        // variant="ghost"
        variant="ghost"
        // className="bg-input ml-1"
        className="bg-input ml-1"
        onClick={() => {
          const newIsReversed = !isReversed;
          onValueChange(value ? (newIsReversed ? `-${value}` : value) : '');
          onReversedChange(newIsReversed);
        }}
      >
        <Ordering className="transition-all data-[state=reverse]:rotate-180" size={16} />
      </Button> */}
    </div>
  );
};
