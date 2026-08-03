import type { TitleFiltersSchema } from '~pages/catalog/ui/catalog-page-v2/features/title-filters/model/schema';
import type { FilterValue } from '~shared/lib/filters';

export type TitleFiltersPreset = {
  [K in keyof TitleFiltersSchema]?: FilterValue<TitleFiltersSchema[K]>;
};

export type Preset = {
  name: string;
  filters: TitleFiltersPreset;
  isCustom?: boolean;
};
