'use client';

import { PropsWithChildren } from 'react';
import dynamic from 'next/dynamic';

import { useIsTablet } from '@re/ui-kit/hooks/use-tablet';

import { FiltersToggleButton } from './filters-toggle-button';

const TitlesFeedSidebarFiltersAsync = dynamic(
  () => import('./sidebar').then((mod) => mod.TitlesFeedSidebarFilters),
  {
    ssr: false,
  }
);

const TitlesFeedDialogFiltersAsync = dynamic(
  () => import('./dialog').then((mod) => mod.TitlesFeedDialogFilters),
  {
    ssr: false,
  }
);

export const TitlesFeedFiltersToggle = FiltersToggleButton;

export const TitlesFeedDialogFilters = (props: PropsWithChildren) => {
  return <TitlesFeedDialogFiltersAsync {...props} />;
};

export const TitlesFeedSidebarFilters = (props: PropsWithChildren) => {
  return <TitlesFeedSidebarFiltersAsync {...props} />;
};

export const TitlesFeedResponisveFilters = (props: PropsWithChildren) => {
  const isTablet = useIsTablet();

  if (isTablet) {
    return <TitlesFeedDialogFilters {...props} />;
  }

  return <TitlesFeedSidebarFilters {...props} />;
};
