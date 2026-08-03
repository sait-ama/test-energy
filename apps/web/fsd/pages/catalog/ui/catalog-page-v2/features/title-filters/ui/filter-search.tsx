'use client';
import { useEffect, useMemo, useState } from 'react';

import { SearchBar } from '@re/ui-kit/ui/searchbar';
import { cn } from '@re/ui-kit/utils/cn';

import { InputProps } from '~shared/ui/input';
import { debounce } from '~shared/utils/debounce';

import { useTitleFiltersField } from '../model/context';

export const TitleSearchFilter = (props: InputProps) => {
  const { className, ...rest } = props;
  const { value, onChange } = useTitleFiltersField('search');
  const [inputValue, setInputValue] = useState(value);

  const debouncedOnChange = useMemo(
    () =>
      debounce((v: string) => {
        onChange(v);
      }, 600),
    []
  );

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleChange = (value: string) => {
    setInputValue(value);
    debouncedOnChange(value);
  };

  const handleClear = () => {
    setInputValue('');
    onChange('');
  };

  return (
    <SearchBar
      data-testid="title-filters-search"
      placeholder="Поиск по названию"
      {...rest}
      value={inputValue}
      onChange={handleChange}
      className={cn('border-0 pr-3', className)}
      onClear={handleClear}
    />
  );
};
