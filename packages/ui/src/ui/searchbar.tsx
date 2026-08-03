import CloseIcon from '@re/ui-kit/icons/close';

import { cn } from '../utils/cn';

import Search from './../icons/search';
import { Button } from './button';
import { Input, InputProps } from './input';

export type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
} & Omit<InputProps, 'onChange'>;

export const SearchBar = ({ value, onChange, className, onClear, ...rest }: SearchBarProps) => {
  const handleClear = onClear ?? (() => onChange(''));

  return (
    <Input
      type="text"
      data-testid="title-filters-search"
      startIcon={<Search className="text-muted-foreground size-5 min-w-5" />}
      endIcon={
        value && (
          <Button variant="ghost" size="sm" circle onClick={handleClear}>
            <CloseIcon className="text-muted-foreground" size={20} />
          </Button>
        )
      }
      className={cn('border-0 pr-3', className)}
      {...rest}
      onChange={(e) => onChange(e.target.value)}
      value={value}
    />
  );
};
