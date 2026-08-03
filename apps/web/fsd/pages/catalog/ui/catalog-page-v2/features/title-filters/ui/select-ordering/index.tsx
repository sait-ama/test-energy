'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';

import { useIsMobile } from '@re/ui-kit/hooks/use-mobile';

import { id2NameMap } from '~features/select-catalog-ordering/model/const';

import { useTitleFiltersField } from '../../model/context';
import { SelectOrderingFilterButton } from './ui/button';

const SelectCatalogOrderingDropdown = dynamic(
  () => import('./ui/dropdown').then((mod) => mod.SelectCatalogOrderingDropdown),
  {
    ssr: false,
    loading: () => <SelectOrderingFilterButton />,
  }
);

const SelectOrderingFilterBottomSheet = dynamic(
  () => import('./ui/bottom-sheet').then((mod) => mod.SelectOrderingFilterBottomSheet),
  {
    ssr: false,
    loading: () => <SelectOrderingFilterButton />,
  }
);

const FIELD_NAME = 'ordering';

export const SelectOrderingFilter = (props: { className?: string }) => {
  const isMobile = useIsMobile();

  const { className } = props;
  const { value, onChange } = useTitleFiltersField(FIELD_NAME);
  const [isReversed, setIsReversed] = useState(true);

  const trimmedValue = value ? value?.toString().replace('-', '') : undefined;

  const handleChangeOrdering = (newOrdering: boolean) => {
    const newValue = value?.replace('-', '');
    onChange(newValue ? (newOrdering ? `-${newValue}` : newValue) : null);
    setIsReversed(newOrdering);
  };

  const handleValueChange = (value: string) => {
    onChange(value ? (isReversed ? `-${value}` : value) : null);
  };

  const selectedName = useMemo(() => {
    return trimmedValue ? id2NameMap[trimmedValue as keyof typeof id2NameMap] : undefined;
  }, [trimmedValue]);

  const itemProps = {
    value: trimmedValue,
    onValueChange: handleValueChange,
    isReversed,
    onReversedChange: handleChangeOrdering,
    className,
    renderButton: (children: React.ReactNode) => (
      <SelectOrderingFilterButton isReversed={isReversed}>
        {children ?? selectedName}
      </SelectOrderingFilterButton>
    ),
  };

  return isMobile ? (
    <SelectOrderingFilterBottomSheet {...itemProps} />
  ) : (
    <SelectCatalogOrderingDropdown {...itemProps} />
  );
};
