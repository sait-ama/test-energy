'use client';

import { useTopParams } from '~entities/top/model/hooks';
import { TopTabSchemaFragment } from '~shared/api/models/top';

export const TopTitle = ({ tabs }: { tabs: TopTabSchemaFragment[] }) => {
  const { tab } = useTopParams();

  return tabs.find((t) => `${t.id}` === `${tab}`)?.label ?? 'Всех тайтлов';
};
