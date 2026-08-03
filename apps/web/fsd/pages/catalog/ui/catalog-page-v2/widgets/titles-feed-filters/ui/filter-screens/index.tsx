'use client';

import { useMemo } from 'react';

import ArrowLeftIcon from '@re/ui-kit/icons/arrow-left';
import { Button } from '@re/ui-kit/ui/button';

import { BaseFilterTypes } from '~shared/lib/filters/model/types';

import { useTitleFiltersField } from '../../../../features/title-filters/model/context';
import type { TitleFiltersSchema } from '../../../../features/title-filters/model/schema';
import {
  CountChaptersRangeFilter,
  IssueYearRangeFilter,
  LastChapterUploadedRangeFilter,
  RatingRangeFilter,
} from '../../../../features/title-filters/ui/filter-range';
import { TitleSearchFilter } from '../../../../features/title-filters/ui/filter-search';
import { useFilterSliderStore } from '../../model/context';
import {
  FilterSlider,
  FilterSliderItem,
  FilterSliderItemUI,
  ResetFiltersButton,
} from './components';
import { FilterBookmarksSelectScreen, FilterSelectContent } from './filter-screens';

type RootScreenProps = {
  presetsButtonSlot?: React.ReactNode;
};

export const RootScreen = (props: RootScreenProps) => {
  const { presetsButtonSlot } = props;

  return (
    <FilterSlider>
      <div className="mt-4 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          {presetsButtonSlot} <ResetFiltersButton className="ml-auto" />
        </div>
      </div>
      <TitleSearchFilter />

      <FilterSliderItem field="types" className="md:hidden" />
      <FilterSliderItem field="genres" />
      <FilterSliderItem field="categories" />
      <FilterSliderItem field="status" />
      <CountChaptersRangeFilter />

      <div />
      <FilterSliderItemUI screen="extended_filters">Расширенная фильтрация</FilterSliderItemUI>
      <FilterSliderItemUI screen="exclude_filters">Исключения</FilterSliderItemUI>
    </FilterSlider>
  );
};

export const ExcludeFiltersScreen = () => {
  const { goBack } = useFilterSliderStore();

  return (
    <FilterSlider>
      <div className="flex items-center justify-start gap-2 pt-4">
        <Button
          variant="ghost"
          size="lg"
          onClick={() => goBack()}
          startIcon={<ArrowLeftIcon className="text-muted-foreground -ml-2" size={20} />}
        >
          Исключения
        </Button>
      </div>
      <FilterSliderItem field="exclude_types" />
      <FilterSliderItem field="exclude_genres" />
      <FilterSliderItem field="exclude_categories" />
      <FilterSliderItem field="exclude_bookmarks" />
    </FilterSlider>
  );
};

export const ExtendedFiltersScreen = () => {
  const { goBack } = useFilterSliderStore();

  return (
    <FilterSlider>
      <div className="flex items-center justify-start gap-2 pt-4">
        <Button
          variant="ghost"
          size="lg"
          onClick={() => goBack()}
          startIcon={<ArrowLeftIcon className="text-muted-foreground -ml-2" size={20} />}
        >
          Расширенная фильтрация
        </Button>
      </div>
      <FilterSliderItem field="translate_status" />
      <FilterSliderItem field="age_limit" />
      <FilterSliderItem field="bookmarks" />
      <RatingRangeFilter />
      <LastChapterUploadedRangeFilter />

      <IssueYearRangeFilter />
    </FilterSlider>
  );
};

export const FilterScreen = ({ field }: { field: keyof TitleFiltersSchema }) => {
  const { schema } = useTitleFiltersField(field);

  const content = useMemo(() => {
    if (schema.name === 'bookmarks' || schema.name === 'exclude_bookmarks') {
      return <FilterBookmarksSelectScreen isExclude={field === 'exclude_bookmarks'} />;
    }
    if (schema.type === BaseFilterTypes.SELECT || schema.type === BaseFilterTypes.MULTISELECT) {
      return (
        <FilterSelectContent
          isMultiSelect={schema.type === BaseFilterTypes.MULTISELECT}
          field={field}
        />
      );
    }
    return null;
  }, [schema, field]);

  return <FilterSlider>{content}</FilterSlider>;
};
