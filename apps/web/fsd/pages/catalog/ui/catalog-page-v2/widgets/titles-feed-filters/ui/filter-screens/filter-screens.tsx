'use client';

import { useDeferredValue, useMemo, useState } from 'react';

import ArrowLeftIcon from '@re/ui-kit/icons/arrow-left';
import { Button } from '@re/ui-kit/ui/button';
import { Checkbox } from '@re/ui-kit/ui/checkbox';
import { SearchBar } from '@re/ui-kit/ui/searchbar';

import { useUserBookmarksTypes } from '~entities/user/model/queries';
import { SelectOption } from '~shared/lib/filters/model/types';
import { useSession } from '~shared/lib/session/use-session';

import { useTitleFiltersField } from '../../../../features/title-filters/model/context';
import type { TitleFiltersSchema } from '../../../../features/title-filters/model/schema';
import { useFilterSliderStore } from '../../model/context';

export const FilterSelectContent = ({
  isMultiSelect,
  field,
  options: optionsProp,
}: {
  isMultiSelect: boolean;
  field: keyof TitleFiltersSchema;
  options?: SelectOption<any>[];
}) => {
  const { schema, value, onChange, onReset } = useTitleFiltersField(field);
  const [search, setSearch] = useState('');
  const { goBack } = useFilterSliderStore();

  const handleItemClick = (newValue: any) => {
    if (isMultiSelect) {
      if (value?.includes(newValue)) {
        onChange(value.filter((v: any) => v !== newValue));
      } else {
        onChange([...value, newValue]);
      }
    } else {
      if (value === newValue) {
        onChange(null);
      } else {
        onChange(newValue);
      }
    }
  };

  const handleReset = () => {
    onReset();
  };

  const options = optionsProp ?? schema.options;

  const filteredOptions = useMemo(() => {
    if (!search) return options;
    return options?.filter((option) => {
      const label = option.label?.toLowerCase();
      const searchValue = search.toLowerCase();
      return label?.includes(searchValue);
    });
  }, [options, search]);

  const deferredFilteredOptions = useDeferredValue(filteredOptions);

  return (
    <>
      <div className="flex items-center justify-start gap-2 pt-4">
        <Button
          variant="ghost"
          size="lg"
          onClick={() => goBack()}
          startIcon={<ArrowLeftIcon className="text-muted-foreground -ml-2" size={20} />}
        >
          {schema.label}
        </Button>
        <Button
          className="ml-auto"
          variant="flat"
          color="secondary"
          size="sm"
          onClick={handleReset}
        >
          Сбросить
        </Button>
      </div>
      {schema.options && schema.options.length > 10 && (
        <SearchBar
          value={search}
          onChange={(value) => setSearch(value)}
          placeholder={`Поиск по "${schema.label}"`}
        />
      )}
      <div className="flex flex-col gap-1 overflow-y-auto pt-2 pb-4">
        {deferredFilteredOptions?.map((option) => {
          const isActive = isMultiSelect ? value?.includes(option.value) : value === option.value;

          return (
            <Button
              asChild
              key={option.value}
              size="lg"
              variant={isActive ? 'flat' : 'ghost'}
              fullWidth
              className="w-full justify-start py-1.5"
              onClick={() => handleItemClick(option.value)}
              startIcon={<Checkbox checked={isActive} className="-ml-1.5" />}
            >
              <div>{option.label}</div>
            </Button>
          );
        })}
      </div>
    </>
  );
};

export const FilterBookmarksSelectScreen = ({ isExclude }: { isExclude?: boolean }) => {
  const session = useSession();
  const { data: bookmarks } = useUserBookmarksTypes(
    { variables: { params: { userId: session?.id! } } },
    { enabled: !!session?.id }
  );

  const options = useMemo(() => {
    if (!bookmarks) return [];
    return bookmarks.results.map((it) => ({ value: it.id, label: it.name }));
  }, [bookmarks]);

  return (
    <FilterSelectContent
      isMultiSelect
      field={isExclude ? 'exclude_bookmarks' : 'bookmarks'}
      options={options}
    />
  );
};
