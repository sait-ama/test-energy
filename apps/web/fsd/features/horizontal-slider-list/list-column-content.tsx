'use client';
import * as React from 'react';

import { HorizontalTitleCard } from '~entities/title/ui/horizontal-title-card';
import { yaMetrika } from '~shared/lib/metrics/yandex-metrika/metrika';
import { getListContentBridge, getTitleContentBridge } from '~shared/lib/title-content-bridge';

interface Props {
  data?: any[];
  blockName?: string;
}

export const ListColumnContent = (props: Props) => {
  const { data, blockName } = props;

  const content = getListContentBridge(data);

  if (!content.length) return null;

  const handleClick = () => {
    if (blockName) {
      yaMetrika.reachGoal(blockName);
    }
  };

  return (
    <div className="flex w-[85vw] flex-col gap-2 sm:w-full">
      {content.slice(0, 5).map((item, index) => (
        <HorizontalTitleCard
          size="xs"
          model={getTitleContentBridge(item)}
          key={index}
          onClick={handleClick}
        />
      ))}
    </div>
  );
};
