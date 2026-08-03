'use client';
import type { ComponentProps } from 'react';

import { useQuery } from '@tanstack/react-query';

import { cn } from '@re/ui-kit/utils/cn';

import { getSuspenseUserQuery } from '~entities/user/model/queries';
import { useSession } from '~shared/lib/session/use-session';

export const UserOnline = ({
  className,
  size,
  userId,
  margin,
  ...other
}: ComponentProps<'div'> & { userId: NumberIsomorphic; size: number; margin: number }) => {
  const sessionId = useSession((v) => v?.id);
  let is_online = useQuery({
    ...getSuspenseUserQuery({ variables: { params: { userId } } }),
    enabled: !!userId,
    select: (v) => v.is_online,
  })?.data!;
  if (sessionId === userId) {
    is_online = true;
  }
  // if (is_online === undefined) return null;
  const sizePoint = size <= 80 ? 2 : 3;
  const sizeBorder = size <= 80 ? 4 : 8;
  return (
    <div
      style={{ transform: `translate(${margin * 0.75}, ${margin * 0.75})` }}
      className={cn(
        `bg-background/60 flex size-${sizeBorder} absolute -right-3 -bottom-3 z-[101] mt-1 items-center justify-center rounded-full`,
        className
      )}
    >
      <div
        className={cn(
          `size-${sizePoint} rounded-full`,
          { 'bg-success': is_online },
          { 'bg-[#626262]': !is_online }
        )}
      ></div>
    </div>
  );
};
