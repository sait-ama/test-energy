import { useCallback, useState } from 'react';

import ArrowLeft from '@re/ui-kit/icons/arrow-left';
import { Button } from '@re/ui-kit/ui/button';
import { cn } from '@re/ui-kit/utils/cn';

import { useGetOrCreateChatWithUserMutation } from '../../../model/toolkit/mutations';
import { ChannelSchema } from '../../../model/types';
import { SearchInput } from '../../ui/search-input';
import { FriendsSearchResults } from '../user/friends-search-results';
type NewChatViewProps = {
  className?: string;
  onCreateChat?: (id: number, channel: ChannelSchema) => void;
  onBack?: () => void;
  onUserSelect?: (userId: number) => void;
};

const NewChatView = ({ className, onCreateChat, onBack, onUserSelect }: NewChatViewProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const { mutate: createChat, isPending: isCreatingChat } = useGetOrCreateChatWithUserMutation({
    onSuccess: (data) => {
      onCreateChat?.(data.id, data);
    },
  });

  const handleUserSelect = useCallback(
    async (userId: number) => {
      onUserSelect?.(userId);
      // TODO: create channel
      createChat({ userId });
    },
    [onUserSelect, createChat]
  );

  const handleBack = () => {
    onBack?.();
  };

  return (
    <div className={cn('flex h-full flex-col', isCreatingChat && 'opacity-70', className)}>
      <div className="flex items-center gap-2 p-4">
        <div className="flex-1">
          <Button variant="ghost" circle onClick={handleBack}>
            <ArrowLeft size={20} />
          </Button>
        </div>
        <div className="text-lg font-semibold">Новое сообщение</div>
        <div className="flex-1" />
      </div>

      <div className="px-4 pb-2">
        <SearchInput
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Поиск пользователей"
        />
      </div>

      <FriendsSearchResults
        className="flex flex-1 flex-col"
        onItemClick={handleUserSelect}
        searchQuery={searchQuery}
      />
    </div>
  );
};

NewChatView.displayName = 'NewChatView';

export { NewChatView };
