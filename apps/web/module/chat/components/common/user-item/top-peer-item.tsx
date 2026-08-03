import { memo } from 'react';

import { Avatar } from '../../ui/avatar';

type TopPeerContent = {
  /** Id of the user */
  id: number;
  /** Image of the user */
  avatar?: {
    mid?: string;
    high?: string;
    low?: string;
  };
  /** Name of the user */
  username: string;
};

export type TopPeerItemProps = {
  /** The user */
  entity: TopPeerContent;
  onClick?: (id: number) => void;
};

/**
 * UI component for mentions rendered in suggestion list
 */
const UnMemoizedTopPeerItem = ({ entity, onClick }: TopPeerItemProps) => {
  return (
    <button
      className="flex flex-col items-center space-y-1 transition-opacity hover:opacity-80"
      onClick={() => onClick?.(entity.id)}
    >
      <Avatar image={entity.avatar?.mid} username={entity.username} className="h-14 w-14" />
      <span className="max-w-[60px] truncate text-xs">{entity.username}</span>
    </button>
  );
};

export const TopPeerItem = memo(UnMemoizedTopPeerItem);
