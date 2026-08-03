import { memo, RefObject } from 'react';

import { cn } from '@re/ui-kit/utils/cn';

import { useChannelSearchContext } from '../../../context/channel-search-context';
import { SearchInput } from '../../ui/search-input';

type OwnProps = {
  className?: string;
  inputRef?: RefObject<HTMLInputElement>;
};

const ChannelSearchInput = memo((props: OwnProps) => {
  const { className } = props;

  const { searchQuery, setSearchQuery, isSearchOpen, setIsSearchOpen, clearSearch, inputRef } =
    useChannelSearchContext();

  // Handle search input changes
  const handleChange = (value: string) => {
    setSearchQuery(value);
  };

  // Handle focus/blur events
  const handleFocus = () => {
    setIsSearchOpen(true);
  };

  const handleBlur = () => {};

  // Handle reset button click
  const handleReset = () => {
    clearSearch();
  };

  // Handle reset button click
  const handleBack = () => {
    setIsSearchOpen(false);
    clearSearch();
  };

  return (
    <SearchInput
      ref={inputRef}
      placeholder="Поиск"
      className={cn('h-[40px] py-0', className)}
      value={searchQuery}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onBack={handleBack}
      onReset={handleReset}
      canClose={searchQuery.length > 2}
      withBackIcon={isSearchOpen}
    />
  );
});

ChannelSearchInput.displayName = 'ChannelSearchInput';

export { ChannelSearchInput };
