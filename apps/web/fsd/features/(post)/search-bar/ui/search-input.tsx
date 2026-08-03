import type { ChangeEvent, ComponentProps } from 'react';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

import Close from '@re/ui-kit/icons/close';
import Search from '@re/ui-kit/icons/search';
import { cn } from '@re/ui-kit/utils/cn';

import { useSetHandleTopClickActions } from '~shared/lib/react/scroll-to-top';
import { Input } from '~shared/ui/input';
import { debounce } from '~shared/utils/debounce';

import { useQuery } from '../model/hooks/use-query';

export const SearchInput = forwardRef(
  (
    props: {
      onClose?: () => void;
      placeholder?: string;
    } & ComponentProps<'input'>,
    ref
  ) => {
    const { placeholder, onClose, className, style, ...other } = props;

    const inputRef = useRef<HTMLInputElement>();
    const [query, setQuery] = useQuery();
    const handleTopClick = useSetHandleTopClickActions((v) => v.handleTopClick);

    useImperativeHandle(
      ref,
      () => ({
        onHistoryClick: (value: string) => {
          if (inputRef.current) {
            inputRef.current.value = value;
            inputRef.current.setSelectionRange(value.length, value.length);
            inputRef.current.focus();
          }
          setQuery(value);
        },
      }),
      []
    );

    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.value = query;
      }
    }, [query]);

    const handleChange = debounce((event: ChangeEvent<HTMLInputElement>) => {
      if (event.target) {
        if (event.target.value !== query) {
          setQuery(event.target.value);
        }
      }
      handleTopClick?.();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      inputRef.current?.focus();
    }, 600);

    const handleClear = () => {
      if (inputRef.current) {
        inputRef.current.value = '';
      }
      onClose?.();
      setQuery('');
    };

    return (
      <Input
        {...other}
        ref={inputRef}
        startIcon={
          <Search
            className="hover:text-primary cursor-pointer"
            fontSize="default"
            onClick={() => {
              inputRef.current.focus();
            }}
          />
        }
        placeholder={placeholder ?? 'Что ищем, семпай?'}
        color="secondary"
        className={cn('rounded-full', className)}
        defaultValue={query}
        style={style}
        onChange={handleChange}
        endIcon={
          query ? (
            <Close
              fontSize="small"
              className={cn('cursor-pointer text-red-700 opacity-[0.8] hover:opacity-[1]')}
              onClick={handleClear}
            />
          ) : null
        }
      />
    );
  }
);
