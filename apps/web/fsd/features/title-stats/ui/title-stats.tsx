import type { ReactNode } from 'react';

import Bookmarks from '@re/ui-kit/icons/bookmarks';

import { EntityLayoutStatsItem, EntityLayoutStatsRoot } from '~shared/ui/entity-layout';

export const TitleStatsContainer = EntityLayoutStatsRoot;

interface TitleStatItemProps {
  children: ReactNode;
}

export const TitleBookmarksStatItem = (props: TitleStatItemProps) => {
  const { children } = props;
  return <EntityLayoutStatsItem icon={Bookmarks} label="Закладок" value={children} />;
};
