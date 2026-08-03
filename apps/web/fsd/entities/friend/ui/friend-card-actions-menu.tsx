import React, { memo } from 'react';

import DotsVertical from '@re/ui-kit/icons/dots-vertical';
import { Button } from '@re/ui-kit/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@re/ui-kit/ui/dropdown-menu';

import { useFriendShipActionStore } from '~entities/friend/model/friend-actions-context';
import { logger } from '~shared/lib/logger';

export const FriendCardActionsMenu = memo(
  ({ friendId, className }: { className?: string; friendId?: NumberIsomorphic }) => {
    try {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { makeAction, actions } = useFriendShipActionStore();

      if (!actions.length) return null;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger className={className} asChild>
            {/*@ts-ignore*/}
            <Button circle size="sm" variant="secondary">
              <DotsVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {actions.map((action, key) => (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  makeAction(action, friendId!);
                }}
                key={key}
                className="flex justify-between gap-2"
              >
                {action.text}
                {action.icon}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    } catch (e) {
      logger.error(e);
      return null;
    }
  }
);
