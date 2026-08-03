import type { TitleDetailSchema } from '~shared/api/models/title';

import type { TitleDetailPageTabs } from './const';

export type TitleDetailPageParams = {
  dir: string;
  tab: TitleDetailPageTabs;
};

export interface TitleDetailPageServerContext {
  title: TitleDetailSchema;
  params: TitleDetailPageParams;
}
