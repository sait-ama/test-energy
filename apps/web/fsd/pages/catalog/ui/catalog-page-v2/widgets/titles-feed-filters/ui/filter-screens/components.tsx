'use client';

import { PropsWithChildren } from 'react';

import ChevronRightIcon from '@re/ui-kit/icons/chevron-right';
import TrashIcon from '@re/ui-kit/icons/trash';
import { Button, ButtonProps } from '@re/ui-kit/ui/button';
import { cn } from '@re/ui-kit/utils/cn';

import { CatalogTitleOrderingSchema } from '~shared/api/models/title';
import { AnyFilterType, BaseFilterTypes } from '~shared/lib/filters/model/types';

import { useCountActiveFilters } from '../../../../features/title-filters/hooks/use-count-active-filters';
import {
  useTitleFiltersField,
  useTitleFiltersStore,
} from '../../../../features/title-filters/model/context';
import type { TitleFiltersSchema } from '../../../../features/title-filters/model/schema';
import { type Screen, useFilterSliderStore } from '../../model/context';

export const FilterSlider = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn('flex max-h-full flex-col gap-3 px-4 xl:pr-0', className)}>{children}</div>
  );
};

function getFilterValue(value: any, schema: AnyFilterType) {
  if (schema.type === BaseFilterTypes.INPUT) {
    return value;
  }
  if (schema.type === BaseFilterTypes.SELECT) {
    return schema.options?.find((v) => v.value === value)?.label;
  }
  if (schema.type === BaseFilterTypes.MULTISELECT) {
    return value?.length < 2
      ? value.map((v: any) => schema.options?.find((o) => o.value === v)?.label).join(', ')
      : `Выбрано ${value.length}`;
  }
  if (schema.type === BaseFilterTypes.RANGE) {
    const { min, max } = value || {};
    if (min && max) return `${min} - ${max}`;
    if (min) return `от ${min}`;
    if (max) return `до ${max}`;
    return '';
  }
  return value;
}

export const FilterSliderItemUI = ({
  screen,
  children,
  className,
}: PropsWithChildren<{
  screen: Screen;
  children: React.ReactNode;
  className?: string;
}>) => {
  const { setScreen } = useFilterSliderStore();

  return (
    <Button
      size="lg"
      variant="secondary"
      fullWidth
      className={cn('w-full justify-between', className)}
      onClick={() => setScreen(screen)}
    >
      {children}
      <ChevronRightIcon />
    </Button>
  );
};

export const FilterSliderItem = ({
  field,
  className,
}: {
  className?: string;
  field: keyof TitleFiltersSchema;
}) => {
  const { schema, value } = useTitleFiltersField(field);

  return (
    <FilterSliderItemUI screen={schema.name as Screen} className={className}>
      <span>
        {schema.label}{' '}
        <span className="text-primary ml-1 text-xs font-normal">
          {getFilterValue(value, schema)}
        </span>
      </span>
    </FilterSliderItemUI>
  );
};

export const ResetFiltersButton = (props: ButtonProps) => {
  const resetFilters = useTitleFiltersStore((v) => v.resetAllFilters);
  const { value } = useTitleFiltersField('ordering');
  const countActiveFilters = useCountActiveFilters();
  const isDisabled = countActiveFilters === 0 && value === CatalogTitleOrderingSchema.SCORE_DESC;

  return (
    <Button
      variant="flat"
      color="secondary"
      size="sm"
      {...props}
      onClick={resetFilters}
      disabled={isDisabled}
      endIcon={<TrashIcon className="size-3" />}
    >
      Сбросить фильтры
    </Button>
  );
};
