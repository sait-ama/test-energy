import { useState } from 'react';

import Edit from '@re/ui-kit/icons/edit';
import DeleteIcon from '@re/ui-kit/icons/trash';
import { Button } from '@re/ui-kit/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@re/ui-kit/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@re/ui-kit/ui/dropdown-menu';

import { useDeleteBookmark } from '~entities/user/model/mutations';
import { useUserBookmarksTypes } from '~entities/user/model/queries';
import { BookmarkNotify, BookmarkVisibility } from '~features/bookmark-form/ui/bookmark-form';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { useSession } from '~shared/lib/session/use-session';
import { importToastAsync } from '~shared/ui/toast/toast.async';
import { BookmarkEditForm } from '~widgets/bookmark-form/ui/bookmark-edit';

import { useBookmarkId } from '../model/store';

export const BookmarkEdit = () => {
  const session = useSession()!;

  const { data: bookmarkTypesData } = useUserBookmarksTypes({
    variables: { params: { userId: session.id } },
  });
  const bookmarkTypes = bookmarkTypesData?.results || [];
  const { mutateAsync: deleteBookmark } = useDeleteBookmark();

  const [, setBookmarkId] = useBookmarkId();
  const [bookmarkEditOpenId, setBookmarkEditOpenId] = useState<number | null>(null);

  const handleDeleteBookmark = async (id: number) => {
    try {
      await deleteBookmark({
        data: { bookmark_id: String(id) },
        params: { userId: session.id },
      });
      const toast = await importToastAsync();

      toast.success('Закладка успешно удалена');
      setBookmarkId('1');
    } catch (e) {
      logger.error(e);
      await resolveErrorAsync(e);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button circle color="secondary">
          <Edit className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {bookmarkTypes.map((item) => (
          <DropdownMenuItem key={item.id} className="flex justify-between gap-2" withDialog>
            {item.name}
            <div className="flex gap-2">
              <Dialog
                open={bookmarkEditOpenId === item.id}
                onOpenChange={(value) => setBookmarkEditOpenId(value ? item.id : null)}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    circle
                    disabled={item.is_default && item.id !== 1}
                  >
                    <Edit size={20} />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogTitle>Изменить закладку</DialogTitle>
                  <BookmarkEditForm
                    defaultValues={{
                      name: item.name,
                      is_notify: item.is_notify ? BookmarkNotify.SHOW : BookmarkNotify.HIDE,
                      is_visible: item.is_visible
                        ? BookmarkVisibility.VISIBLE
                        : BookmarkVisibility.HIDDEN,
                      bookmark_id: String(item.id),
                    }}
                    onSuccess={() => setBookmarkEditOpenId(null)}
                  />
                </DialogContent>
              </Dialog>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" circle disabled={item.is_default}>
                    <DeleteIcon size={20} className="text-destructive" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogTitle>Подтвердите действие</DialogTitle>
                  <DialogDescription>
                    Вы действительно хотите удалить закладку &quot;{item.name}
                    &ldquo;?
                  </DialogDescription>
                  <div className="flex justify-end">
                    <Button variant="destructive" onClick={() => handleDeleteBookmark(item.id)}>
                      Удалить
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
