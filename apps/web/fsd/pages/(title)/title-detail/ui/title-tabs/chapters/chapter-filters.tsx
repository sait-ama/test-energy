'use client';

import type { ChangeEventHandler } from 'react';
import { useMemo, useState } from 'react';

import Ordering from '@re/ui-kit/icons/ordering';
import { Button } from '@re/ui-kit/ui/button';

import { ChapterOrdering } from '~shared/api/models/chapter';
import { TestProps } from '~shared/lib/test/utils/test-props';
import { Input } from '~shared/ui/input';
import { debounce } from '~shared/utils/debounce';

import { useCurrentPageSuspenseTitleDetail } from '../../../model/queries';
import { useChapterTabOrdering, useChapterTabQuery } from '../../../model/store';

export interface ChapterFiltersProps {
  onOpenSelectBranch?: () => void;
}

export const ChapterFilters = (props: ChapterFiltersProps) => {
  const { onOpenSelectBranch } = props;

  const [ordering, setOrdering] = useChapterTabOrdering();

  const [query, _setQuery] = useChapterTabQuery();
  const setQuery = useMemo(() => debounce(_setQuery, 300), []);

  const [inputValue, setInputValue] = useState(query);

  const { data: titleData } = useCurrentPageSuspenseTitleDetail();
  const enableBranchSelect = (titleData?.branches.length || 0) > 1;

  const handleQueryChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const { value } = e.target;

    setQuery(value);
    setInputValue(value);
  };

  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-4">
      <Input
        className="bg-secondary/50"
        value={inputValue}
        onChange={handleQueryChange}
        placeholder="Поиск"
        {...TestProps.id('chapter_search_input')}
      />
      {enableBranchSelect ? (
        <Button color="secondary" className="flex-[1_0_auto]" onClick={onOpenSelectBranch}>
          Сменить переводчика
        </Button>
      ) : null}
      <Button
        color="secondary"
        className="bg-secondary/50 flex-[1_0_auto]"
        size="lg"
        endIcon={
          <Ordering
            className="!size-4 transition-all data-[state=reverse]:rotate-180"
            data-state={ordering === ChapterOrdering.ASC ? 'reverse' : 'default'}
          />
        }
        onClick={() => {
          setOrdering(
            ordering === ChapterOrdering.ASC ? ChapterOrdering.DESC : ChapterOrdering.ASC
          );
        }}
        {...TestProps.id('change_sort_btn')}
      >
        {ordering === ChapterOrdering.ASC ? 'Показать с конца' : 'Показать с начала'}
      </Button>
    </div>
  );
};
