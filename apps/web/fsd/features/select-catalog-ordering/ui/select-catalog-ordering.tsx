import { useFormContext } from 'react-hook-form';

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

import { id2NameMap } from '~features/select-catalog-ordering/model/const';
import { FormControl, FormField } from '~shared/ui/form';

export const SelectCatalogOrdering = () => {
  const { control } = useFormContext();

  return (
    <div className="flex">
      <FormField
        control={control}
        name="ordering"
        render={({ field }) => (
          <FormControl>
            <Select
              value={field.value?.replace('-', '')}
              onValueChange={(value) => {
                field.onChange(field.value?.startsWith('-') ? `-${value}` : value);
              }}
            >
              <Button
                asChild
                variant="outline"
                className="bg-input justify-between overflow-ellipsis"
              >
                <SelectTrigger
                  className="h-full w-48 rounded-r-none border-r-0 outline-none focus:ring-0 focus:ring-offset-0"
                  data-testid="catalog-ordering-value"
                >
                  <SelectValue className="line-clamp-1" />
                </SelectTrigger>
              </Button>
              <SelectContent>
                <SelectGroup>
                  {Object.entries(id2NameMap).map(([id, name]) => (
                    <SelectItem value={id} key={id} data-testid="catalog-ordering-option">
                      {name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </FormControl>
        )}
      />
      <FormField
        control={control}
        name="ordering"
        render={({ field }) => (
          <Button
            size="lg"
            circle
            variant="outline"
            className="bg-input rounded-l-none pr-0.5"
            onClick={() => {
              field.onChange(
                field.value?.startsWith('-') ? field.value.slice(1) : `-${field.value}`
              );
            }}
          >
            <Ordering
              className="transition-all data-[state=reverse]:rotate-180"
              data-state={field.value?.startsWith('-') ? 'default' : 'reverse'}
              size={16}
            />
          </Button>
        )}
      />
    </div>
  );
};
