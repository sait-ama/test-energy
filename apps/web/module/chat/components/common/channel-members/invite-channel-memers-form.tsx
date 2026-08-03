import { useCallback, useState } from 'react';

import { DEFAULT_MAX_CHANNEL_MEMBERS_LIMIT } from 'module/chat/constants/limits';
import { useChannelStateContext } from 'module/chat/context';
import { useInviteChannelMemberMutation } from 'module/chat/model/toolkit/mutations';
import { ChannelMemberSchema, RoleChatUser } from 'module/chat/model/types';
import { toast } from 'sonner';

import { Button } from '@re/ui-kit/ui/button';
import { cn } from '@re/ui-kit/utils/cn';

import { UserSchemaFragment } from '~shared/api/models/user';

import { SearchInput } from '../../ui/input';
import { FriendsSearchResults } from '../user/friends-search-results';
import { UserBadgeItem } from '../user-item/user-badge-item';
type InviteChannelMemersFormProps = {
  channelId?: number;
  onSuccess?: () => void;
  onError?: (error: BackendValidationError) => void;
  className?: string;
  filterUsers?: ChannelMemberSchema[];
  channelMembersLimit?: number;
};

export const InviteChannelMemersForm = (props: InviteChannelMemersFormProps) => {
  const {
    channelId: propsChannelId,
    className,
    filterUsers,
    channelMembersLimit = DEFAULT_MAX_CHANNEL_MEMBERS_LIMIT,
  } = props;
  const { channel } = useChannelStateContext();
  const channelId = propsChannelId || channel.id;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<UserSchemaFragment[]>([]);

  const handleUserSelect = useCallback(
    (userId: number, user: UserSchemaFragment) => {
      setSelectedUsers((prev) => {
        if (prev.length + (filterUsers?.length ?? 0) >= channelMembersLimit) {
          toast.error(`Вы не можете добавить больше ${channelMembersLimit} участников`);
          return;
        }

        return prev.some((u) => u.id === user.id) ? prev : [...prev, user];
      });
    },
    [filterUsers, channelMembersLimit]
  );

  const getIsSelectedFn = (user: UserSchemaFragment) => {
    return selectedUsers.some((u) => u.id === user.id);
  };

  const { mutate: inviteChannelMember, isPending } = useInviteChannelMemberMutation(channelId, {
    onSuccess: () => {
      setSelectedUsers([]);
      toast.success('Участники успешно добавлены');
      props.onSuccess?.();
    },
    onError: (error) => {
      toast.error('Произошла ошибка при добавлении участников');
      props.onError?.(error);
    },
  });

  const handleInviteChannelMember = () => {
    if (selectedUsers.length === 0) {
      return;
    }

    inviteChannelMember({
      user_ids: selectedUsers.map((user) => user.id),
      role: RoleChatUser.MEMBER,
    });
  };

  const removeSelectedUser = (user: UserSchemaFragment) => {
    setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
  };

  return (
    <div className={cn('flex flex-col', className)}>
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
        filterUsers={filterUsers}
      />

      <div className="mt-auto">
        {selectedUsers.length > 0 && (
          <div className="flex flex-wrap gap-2 border-t px-2 py-2">
            {selectedUsers.map((user) => (
              <UserBadgeItem key={user.id} user={user} onRemove={() => removeSelectedUser(user)} />
            ))}
          </div>
        )}

        <div className="border-t p-4">
          <Button
            className="w-full"
            disabled={selectedUsers.length === 0 || isPending}
            onClick={handleInviteChannelMember}
          >
            {isPending ? '...' : 'Продолжить'}
          </Button>
        </div>
      </div>
    </div>
  );
};
