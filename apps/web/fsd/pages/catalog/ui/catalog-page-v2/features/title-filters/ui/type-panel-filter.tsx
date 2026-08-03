'use client';
import { Button } from '@re/ui-kit/ui/button';
import { ScrollArea, ScrollBar } from '@re/ui-kit/ui/scroll-area';
import { cn } from '@re/ui-kit/utils/cn';

import { SelectOption } from '~shared/lib/filters/model/types';

import { useTitleFiltersField } from '../model/context';

const TypePanelFilterItem = (props: { option: SelectOption<NumberIsomorphic> }) => {
  const { option } = props;
  const { value, onChange: onChangeTypes } = useTitleFiltersField('types');
  const { value: excludeTypes, onChange: onChangeExcludeTypes } =
    useTitleFiltersField('exclude_types');

  const isActive = value.includes(option.value);
  const isExcluded = excludeTypes.includes(option.value);

  const handleChange = () => {
    if (isActive) {
      onChangeTypes(value.filter((v: number) => v !== option.value));
    } else {
      onChangeTypes([...value, option.value]);
    }
  };

  const handleExclude = () => {
    if (isExcluded) {
      onChangeExcludeTypes(excludeTypes.filter((v: number) => v !== option.value));
    } else {
      onChangeExcludeTypes([...excludeTypes, option.value]);
    }
  };

  const handleClick = () => {
    if (isExcluded) {
      handleExclude();
    } else if (isActive) {
      handleChange();
      handleExclude();
    } else {
      handleChange();
    }
  };

  const className = cn(
    'bg-secondary text-foreground h-9 opacity-100!',
    isActive &&
      'border-foreground/20 bg-foreground text-background hover:bg-foreground/90 hover:text-background',
    !isActive && 'border border-transparent',
    isExcluded && 'border-destructive bg-destructive/10 text-destructive'
  );

  return (
    <Button
      onClick={handleClick}
      key={option.value}
      variant={isActive ? 'outline' : 'ghost'}
      className={className}
    >
      {option.label}
    </Button>
  );
};

export const TypePanelFilter = (props: { className?: string }) => {
  const { className } = props;
  const { schema } = useTitleFiltersField('types');

  return (
    <ScrollArea className={className}>
      <div className="flex items-center gap-2 rounded-md">
        {schema.options?.map((option) => (
          <TypePanelFilterItem key={option.value} option={option} />
        ))}
      </div>
      <ScrollBar orientation="horizontal" hidden />
    </ScrollArea>
  );
};
