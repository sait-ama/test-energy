'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';

import Like from '@re/ui-kit/icons/like';
import { cn } from '@re/ui-kit/utils/cn';

import { useLikeAppereance } from '~features/like-appereance/model/store';
import { useIsClient } from '~shared/hooks/use-is-client';

export const ReaderLikeAppereanceAnimation = () => {
  const { liked } = useLikeAppereance();
  const client = useIsClient();

  if (!client) return null;

  return createPortal(
    <div
      className={cn(
        'heart-icon fixed top-0 left-0 flex h-full w-full items-center justify-center opacity-0 transition-opacity duration-1000 ease-in-out',
        {
          'liked z-[3] opacity-100': liked,
        }
      )}
    >
      <Like className={cn('h-[20%] w-[20%] fill-current text-red-700')} />
      <style jsx>{`
        .heart-icon.liked {
          animation: likeAnimation 0.5s ease-in-out;
        }

        @keyframes likeAnimation {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>,
    document.body
  );
};
