import React from 'react';

import { MessageUserSchema } from 'module/chat/model/types';

import { cn } from '@re/ui-kit/utils/cn';

import { Avatar } from '../../ui/avatar';
import { chatMemberRoleToText } from './utils';

export type UserSuggestionItemProps = {
  /** The user */
  entity: {
    itemNameParts: { match: string; parts: string[] };
  } & MessageUserSchema;
};

/**
 * UI component for mentions rendered in suggestion list
 */
const UnMemoizedUserSuggestionItem = ({ entity }: UserSuggestionItemProps) => {
  const hasEntity = !!Object.keys(entity).length;
  const itemParts = entity?.itemNameParts;

  const renderName = () => {
    if (!hasEntity) return null;

    return itemParts.parts.map((part, i) => {
      const matches = part.toLowerCase() === itemParts.match.toLowerCase();

      return (
        <span
          className={cn({
            'text-foreground': matches,
            'text-foreground/90 font-medium': !matches,
          })}
          key={`part-${i}`}
        >
          {part}
        </span>
      );
    });
  };

  return (
    <div className="flex w-full flex-row items-center gap-4">
      <Avatar
        variant="square"
        className="size-8"
        image={entity.avatar?.mid}
        username={entity.username}
      />
      <div className="flex w-full flex-col items-start">
        <span className="font-medium" data-testid="user-item-name">
          {renderName()}
        </span>
        <div className="text-muted-foreground text-[11px]">id {entity.id}</div>
      </div>
      <div className="text-muted-foreground ml-auto text-xs">
        {chatMemberRoleToText(entity.role) || ''}
      </div>
    </div>
  );
};

export const UserSuggestionItem = React.memo(
  UnMemoizedUserSuggestionItem
) as typeof UnMemoizedUserSuggestionItem;
