'use client';
import type { ComponentProps } from 'react';
import { useRef } from 'react';

import { SearchInput } from '../search-input';

export const SearchPost = (props: ComponentProps<'input'>) => {
  const ref = useRef();

  return <SearchInput {...props} placeholder="Поиск постов" ref={ref} />;
};
