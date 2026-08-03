import { memo } from 'react';

import ArrowLeft from '@re/ui-kit/icons/arrow-left';
import { Button } from '@re/ui-kit/ui/button';
import { cn } from '@re/ui-kit/utils/cn';

import { UserSchemaFragment } from '~shared/api/models/user';

import { useNewChannelGroupContext } from '../../../context/new-channel-group-context';
import { SearchInput } from '../../ui/search-input';
import { FriendsSearchResults } from '../user/friends-search-results';
import { UserBadgeItem } from '../user-item';

type ChannelGroupUserSelectionStepProps = {
  className?: string;
  onBack?: () => void;
};

const ChannelGroupUserSelectionStep = memo(
  ({ className, onBack }: ChannelGroupUserSelectionStepProps) => {
    const {
      selectedUsers,
      searchQuery,
      setSearchQuery,
      addSelectedUser,
      removeSelectedUser,
      nextStep,
    } = useNewChannelGroupContext('ChannelGroupUserSelectionStep');

    const handleUserSelect = (_userId: number, user: UserSchemaFragment) => {
      if (selectedUsers.find((u) => u.id === user.id)) {
        removeSelectedUser(user);
      } else {
        addSelectedUser(user);
      }
    };

    const getIsSelectedFn = (user: UserSchemaFragment) => {
      return selectedUsers.some((u) => u.id === user.id);
    };

    return (
      <div className={cn('flex h-full flex-col', className)}>
        <div className="flex items-center gap-2 p-4">
          <Button variant="ghost" circle onClick={onBack}>
            <ArrowLeft size={20} />
          </Button>
          <div className="text-lg font-semibold">Добавить участников</div>
        </div>

        <div className="px-4 pb-2">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Поиск пользователей"
          />
        </div>

        <FriendsSearchResults
          className="pb-4"
          onItemClick={handleUserSelect}
          searchQuery={searchQuery}
          getIsSelectedFn={getIsSelectedFn}
        />

        <div className="mt-auto">
          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-2 border-t px-2 py-2">
              {selectedUsers.map((user) => (
                <UserBadgeItem
                  key={user.id}
                  user={user}
                  onRemove={() => removeSelectedUser(user)}
                />
              ))}
            </div>
          )}

          <div className="border-t p-4">
            <Button className="w-full" disabled={selectedUsers.length === 0} onClick={nextStep}>
              Продолжить
            </Button>
          </div>
        </div>
      </div>
    );
  }
);

ChannelGroupUserSelectionStep.displayName = 'ChannelGroupUserSelectionStep';

export { ChannelGroupUserSelectionStep };
