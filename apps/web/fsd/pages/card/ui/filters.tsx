import { useFormContext } from 'react-hook-form';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@re/ui-kit/ui/select';

import { type SearchField as SearchFieldEnum, SearchItem } from '~shared/api/models/search';
import { MultipleSearchField } from '~shared/lib/search/search-field';
import { FormControl, FormField, FormItem, FormLabel } from '~shared/ui/form';
import { Input } from '~shared/ui/input';

import { useCardCatalogOptions } from '../model/context';
import type { FilterSchema } from '../model/type';

export const RangeFilter = (props: { filter: FilterSchema }) => {
  const { filter } = props;
  const { control } = useFormContext();

  const gte = `${filter.field}_gte`;
  const lte = `${filter.field}_lte`;

  return (
    <div className="flex flex-col">
      <FormLabel className="ml-1 font-semibold">{filter.name}</FormLabel>

      <div className="flex gap-2">
        <FormField
          control={control}
          name={gte}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input {...field} placeholder="От" />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={lte}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input {...field} placeholder="До" />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export const SearchSelectFilter = <T extends SearchItem<SearchFieldEnum>>({
  filter,
}: {
  filter: FilterSchema<T>;
}) => {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={filter.field}
      render={({ field }) => (
        <FormItem className="w-full">
          <FormLabel className="ml-1 text-sm font-semibold">{filter.name}</FormLabel>
          <FormControl>
            <MultipleSearchField
              placeholder="Выбрать"
              onChange={(v) => {
                field.onChange(Array.isArray(v) ? v.map(Number) : v);
              }}
              transformValue={filter.transform}
              opts={{
                fields: [filter.searchField!],
              }}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export const SearchMultiSelectFilter = ({ filter }: { filter: FilterSchema }) => {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={filter.field}
      render={({ field }) => (
        <FormItem className="w-full">
          <FormLabel className="ml-1 text-sm font-semibold">{filter.name}</FormLabel>
          <FormControl>
            <MultipleSearchField
              placeholder="Выбрать"
              onChange={(v) => {
                field.onChange(Array.isArray(v) ? v.map(Number) : v);
              }}
              transformValue={filter.transform}
              opts={{
                fields: [filter.searchField!],
              }}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export const SelectDesktopFilterType = (props: { filter: FilterSchema }) => {
  const { filter } = props;
  const { control } = useFormContext();

  const options = useCardCatalogOptions()[filter.key];

  return (
    <FormField
      control={control}
      name={filter.field}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="ml-1 text-sm font-semibold">{filter.name}</FormLabel>
          <FormControl>
            <Select onValueChange={field.onChange} value={field.value ?? null}>
              <SelectTrigger>
                <SelectValue placeholder="Выбрать" />
              </SelectTrigger>

              <SelectContent>
                <SelectGroup>
                  {options?.map(({ id, name }) => (
                    <SelectItem key={id} value={id ? String(id) : null}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </FormControl>
        </FormItem>
      )}
    />
  );
};
