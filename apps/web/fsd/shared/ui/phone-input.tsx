'use client';
import * as React from 'react';
import * as RPNInput from 'react-phone-number-input';
import flags from 'react-phone-number-input/flags';

import Check from '@re/ui-kit/icons/check';
import ChevronDown from '@re/ui-kit/icons/chevron-down';
import { Button } from '@re/ui-kit/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@re/ui-kit/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@re/ui-kit/ui/popover';
import { ScrollArea } from '@re/ui-kit/ui/scroll-area';
import { cn } from '@re/ui-kit/utils/cn';

import type { InputProps } from '~shared/ui/input';
import { Input } from '~shared/ui/input';

import 'react-phone-number-input/style.css';

type PhoneInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> &
  Omit<RPNInput.Props<typeof RPNInput.default>, 'onChange'> & {
    onChange?: (value: RPNInput.Value) => void;
  };

const PhoneInput: React.ForwardRefExoticComponent<PhoneInputProps> = ({
  ref,
  className,
  onChange,
  ...props
}: PhoneInputProps & {
  ref?: React.RefObject<React.ComponentRef<typeof RPNInput.default>>;
}) => (
  <RPNInput.default
    ref={ref}
    className={cn('flex', className)}
    flagComponent={FlagComponent}
    countrySelectComponent={CountrySelect}
    inputComponent={InputComponent}
    /**
     * Handles the onChange event.
     *
     * react-phone-number-input might trigger the onChange event as undefined
     * when a valid phone number is not entered. To prevent this,
     * the value is coerced to an empty string.
     *
     * @param {E164Number | undefined} value - The entered value
     */
    onChange={(value) => onChange?.(value || ('' as RPNInput.Value))}
    {...props}
  />
);
PhoneInput.displayName = 'PhoneInput';

const InputComponent = ({
  ref,
  className,
  ...props
}: InputProps & {
  ref?: React.RefObject<HTMLInputElement>;
}) => <Input className={cn('rounded-s-none rounded-e-lg', className)} {...props} ref={ref} />;
InputComponent.displayName = 'InputComponent';

interface CountrySelectOption {
  label: string;
  value: RPNInput.Country;
}

interface CountrySelectProps {
  disabled?: boolean;
  value: RPNInput.Country;
  onChange: (value: RPNInput.Country) => void;
  options: CountrySelectOption[];
}

const CountrySelect = ({ disabled, value, onChange, options }: CountrySelectProps) => {
  const handleSelect = React.useCallback(
    (country: RPNInput.Country) => {
      onChange(country);
    },
    [onChange]
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn('mx-1 flex gap-1 rounded-s-lg rounded-e-none px-3')}
          disabled={disabled}
        >
          <FlagComponent country={value} countryName={value} />
          <ChevronDown
            className={cn('-mr-2 h-4 w-4 opacity-50', disabled ? 'hidden' : 'opacity-100')}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandList>
            <ScrollArea className="h-72">
              <CommandInput placeholder="Search country..." />
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandGroup>
                {options
                  .filter((x) => x.value)
                  .map((option) => (
                    <CommandItem
                      className="gap-2"
                      key={option.value}
                      onSelect={() => {
                        handleSelect(option.value);
                      }}
                    >
                      <FlagComponent country={option.value} countryName={option.label} />
                      <span className="flex-1 text-sm">{option.label}</span>
                      {option.value && (
                        <span className="text-foreground/50 text-sm">{`+${RPNInput.getCountryCallingCode(option.value)}`}</span>
                      )}
                      <Check
                        className={cn(
                          'ml-auto h-4 w-4',
                          option.value === value ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                    </CommandItem>
                  ))}
              </CommandGroup>
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

const FlagComponent = ({ country, countryName }: RPNInput.FlagProps) => {
  const Flag = flags[country];

  return (
    <span className="bg-foreground/20 flex h-4 w-6 overflow-hidden rounded-xs">
      {Flag && <Flag title={countryName} />}
    </span>
  );
};
FlagComponent.displayName = 'FlagComponent';

export { PhoneInput };
