'use client';

import type { SelectProps } from '@radix-ui/react-select';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@re/ui-kit/ui/select';
import { cn } from '@re/ui-kit/utils/cn';

import { useQueryPrimitiveParams } from '~shared/hooks/use-query-params';

export const RouterMenuSelect = (
  props: SelectProps & {
    className?: string;
    contentClassName?: string;
    fieldName: string;
    options: { value: string; label: string }[];
  }
) => {
  const { defaultValue, fieldName, contentClassName, className, options, onValueChange, ...other } =
    props;
  const { value, setValue } = useQueryPrimitiveParams({
    fieldName,
    // validatingOptions: options.flatMap((v) => v.value),
    defaultValue,
  });

  return (
    <Select
      onValueChange={(value) => {
        setValue(value);
        onValueChange?.(value);
      }}
      value={value || defaultValue}
      defaultValue={defaultValue}
      {...other}
    >
      <SelectTrigger
        defaultValue={defaultValue}
        tabIndex={0}
        className={cn('border-border z-50 h-8 w-[150px] border', className)}
        withIcon
      >
        <SelectValue defaultValue={defaultValue} placeholder="Сортировать по" />
      </SelectTrigger>
      <SelectContent className={cn('z-50', contentClassName)}>
        <SelectGroup className="z-50">
          {options.map(({ value, label }, index) => (
            <SelectItem key={index} className="z-50 mb-2" value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
