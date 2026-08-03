import type { MouseEvent, ReactNode } from 'react';
import { useCallback, useState } from 'react';

import Close from '@re/ui-kit/icons/close';
import { Badge } from '@re/ui-kit/ui/badge';
import { Button, type ButtonProps } from '@re/ui-kit/ui/button';
import { ReText } from '@re/ui-kit/ui/text';

import type { Type } from '~shared/api/models/forms';
import type { SearchField as SearchFieldEnum, SearchItem } from '~shared/api/models/search';

import type { Filters, Options } from './use-search-modal';
import { PaginationMode as SEARCH_MODAL_PAGINATION_MODE, useSearchModal } from './use-search-modal';

type SearchFieldOptions = Omit<Options, 'onClick'>;

const defaultOpts: SearchFieldOptions = {
  hits: false,
  history: false,
  paginationMode: SEARCH_MODAL_PAGINATION_MODE.LOAD_MORE,
};

interface SearchFieldProps<T, K> {
  onChange: (value: K, filters: Filters) => void;
  value: T;
  opts: SearchFieldOptions;
  children: ({
    value,
    onAction,
    remove,
  }: {
    value: T;
    onAction: () => void;
    remove: () => void;
  }) => ReactNode;
}

export const SearchField = <T, K = T>(props: SearchFieldProps<T, K>) => {
  const { value, onChange, opts, children } = props;
  const { open: openSearchModal } = useSearchModal();
  const remove = () => {
    // @ts-ignore
    onChange(null as T);
  };
  const onAction = () => {
    // @ts-ignore
    openSearchModal({
      ...defaultOpts,
      ...opts,
      onClick: (item: T, filters) => {
        onChange(item, filters);
      },
    });
  };

  return children({ value, onAction, remove });
};

export interface SingleSearchFieldProps extends Omit<ButtonProps, 'onChange' | 'defaultValue'> {
  defaultValue?: Type | null;
  onChange: (value: number | null) => void;
  placeholder: string;
  transformValue?: (item: SearchItem<SearchFieldEnum>) => Type;
  opts: SearchFieldOptions;
}

export const SingleSearchField = (props: SingleSearchFieldProps) => {
  const { placeholder, transformValue = defaultTransform, onChange, opts, defaultValue } = props;
  const [item, setItem] = useState<Type | null>(defaultValue ?? null);

  const { open: openSearchModal } = useSearchModal();

  const handleClear = useCallback(() => {
    setItem(null);
    onChange(null);
  }, []);

  const handleOpen = () => {
    // @ts-ignore
    openSearchModal({
      ...defaultOpts,
      ...opts,
      onClick: (value) => {
        onChange(value.id);
        setItem(transformValue(value));
      },
      paginationMode: SEARCH_MODAL_PAGINATION_MODE.LOAD_MORE,
    });
  };

  return item ? (
    <Button
      size="lg"
      className="group max-w-[400px] overflow-hidden"
      onClick={handleClear}
      endIcon={<Close className="text-muted-foreground group-hover:text-destructive" size={16} />}
    >
      <span className="block w-full truncate text-left">{item.name}</span>
    </Button>
  ) : (
    <Button variant="secondary" size="lg" onClick={handleOpen}>
      {placeholder}
    </Button>
  );
};

interface MultipleSearchFieldProps {
  defaultValue?: Type[];
  onChange: (value: string[]) => void;
  transformValue?: (item: SearchItem<SearchFieldEnum>) => Type;
  opts: SearchFieldOptions;
  placeholder?: ReactNode;
}

const defaultTransform = <T extends { id: string; name: string }>(item: T): Type => ({
  id: String(item.id),
  name: item.name,
});

export const MultipleSearchField = (props: MultipleSearchFieldProps) => {
  'use no memo';

  const {
    defaultValue,
    onChange,
    transformValue = defaultTransform,
    placeholder = 'Выбрать',
    opts,
  } = props;
  const [items, setItems] = useState<Type[]>(defaultValue ?? []);
  const { open: openSearchModal } = useSearchModal();

  const handleClear = (e: MouseEvent<SVGSVGElement>, id: string) => {
    e.stopPropagation();
    e.preventDefault();

    setItems((prev) => {
      const newItems = prev.filter((it) => String(it.id) !== id);
      onChange(newItems.map((it) => String(it.id)));
      return newItems;
    });
  };

  const handleAdd = (item: SearchItem<SearchFieldEnum.publishers>) => {
    setItems((items) => {
      if (items.find((it) => it.id == item.id)) return items;

      const newItems = [...items, transformValue(item)];
      onChange(newItems.map((it) => String(it.id)));

      return [...items, transformValue(item)];
    });
  };

  const handleOpen = () => {
    // @ts-ignore
    openSearchModal({
      ...defaultOpts,
      ...opts,
      onClick: handleAdd,
      paginationMode: SEARCH_MODAL_PAGINATION_MODE.LOAD_MORE,
    });
  };

  return (
    <div
      className="border-border flex h-10 cursor-pointer items-center gap-1 rounded-md border p-2"
      onClick={handleOpen}
    >
      {items.map((it) => (
        <Badge key={it.id} color="secondary" className="flex items-center gap-1">
          {it.name}
          <Close
            onClick={(e) => {
              handleClear(e, String(it.id));
            }}
            className="text-muted-foreground hover:text-destructive cursor-pointer"
            size={16}
          />
        </Badge>
      ))}
      {!items.length ? (
        <ReText color="muted-foreground" size="sm" className="px-3">
          {placeholder}
        </ReText>
      ) : null}
    </div>
  );
};
