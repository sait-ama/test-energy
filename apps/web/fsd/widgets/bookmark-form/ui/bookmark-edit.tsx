import { useTranslations } from 'next-intl';

import { useUpdateBookmark } from '~entities/user/model/mutations';
import type { BookmarkFormProps } from '~features/bookmark-form/ui/bookmark-form';
import { BookmarkForm } from '~features/bookmark-form/ui/bookmark-form';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { useSession } from '~shared/lib/session/use-session';
import { importToastAsync } from '~shared/ui/toast/toast.async';

export interface BookmarkAddFormProps {
  defaultValues: BookmarkFormProps['defaultValues'];
  onSuccess?: (...args: any) => void;
  onError?: (...args: any) => void;
}

export const BookmarkEditForm = (props: BookmarkAddFormProps) => {
  const { onSuccess, onError, defaultValues } = props;
  const { mutateAsync: updateBookmark, isPending } = useUpdateBookmark();
  const session = useSession();
  const t = useTranslations('pages.bookmarks.bookmarks-edit');

  const handleSubmit = async (values) => {
    const toast = await importToastAsync();

    try {
      await updateBookmark({ data: values, params: { userId: session?.id } });

      onSuccess?.();
      toast.success(t('success-message'));
    } catch (e) {
      logger.error(e);
      await resolveErrorAsync(e);
      onError?.();
    }
  };

  return (
    <BookmarkForm
      edit
      onSubmit={handleSubmit}
      isPending={isPending}
      defaultValues={defaultValues}
    />
  );
};
