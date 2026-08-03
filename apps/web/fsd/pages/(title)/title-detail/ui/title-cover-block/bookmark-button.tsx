'use client';
import type { ReactNode } from 'react';
import { Suspense, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { Button } from '@re/ui-kit/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@re/ui-kit/ui/dropdown-menu';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import {
  useAddTitleToBookmarks,
  useRemoveTitleFromBookmarks,
} from '~entities/title/model/mutations';
import { TitleKeys } from '~entities/title/model/query-keys';
import { useUserBookmarksTypes } from '~entities/user/model/queries';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { useLoggedCheck } from '~shared/lib/session/use-logged';
import { useSession } from '~shared/lib/session/use-session';
import { TestProps } from '~shared/lib/test/utils/test-props';

import { useCurrentPageSuspenseTitleDetail } from '../../model/queries';

export interface BookmarkButtonProps {
  children: (props: {
    disabled: boolean;
    children: ReactNode;
    bookmarkType: number | null;
  }) => ReactNode;
}

export const BookmarkButtonNoSuspense = (props: BookmarkButtonProps) => {
  const { children } = props;

  const session = useSession()!;
  const checkLogged = useLoggedCheck();
  const queryClient = useQueryClient();

  const { data: bookmarkTypesData } = useUserBookmarksTypes(
    { variables: { params: { userId: session?.id } } },
    {
      enabled: !!session?.id,
      retry: false,
    }
  );
  const { data: titleData } = useCurrentPageSuspenseTitleDetail();

  const [open, _setOpen] = useState(false);
  const setOpen = (value: boolean) => {
    if (value) {
      checkLogged(() => {
        _setOpen(true);
      })();
    } else {
      _setOpen(false);
    }
  };

  const bookmarkTypes = bookmarkTypesData?.results || [];
  const bookmarkType = titleData?.bookmark_type ? Number(titleData.bookmark_type) : null;
  const label =
    (bookmarkType && bookmarkTypes.find((v) => v.id == Number(bookmarkType))?.name) || 'В закладки';

  const { mutateAsync: addToBookmarks, isPending: isAddToBookmarksPending } =
    useAddTitleToBookmarks();
  const { mutateAsync: removeFromBookmarks, isPending: isRemoveFromBookmarksPending } =
    useRemoveTitleFromBookmarks();

  const isPending = isAddToBookmarksPending || isRemoveFromBookmarksPending;

  const handleChange = async (bookmarkId: number) => {
    try {
      if (bookmarkId === -1) {
        await removeFromBookmarks({ title: String(titleData?.id!) });
      } else {
        await addToBookmarks({ title: titleData?.id!, type: bookmarkId });
      }

      queryClient.setQueryData(TitleKeys.retrieve({ params: { dir: titleData!.dir } }), (data) => {
        return { ...data, bookmark_type: bookmarkId === -1 ? null : bookmarkId };
      });
    } catch (e) {
      logger.error(e);
      await resolveErrorAsync(e);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger {...TestProps.id(`add_to_bookmarks`)} asChild>
        {children({
          disabled: isPending,
          children: label,
          bookmarkType,
        })}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {bookmarkTypes.map((bookmark, idx) => (
          <DropdownMenuItem
            {...TestProps.id(`btn_${idx + 1}`)}
            key={bookmark.id}
            onClick={() => handleChange(bookmark.id)}
            className={cn(bookmarkType === bookmark.id && 'bg-primary text-primary-foreground')}
          >
            {bookmark.name}
          </DropdownMenuItem>
        ))}
        {bookmarkType ? (
          <DropdownMenuItem
            {...TestProps.id(`remove_from_bookmarks_btn`)}
            onClick={() => handleChange(-1)}
          >
            Удалить из закладок
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const BookmarkButton = (props: BookmarkButtonProps) => {
  return (
    <Suspense fallback={null}>
      <BookmarkButtonNoSuspense {...props} />
    </Suspense>
  );
};

export const BookmarkButtonTitlePage = () => {
  return (
    <BookmarkButtonNoSuspense>
      {({ children, disabled }) => (
        <Button
          {...TestProps.id(`add_to_bookmarks`)}
          disabled={disabled}
          circle
          className={cn('order-2 h-9 min-w-9 p-4')}
        >
          <ReText component="span" size="sm" color="primary-foreground">
            {children}
          </ReText>
        </Button>
      )}
    </BookmarkButtonNoSuspense>
  );
};
