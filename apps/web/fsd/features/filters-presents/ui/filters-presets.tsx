import type { MouseEvent, ReactNode } from 'react';
import isEqual from 'react-fast-compare';
import { useFormContext } from 'react-hook-form';

import dayjs from 'dayjs';

import Close from '@re/ui-kit/icons/close';
import { Button } from '@re/ui-kit/ui/button';
import { ScrollArea, ScrollBar } from '@re/ui-kit/ui/scroll-area';

import type { CatalogTitleQuerySchema } from '~shared/api/models/title';
import { CatalogTitleOrderingSchema } from '~shared/api/models/title';
import { useLocalStorageState } from '~shared/hooks/use-local-storage-state';
import { isJson } from '~shared/utils/is-json';
import { parseJson } from '~shared/utils/parse-json';

export interface Preset {
  name: string;
  filters: Partial<CatalogTitleQuerySchema>;
}

const defaultPresets: Preset[] = [
  {
    name: 'Фэнтези на каждый день',
    filters: {
      ordering: CatalogTitleOrderingSchema.CHAPTER_DATE_DESC,
      genres: ['38'],
      rating_gte: '8',
      status: ['2'],
      exclude_genres: ['28', '42', '40'],
      exclude_categories: ['63'],
      issue_year_gte: `${dayjs().year() - 2}`,
      count_chapters_lte: '200',
      count_chapters_gte: '20',
      exclude_types: ['3', '4', '6'],
    },
  },
  {
    name: 'Лучшее для леди',
    filters: {
      exclude_genres: ['30', '33', '39', '19'],
      issue_year_gte: `${dayjs().year() - 4}`,
      count_chapters_gte: '20',
      rating_gte: '9',
      genres: ['28'],
      exclude_types: ['3'],
    },
  },
  {
    name: 'Для самых романтичных',
    filters: {
      ordering: CatalogTitleOrderingSchema.CHAPTER_DATE_DESC,
      status: ['2'],
      exclude_genres: ['30', '33', '40', '42'],
      exclude_categories: ['64'],
      issue_year_gte: `${dayjs().year() - 2}`,
      count_chapters_gte: '20',
      count_chapters_lte: '200',
      rating_gte: '8.5',
      genres: ['25', '30'],
      exclude_types: ['2', '4', '3', '6'],
    },
  },

  // {
  //     name: 'Лучшее для леди',
  //     filters: {
  //         exclude_genres: ['30', '33', '39', '19'],
  //         issue_year_gte: `${dayjs().year() - 4}`,
  //         count_chapters_gte: '20',
  //         rating_gte: '9',
  //         genres: ['28'],
  //         exclude_types: ['2'],
  //     },
  // },
];

interface FiltersPresetsProps {}

export const FiltersPresets = (props: FiltersPresetsProps) => {
  const { setValue, getValues, reset } = useFormContext<CatalogTitleQuerySchema>();
  const [presentString, setPresetString] = useLocalStorageState<string>('user-presets');
  const customPresets = isJson(presentString) ? parseJson<Preset[]>(presentString!)! : [];

  const handleChange = (filters: Preset['filters']) => {
    reset();

    for (const key in filters) {
      const value = filters[key];
      // @ts-ignore
      setValue(key, value);
    }
  };

  const isActivePreset = (filters: Preset['filters']) => {
    const values = getValues();

    for (const key in filters) {
      if (!isEqual(filters[key], values[key])) {
        return false;
      }
    }

    return true;
  };

  interface PresetProps {
    preset: Preset;
    action?: ReactNode;
  }

  const PresetComponent = (props: PresetProps) => {
    const { preset, action } = props;

    return (
      <Button
        key={preset.name}
        variant={isActivePreset(preset.filters) ? 'default' : 'secondary'}
        onClick={() => {
          handleChange(preset.filters);
        }}
        data-testid="catalog-preset"
      >
        {preset.name}
        {action}
      </Button>
    );
  };

  const handleDelete = (e: MouseEvent<SVGSVGElement>, name: string) => {
    e.stopPropagation();

    setPresetString(JSON.stringify(customPresets.filter((it) => it.name !== name)));
  };

  return (
    <ScrollArea>
      <div className="flex flex-nowrap gap-2" data-testid="catalog-presents-container">
        {defaultPresets.map((it) => (
          <PresetComponent key={it.name} preset={it} />
        ))}
        {/*!customPresets.length ? info todo!*/}
        {customPresets.map((it) => (
          <PresetComponent
            key={it.name}
            preset={it}
            action={
              <Close
                className="text-muted-foreground hover:text-destructive transition-all"
                data-testid="catalog-preset-delete"
                onClick={(e) => {
                  handleDelete(e, it.name);
                }}
              />
            }
          />
        ))}
      </div>

      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};
