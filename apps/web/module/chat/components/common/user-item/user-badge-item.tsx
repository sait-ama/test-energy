import React from 'react';

import Close from '@re/ui-kit/icons/close';
import { cn } from '@re/ui-kit/utils/cn';

import { UserSchemaFragment } from '~shared/api/models/user';

import { Avatar } from '../../ui/avatar';

const UnMemoizedUserBadgeItem = ({
  user,
  onRemove,
  className,
}: {
  user: UserSchemaFragment;
  onRemove?: () => void;
  className?: string;
}) => {
  return (
    <div
      role="button"
      className={cn(
        'group bg-secondary flex items-center gap-2 rounded-full p-1 pr-3 transition-colors duration-200',
        onRemove && 'cursor-pointer hover:bg-red-500/20',
        className
      )}
      onClick={onRemove}
    >
      <div className="relative rounded-full">
        <Avatar className="size-6" image={user.avatar?.mid} username={user.username} />
        <div className="absolute top-0 right-0 hidden h-full w-full items-center justify-center rounded-full bg-red-500 group-hover:flex">
          <Close size={20} />
        </div>
      </div>
      <div className="text-sm font-medium">{user.username}</div>
    </div>
  );
};

export const UserBadgeItem = React.memo(UnMemoizedUserBadgeItem);
