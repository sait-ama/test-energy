import React from 'react';

import Check from '@re/ui-kit/icons/check';
import { cn } from '@re/ui-kit/utils/cn';

import { UserSchemaFragment } from '~shared/api/models/user';

import { Avatar } from '../../ui/avatar';

export type UserListItemProps = {
  /** The user */
  entity: UserSchemaFragment;
  onItemClick?: (userId: number, user: UserSchemaFragment) => void;
  isSelected?: boolean;
  className?: string;
};

const UnMemoizedUserListItem = ({
  entity,
  onItemClick,
  isSelected = false,
  className,
}: UserListItemProps) => {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-sm border-2 border-transparent p-1.5 pr-2.5 pl-1.5 transition-colors duration-200',
        isSelected && 'bg-accent/20',
        onItemClick && 'hover:bg-accent/50 cursor-pointer',
        className
      )}
      onClick={() => onItemClick?.(entity.id, entity)}
    >
      <Avatar className={cn('size-12')} image={entity.avatar?.mid} username={entity.username} />
      <div className="text-md font-semibold">{entity.username}</div>
      {isSelected && (
        <div className="bg-primary ml-auto flex aspect-square size-6 items-center justify-center rounded-[4px] text-sm">
          <Check size={32} />
        </div>
      )}
    </div>
  );
};

export const UserListItem = React.memo(UnMemoizedUserListItem) as typeof UnMemoizedUserListItem;
