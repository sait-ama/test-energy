import type { ReactNode } from 'react';
import { useFormContext } from 'react-hook-form';

import dayjs from 'dayjs';

import Close from '@re/ui-kit/icons/close';
import { Button } from '@re/ui-kit/ui/button';
import { ScrollArea, ScrollBar } from '@re/ui-kit/ui/scroll-area';
import { ReText } from '@re/ui-kit/ui/text';

import { useSiteConfig } from '~app/providers/site-config-provider';
import type { FilterSchema } from '~features/title-filters/model/const';
import { filters } from '~features/title-filters/model/const';
import { useCatalogOptions } from '~features/title-filters/model/context';
import { SiteConfig } from '~shared/config/constants';
import { NArray } from '~shared/utils/NArray';

const OneFieldActiveIndicator = (props: { filter: FilterSchema }) => {
  'use no memo';

  const { filter } = props;
  const { watch, resetField } = useFormContext();

  const values = watch(filter.field) ?? [];

  const options = useCatalogOptions()[filter.key];
  const labelByIdMap = NArray.newBy(options).recordBy(
    (it) => it.id,
    (it) => it.name
  );

  if (!values.length) return null;

  const handleClear = () => {
    resetField(filter.field);
  };

  return (
    <Button color="secondary" data-testid="catalog-active-filter-container">
      {filter.name}:&nbsp;
      <ReText color="primary" size="sm">
        {values.length > 2
          ? `${values.length} знач.`
          : values.map((it) => labelByIdMap[it]).join(', ')}
      </ReText>
      <Close
        size={16}
        className="text-secondary-foreground hover:text-destructive ml-1.5 transition-all"
        onClick={handleClear}
        data-testid="catalog-active-filter-delete"
      />
    </Button>
  );
};

interface TransformFieldValueOptions {
  filter: FilterSchema;
  value: string;
}
const transformFieldValue = (options: TransformFieldValueOptions, siteConfig: SiteConfig) => {
  const dateFormat = siteConfig?.localization.dateFormat;
  const serverDateFormat = siteConfig?.localization.serverDateFormat;

  const { filter, value } = options;
  if (filter.type === 'date-slider') {
    return dayjs(value, serverDateFormat).format(dateFormat).toString();
  }

  return value;
};

const SliderFieldActiveIndicator = (props: { filter: FilterSchema }) => {
  'use no memo';

  const { filter } = props;
  const { watch, resetField } = useFormContext();
  const siteConfig = useSiteConfig();

  const gte = `${filter.field}_gte`;
  const lte = `${filter.field}_lte`;

  const lteValue = watch(lte);
  const gteValue = watch(gte);

  if (!lteValue && !gteValue) return null;

  const handleClear = () => {
    resetField(gte);
    resetField(lte);
  };

  return (
    <Button color="secondary" data-testid="catalog-active-filter-container">
      {filter.name}:&nbsp;
      {gteValue ? (
        <ReText color="primary" size="sm">
          {transformFieldValue({ filter, value: gteValue }, siteConfig)}
        </ReText>
      ) : null}
      {lteValue && gteValue && (
        <ReText color="primary" size="sm">
          &nbsp;—&nbsp;
        </ReText>
      )}
      {lteValue ? (
        <ReText color="primary" size="sm">
          {transformFieldValue({ filter, value: lteValue }, siteConfig)}
        </ReText>
      ) : null}
      <Close
        size={16}
        className="text-secondary-foreground hover:text-destructive ml-1.5 transition-all"
        onClick={handleClear}
        data-testid="catalog-active-filter-delete"
      />
    </Button>
  );
};

const TextFieldActiveIndicator = (props: { filter: FilterSchema }) => {
  'use no memo';

  const { filter } = props;
  const { watch, resetField } = useFormContext();

  const value = watch(filter.field) ?? '';

  if (!value) return null;

  const handleClear = () => {
    resetField(filter.field);
  };

  return (
    <Button color="secondary" data-testid="catalog-active-filter-container">
      {filter.name}:&nbsp;
      <ReText color="primary" size="sm">
        {value.slice(0, 20)}
      </ReText>
      <Close
        size={16}
        className="text-secondary-foreground hover:text-destructive ml-1.5 transition-all"
        onClick={handleClear}
        data-testid="catalog-active-filter-delete"
      />
    </Button>
  );
};

interface ActiveFiltersProps {
  action?: ReactNode;
}

export const ActiveFilters = (props: ActiveFiltersProps) => {
  const { action } = props;

  return (
    <ScrollArea>
      <div className="flex items-center gap-2" data-testid="catalog-active-filters-container">
        <TextFieldActiveIndicator filter={{ name: 'Поиск', field: 'search' } as FilterSchema} />
        {filters.map((it) =>
          ['select', 'checkbox', 'radio'].includes(it.type) ? (
            <OneFieldActiveIndicator key={it.name} filter={it} />
          ) : ['date-slider', 'slider'].includes(it.type) ? (
            <SliderFieldActiveIndicator key={it.name} filter={it} />
          ) : (
            <div>1</div>
          )
        )}
        {action}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};
