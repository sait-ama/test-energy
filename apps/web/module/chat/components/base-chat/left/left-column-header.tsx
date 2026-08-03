import { memo } from 'react';

import { useChannelSearchContext } from '../../../context';
import { ChannelSearchInput } from '../../common/channel-search';
import { NewChannelButton } from './new-channel-button';

const LeftColumnHeader = memo(({ noLabel = false }: { noLabel?: boolean }) => {
  const { isSearchOpen } = useChannelSearchContext();

  if (noLabel) {
    return (
      <div className="flex w-full flex-row items-center gap-2 px-4 py-4 transition-all duration-300">
        <ChannelSearchInput />
        {!isSearchOpen && <NewChannelButton />}
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center gap-2 px-4 pt-2 pb-4">
      <div className="flex h-[50px] w-full flex-row items-center justify-between gap-4 pl-2">
        <div className="w-full" />
        <div className="text-lg font-semibold">Чаты</div>
        <div className="flex w-full justify-end">
          <NewChannelButton />
        </div>
      </div>
      <ChannelSearchInput />
    </div>
  );
});

export { LeftColumnHeader };
