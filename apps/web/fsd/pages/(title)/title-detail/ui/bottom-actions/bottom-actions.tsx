'use client';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import Bookmarks from '@re/ui-kit/icons/bookmarks';
import { Button } from '@re/ui-kit/ui/button';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { ActionButtons } from '~pages/(title)/title-detail/ui/title-cover-block/action-buttons';
import { BookmarkButton } from '~pages/(title)/title-detail/ui/title-cover-block/bookmark-button';
import { ReadButton } from '~pages/(title)/title-detail/ui/title-cover-block/read-button';

export const BottomActions = () => {
  return (
    <ErrorBoundary fallback={null}>
      <div className="z-[49] w-dvw">
        <div className="z-[49] mx-auto flex w-dvw justify-between gap-2 !px-2 sm:max-w-[60dvw]">
          <Suspense fallback={null}>
            <ReadButton className="order-2 flex-[1_0_auto] md:order-1" />
          </Suspense>
          <Suspense fallback={null}>
            <BookmarkButton>
              {({ children, disabled, bookmarkType }) => (
                <Button
                  disabled={disabled}
                  circle
                  className={cn('order-3 h-12 min-w-12 md:order-2 md:h-9 md:min-w-9 md:p-4')}
                >
                  <ReText component="span" className="hidden md:inline" color="primary-foreground">
                    {children}
                  </ReText>
                  <Bookmarks className={cn({ 'fill-current': bookmarkType })} />
                </Button>
              )}
            </BookmarkButton>
          </Suspense>
          <Suspense fallback={null}>
            <ActionButtons className="order-1 md:order-3" />
          </Suspense>
        </div>
      </div>
    </ErrorBoundary>
  );
};
